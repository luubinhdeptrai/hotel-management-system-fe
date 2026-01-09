# Nghiệp Vụ Check-in - Backend (roommaster-be)

## 📋 Mục Lục
1. [Tổng Quan Nghiệp Vụ Check-in](#1-tổng-quan-nghiệp-vụ-check-in)
2. [Các Trường Hợp Check-in](#2-các-trường-hợp-check-in)
3. [Chi Tiết Xử Lý Từng Trường Hợp](#3-chi-tiết-xử-lý-từng-trường-hợp)
4. [Dữ Liệu Cần Điền](#4-dữ-liệu-cần-điền)
5. [Luồng Xử Lý Backend](#5-luồng-xử-lý-backend)
6. [Validation & Business Rules](#6-validation--business-rules)
7. [API Endpoints](#7-api-endpoints)

---

## 1. Tổng Quan Nghiệp Vụ Check-in

### 🎯 Mục Đích
Check-in là bước **xác nhận khách đến nhận phòng**, chuyển đổi từ trạng thái **đã đặt** sang **đang ở**.

### 📊 Luồng Cơ Bản
```
Booking (CONFIRMED) 
    → Employee chọn rooms + assign customers
    → Backend validates & updates
    → BookingRoom (CHECKED_IN) + Room (OCCUPIED)
    → Tạo BookingCustomer records
    → Log activity
```

### 🔑 Đặc Điểm Quan Trọng
- ✅ **Partial Check-in:** Có thể check-in 1 số phòng, phòng khác check-in sau
- ✅ **Multi-guest Support:** Mỗi phòng có thể có nhiều khách (VD: Room 101 → 2 khách)
- ✅ **Auto Status Update:** Khi TẤT CẢ phòng checked-in → Booking status = CHECKED_IN
- ✅ **Activity Logging:** Mỗi lần check-in được ghi log audit trail

---

## 2. Các Trường Hợp Check-in

### 🏨 Case 1: Check-in Booking Đã Đặt Trước (Normal Flow)
**Mô tả:** Khách đã đặt phòng online/phone trước đó, đến nhận phòng đúng hẹn.

**Điều kiện:**
- ✅ Booking tồn tại với status = `CONFIRMED`
- ✅ BookingRoom status = `CONFIRMED`
- ✅ Đã thanh toán deposit (nếu yêu cầu)

**Quy trình:**
1. Employee tìm booking theo mã hoặc thông tin khách
2. Chọn rooms cần check-in (có thể 1 hoặc nhiều phòng)
3. Assign customers vào từng phòng
4. System validates và check-in

---

### 🏨 Case 2: Partial Check-in (Chia Đợt)
**Mô tả:** Booking có nhiều phòng, nhưng chỉ check-in một số phòng trước.

**Ví dụ:**
- Booking có 3 phòng: 101, 102, 103
- Check-in ngay: Room 101, 102
- Check-in sau: Room 103 (khách đến muộn)

**Điều kiện:**
- ✅ Ít nhất 1 room phải status = `CONFIRMED`
- ✅ Không bắt buộc check-in hết tất cả phòng cùng lúc

**Xử lý:**
- Chỉ update status của rooms được chọn
- Các rooms khác vẫn giữ status `CONFIRMED`
- Booking status chỉ chuyển sang `CHECKED_IN` khi **ALL rooms checked-in**

---

### 🏨 Case 3: Walk-in (Khách Đến Trực Tiếp - Không Đặt Trước)
**Mô tả:** Khách đến khách sạn trực tiếp, không có booking trước.

**Điều kiện:**
- ✅ Có phòng trống (status = `AVAILABLE`)
- ✅ Employee tạo booking + check-in ngay

**Quy trình:**
1. Employee nhập thông tin khách mới
2. Chọn phòng trống
3. Tạo booking + check-in trong 1 transaction
4. Status trực tiếp là `CHECKED_IN` (bỏ qua PENDING/CONFIRMED)

**⚠️ Lưu ý:** Backend CHƯA CÓ API riêng cho walk-in. Hiện tại phải:
- Tạo customer mới (nếu chưa có)
- Tạo booking qua `POST /employee/bookings`
- Sau đó check-in qua `POST /employee/bookings/check-in`

---

### 🏨 Case 4: Early Check-in (Nhận Phòng Sớm)
**Mô tả:** Khách đến trước giờ check-in quy định (thường là 14:00).

**Điều kiện:**
- ✅ Phòng đã sẵn sàng (AVAILABLE hoặc đã dọn xong)
- ✅ Có thể phát sinh phí early check-in

**Xử lý:**
- Giống normal check-in
- **Backend tự động tính phí early check-in** (nếu có cấu hình trong AppSettings)
- Phí được ghi vào transaction

---

### 🏨 Case 5: Late Check-in (Nhận Phòng Muộn)
**Mô tả:** Khách đến sau giờ check-in quy định nhưng trước check-out date.

**Điều kiện:**
- ✅ Booking vẫn còn hiệu lực
- ✅ Phòng vẫn còn giữ (status = `RESERVED`)

**Xử lý:**
- Check-in bình thường
- Không phát sinh phí bổ sung
- Backend ghi lại `actualCheckIn` time

---

## 3. Chi Tiết Xử Lý Từng Trường Hợp

### 📝 Case 1: Normal Check-in

**Input Data:**
```typescript
{
  checkInInfo: [
    {
      bookingRoomId: "br_001",  // ID phòng trong booking
      customerIds: ["cust_001", "cust_002"]  // Khách ở phòng này
    },
    {
      bookingRoomId: "br_002",
      customerIds: ["cust_003"]
    }
  ]
}
```

**Backend Processing:**
1. **Validate:**
   - Tất cả `bookingRoomId` tồn tại
   - Tất cả BookingRoom có status = `CONFIRMED`
   - Tất cả `customerIds` tồn tại trong database

2. **Update Database (Transaction):**
   ```sql
   -- 1. Update BookingRoom
   UPDATE booking_room 
   SET status = 'CHECKED_IN', actual_check_in = NOW() 
   WHERE id IN (...)
   
   -- 2. Update Room
   UPDATE room 
   SET status = 'OCCUPIED' 
   WHERE id IN (...)
   
   -- 3. Create BookingCustomer (link khách với phòng)
   INSERT INTO booking_customer (booking_id, customer_id, booking_room_id)
   VALUES (...)
   
   -- 4. Check if all rooms checked in
   IF (all rooms CHECKED_IN) THEN
     UPDATE booking SET status = 'CHECKED_IN'
   END IF
   ```

3. **Activity Logging:**
   ```typescript
   activityService.createCheckInActivity(
     bookingRoomId, 
     employeeId, 
     roomNumber
   )
   ```

**Output:**
```typescript
{
  bookingRooms: [
    {
      id: "br_001",
      status: "CHECKED_IN",
      actualCheckIn: "2026-01-09T14:30:00Z",
      room: { roomNumber: "101", status: "OCCUPIED" },
      bookingCustomers: [
        { customer: { fullName: "John", phone: "..." } },
        { customer: { fullName: "Mary", phone: "..." } }
      ]
    }
  ]
}
```

---

### 📝 Case 2: Partial Check-in

**Ví dụ Thực Tế:**
```
Booking ID: BK123
- Room 101 (br_001): Check-in ngay ✅
- Room 102 (br_002): Check-in ngay ✅
- Room 103 (br_003): Khách chưa đến, check-in sau ⏳
```

**Request:**
```json
{
  "checkInInfo": [
    { "bookingRoomId": "br_001", "customerIds": ["cust_001"] },
    { "bookingRoomId": "br_002", "customerIds": ["cust_002"] }
  ]
}
```

**Backend Logic:**
```typescript
// After check-in br_001, br_002:
const allBookingRooms = await prisma.bookingRoom.findMany({
  where: { bookingId: "BK123" }
});

const allCheckedIn = allBookingRooms.every(
  br => br.status === 'CHECKED_IN'
);

if (!allCheckedIn) {
  // Booking vẫn CONFIRMED (vì còn br_003 chưa check-in)
  booking.status = 'CONFIRMED';
} else {
  booking.status = 'CHECKED_IN';
}
```

**Kết Quả:**
- Room 101, 102: `CHECKED_IN` ✅
- Room 103: vẫn `CONFIRMED` ⏳
- Booking: vẫn `CONFIRMED` (chờ room 103)

---

### 📝 Case 3: Walk-in (Tạo Booking + Check-in)

**⚠️ Hiện Trạng:**
Backend chưa có API riêng cho walk-in one-step. Cần gọi 2 API:

**Bước 1: Tạo Booking**
```http
POST /employee/bookings
{
  "customer": {
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567",
    "idNumber": "012345678901",
    "email": "a@example.com"
  },
  "rooms": [
    { "roomTypeId": "rt_001", "count": 1 }
  ],
  "checkInDate": "2026-01-09T14:00:00Z",
  "checkOutDate": "2026-01-10T12:00:00Z",
  "totalGuests": 2
}
```

**Response:**
```json
{
  "bookingId": "booking_123",
  "bookingCode": "BK17361234ABCD",
  "booking": {
    "bookingRooms": [
      { "id": "br_001", "roomId": "room_101" }
    ]
  }
}
```

**Bước 2: Check-in Ngay**
```http
POST /employee/bookings/check-in
{
  "checkInInfo": [
    {
      "bookingRoomId": "br_001",
      "customerIds": ["cust_001"]  // Customer ID từ bước 1
    }
  ]
}
```

**🔧 Đề Xuất:** Cần tạo endpoint riêng `POST /employee/bookings/walk-in` để làm cả 2 bước trong 1 request.

---

### 📝 Case 4 & 5: Early/Late Check-in

**Processing:**
- **Giống normal check-in** về mặt technical
- **Khác biệt:**
  - Backend tự động detect early check-in (so sánh với AppSettings.checkInTime)
  - Tính phí bổ sung nếu có
  - Ghi chú vào transaction

**Example Transaction:**
```typescript
{
  type: "SERVICE_CHARGE",
  amount: 200000,  // Phí early check-in
  description: "Early check-in fee - arrived at 10:00 AM"
}
```

---

## 4. Dữ Liệu Cần Điền

### 📋 Thông Tin Bắt Buộc

#### **A. Check-in Booking Có Sẵn**
```typescript
{
  checkInInfo: [
    {
      bookingRoomId: string;     // ✅ REQUIRED: ID phòng trong booking
      customerIds: string[];     // ✅ REQUIRED: Danh sách khách (min 1)
    }
  ]
}
```

**Chi Tiết:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bookingRoomId` | string | ✅ | ID của BookingRoom (đã tạo khi đặt phòng) |
| `customerIds` | string[] | ✅ | Array customer IDs (phải tồn tại trong DB) |

---

#### **B. Walk-in (Tạo Booking Mới)**
```typescript
{
  customer: {
    fullName: string;          // ✅ REQUIRED
    phone: string;             // ✅ REQUIRED
    idNumber?: string;         // ⚠️ RECOMMENDED
    email?: string;            // ⚪ Optional
    address?: string;          // ⚪ Optional
  },
  rooms: [
    {
      roomTypeId: string;      // ✅ REQUIRED
      count: number;           // ✅ REQUIRED
    }
  ],
  checkInDate: string;         // ✅ REQUIRED (ISO 8601)
  checkOutDate: string;        // ✅ REQUIRED (ISO 8601)
  totalGuests: number;         // ✅ REQUIRED
}
```

**Lưu ý:**
- `phone` dùng để merge customer (nếu đã tồn tại)
- `idNumber` quan trọng cho việc báo cáo công an
- Backend tự động generate mật khẩu mặc định: `12345678`

---

### 📋 Thông Tin Tự Động

Backend tự động xử lý (không cần frontend gửi):

| Field | Value | Description |
|-------|-------|-------------|
| `employeeId` | From JWT token | Nhân viên thực hiện check-in |
| `actualCheckIn` | `NOW()` | Thời gian thực tế check-in |
| `bookingStatus` | Auto-calculated | Tự động update khi all rooms checked-in |
| `roomStatus` | `OCCUPIED` | Status phòng sau check-in |
| `activityLog` | Auto-created | Ghi log mỗi lần check-in |

---

## 5. Luồng Xử Lý Backend

### 🔄 Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│  1. RECEIVE CHECK-IN REQUEST                        │
│     POST /employee/bookings/check-in                │
│     { checkInInfo: [...] }                          │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  2. VALIDATE INPUT                                  │
│     ✓ All bookingRoomIds exist?                     │
│     ✓ All BookingRooms = CONFIRMED?                 │
│     ✓ All customerIds exist?                        │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  3. START TRANSACTION                               │
│     BEGIN TRANSACTION                               │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  4. UPDATE BOOKING ROOMS                            │
│     UPDATE booking_room SET                         │
│       status = 'CHECKED_IN',                        │
│       actual_check_in = NOW()                       │
│     WHERE id IN (...)                               │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  5. UPDATE ROOMS                                    │
│     UPDATE room SET                                 │
│       status = 'OCCUPIED'                           │
│     WHERE id IN (...)                               │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  6. CREATE BOOKING CUSTOMERS                        │
│     For each (bookingRoomId, customerId):          │
│       UPSERT booking_customer                       │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  7. CREATE ACTIVITY LOGS                            │
│     For each bookingRoom:                           │
│       activityService.createCheckInActivity(...)    │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  8. UPDATE BOOKING STATUS (if needed)               │
│     IF (all rooms CHECKED_IN):                      │
│       UPDATE booking SET status = 'CHECKED_IN'      │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  9. COMMIT TRANSACTION                              │
│     COMMIT                                          │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  10. RETURN RESPONSE                                │
│      { bookingRooms: [...] }                        │
└─────────────────────────────────────────────────────┘
```

---

### 📄 Code Implementation (booking.service.ts)

```typescript
async checkIn(input: CheckInPayload) {
  const { checkInInfo, employeeId } = input;
  const bookingRoomIds = checkInInfo.map(info => info.bookingRoomId);

  // 1. VALIDATE BOOKING ROOMS EXIST
  const bookingRooms = await this.prisma.bookingRoom.findMany({
    where: { id: { in: bookingRoomIds } },
    include: { room: true, booking: true }
  });

  if (bookingRooms.length !== bookingRoomIds.length) {
    throw new ApiError(404, 'One or more booking rooms not found');
  }

  // 2. VALIDATE ALL ROOMS ARE CONFIRMED
  const invalidRooms = bookingRooms.filter(
    br => br.status !== BookingStatus.CONFIRMED
  );
  
  if (invalidRooms.length > 0) {
    throw new ApiError(
      400,
      `Cannot check in. All rooms must be CONFIRMED. Invalid: ${
        invalidRooms.map(br => br.room.roomNumber).join(', ')
      }`
    );
  }

  // 3. VALIDATE CUSTOMERS EXIST
  const allCustomerIds = checkInInfo.flatMap(info => info.customerIds);
  const uniqueCustomerIds = [...new Set(allCustomerIds)];

  if (uniqueCustomerIds.length > 0) {
    const customers = await this.prisma.customer.findMany({
      where: { id: { in: uniqueCustomerIds } }
    });

    if (customers.length !== uniqueCustomerIds.length) {
      throw new ApiError(404, 'One or more customers not found');
    }
  }

  const now = dayjs();

  // 4. PERFORM CHECK-IN TRANSACTION
  const result = await this.prisma.$transaction(async (tx) => {
    // Step 1: Update BookingRooms to CHECKED_IN
    await tx.bookingRoom.updateMany({
      where: { id: { in: bookingRoomIds } },
      data: {
        status: BookingStatus.CHECKED_IN,
        actualCheckIn: now.toDate()
      }
    });

    // Step 2: Update Rooms to OCCUPIED
    const roomIds = bookingRooms.map(br => br.roomId);
    await tx.room.updateMany({
      where: { id: { in: roomIds } },
      data: { status: RoomStatus.OCCUPIED }
    });

    // Step 3: Create BookingCustomer associations
    for (const info of checkInInfo) {
      const bookingRoom = bookingRooms.find(
        br => br.id === info.bookingRoomId
      );
      if (!bookingRoom) continue;

      const customerPromises = info.customerIds.map(customerId =>
        tx.bookingCustomer.upsert({
          where: {
            bookingId_customerId: {
              bookingId: bookingRoom.bookingId,
              customerId
            }
          },
          create: {
            bookingId: bookingRoom.bookingId,
            customerId,
            bookingRoomId: info.bookingRoomId,
            isPrimary: false
          },
          update: { bookingRoomId: info.bookingRoomId }
        })
      );

      await Promise.all(customerPromises);
    }

    // Step 4: Create activity logs
    const activityPromises = bookingRooms.map(br =>
      this.activityService.createCheckInActivity(
        br.id,
        employeeId,
        br.room.roomNumber,
        tx
      )
    );
    await Promise.all(activityPromises);

    // Step 5: Update Booking status if all rooms checked in
    const uniqueBookingIds = [
      ...new Set(bookingRooms.map(br => br.bookingId))
    ];

    for (const bookingId of uniqueBookingIds) {
      const allRooms = await tx.bookingRoom.findMany({
        where: { bookingId }
      });

      const allCheckedIn = allRooms.every(
        br => br.status === BookingStatus.CHECKED_IN ||
              bookingRoomIds.includes(br.id)
      );

      if (allCheckedIn) {
        await tx.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.CHECKED_IN }
        });
      }
    }

    // Step 6: Fetch updated data with full details
    const updatedRooms = await tx.bookingRoom.findMany({
      where: { id: { in: bookingRoomIds } },
      include: {
        room: true,
        roomType: true,
        booking: {
          include: {
            primaryCustomer: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                email: true
              }
            }
          }
        },
        bookingCustomers: {
          include: {
            customer: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                email: true
              }
            }
          }
        }
      }
    });

    return { bookingRooms: updatedRooms };
  });

  return result;
}
```

---

## 6. Validation & Business Rules

### ✅ Pre-conditions (Điều Kiện Tiên Quyết)

| Rule | Description | Error Message |
|------|-------------|---------------|
| **BR-01** | BookingRoom phải tồn tại | "One or more booking rooms not found" |
| **BR-02** | BookingRoom status = `CONFIRMED` | "Cannot check in. All rooms must be CONFIRMED" |
| **BR-03** | Customer IDs phải tồn tại | "One or more customers not found" |
| **BR-04** | Mỗi phòng phải có ít nhất 1 customer | Validation error (Joi) |
| **BR-05** | Employee phải authenticated | "Employee not authenticated" |

---

### ⚠️ Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| **BR-10** | Không check-in phòng đã CHECKED_IN | Pre-validation |
| **BR-11** | Không check-in phòng đã CHECKED_OUT | Pre-validation |
| **BR-12** | Không check-in phòng CANCELLED | Pre-validation |
| **BR-13** | Customer có thể ở nhiều phòng trong cùng booking | Allowed |
| **BR-14** | Phòng có thể có nhiều customers | Allowed |
| **BR-15** | Partial check-in allowed | Supported |
| **BR-16** | Booking status = CHECKED_IN khi ALL rooms checked-in | Auto |

---

### 🔒 Data Integrity

**Transaction Guarantees:**
- ✅ All-or-nothing: Nếu 1 bước fail → rollback toàn bộ
- ✅ Consistency: Booking status luôn sync với BookingRoom status
- ✅ Activity logs: Mỗi check-in đều có audit trail
- ✅ Room status: Không bao giờ có phòng OCCUPIED mà không có booking

**Concurrency Control:**
- Database-level locking (Prisma transaction)
- Prevent double check-in (status validation)

---

## 7. API Endpoints

### 📍 POST /employee/bookings/check-in

**Description:** Check-in một hoặc nhiều booking rooms với customer assignments

**Authentication:** ✅ Required (Employee JWT)

**Request:**
```http
POST /employee/bookings/check-in
Authorization: Bearer <employee_jwt_token>
Content-Type: application/json

{
  "checkInInfo": [
    {
      "bookingRoomId": "booking_room_id_1",
      "customerIds": ["customer_id_1", "customer_id_2"]
    },
    {
      "bookingRoomId": "booking_room_id_2",
      "customerIds": ["customer_id_3"]
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "data": {
    "bookingRooms": [
      {
        "id": "booking_room_id_1",
        "status": "CHECKED_IN",
        "actualCheckIn": "2026-01-09T14:30:00.000Z",
        "room": {
          "id": "room_id_1",
          "roomNumber": "101",
          "status": "OCCUPIED"
        },
        "roomType": {
          "id": "room_type_id",
          "name": "Deluxe",
          "pricePerNight": "1500000"
        },
        "booking": {
          "id": "booking_id",
          "bookingCode": "BK12345",
          "status": "CHECKED_IN",
          "primaryCustomer": {
            "id": "customer_id_1",
            "fullName": "Nguyễn Văn A",
            "phone": "0901234567"
          }
        },
        "bookingCustomers": [
          {
            "customer": {
              "id": "customer_id_1",
              "fullName": "Nguyễn Văn A",
              "phone": "0901234567",
              "email": "a@example.com"
            }
          },
          {
            "customer": {
              "id": "customer_id_2",
              "fullName": "Trần Thị B",
              "phone": "0901234568",
              "email": "b@example.com"
            }
          }
        ]
      }
    ]
  }
}
```

**Error Responses:**

| Status | Code | Message | Cause |
|--------|------|---------|-------|
| 400 | BAD_REQUEST | "Cannot check in. All rooms must be CONFIRMED" | Room status invalid |
| 401 | UNAUTHORIZED | "Unauthorized" | Missing/invalid JWT token |
| 404 | NOT_FOUND | "One or more booking rooms not found" | Invalid bookingRoomId |
| 404 | NOT_FOUND | "One or more customers not found" | Invalid customerId |

---

### 📍 POST /employee/bookings (For Walk-in)

**Description:** Tạo booking mới (dùng cho walk-in, cần check-in sau)

**Request:**
```http
POST /employee/bookings
Authorization: Bearer <employee_jwt_token>
Content-Type: application/json

{
  "customer": {
    "fullName": "Nguyễn Văn C",
    "phone": "0901234569",
    "idNumber": "012345678901",
    "email": "c@example.com",
    "address": "123 ABC Street"
  },
  "rooms": [
    {
      "roomTypeId": "room_type_id_1",
      "count": 1
    }
  ],
  "checkInDate": "2026-01-09T14:00:00Z",
  "checkOutDate": "2026-01-10T12:00:00Z",
  "totalGuests": 2
}
```

**Response (201 Created):**
```json
{
  "data": {
    "bookingId": "booking_id_new",
    "bookingCode": "BK17361234ABCD",
    "expiresAt": "2026-01-09T14:15:00Z",
    "totalAmount": 1500000,
    "booking": {
      "id": "booking_id_new",
      "bookingCode": "BK17361234ABCD",
      "status": "PENDING",
      "bookingRooms": [
        {
          "id": "booking_room_id_new",
          "roomId": "room_101",
          "status": "PENDING"
        }
      ]
    }
  }
}
```

**Note:** Sau khi tạo booking, cần gọi `POST /employee/bookings/check-in` để check-in.

---

## 8. State Transitions

### 📊 Booking Status Flow

```
PENDING (Vừa tạo, chưa confirm)
    ↓ (Confirm payment/deposit)
CONFIRMED (Đã xác nhận, đang chờ check-in)
    ↓ (Check-in tất cả rooms)
CHECKED_IN (Đã nhận phòng, đang ở)
    ↓ (Check-out tất cả rooms)
CHECKED_OUT (Đã trả phòng, hoàn tất)
    
    Alternative paths:
    PENDING → CANCELLED (Hủy trước khi confirm)
    CONFIRMED → CANCELLED (Hủy sau khi confirm)
    CONFIRMED → NO_SHOW (Khách không đến)
```

### 📊 BookingRoom Status Flow

```
PENDING (Vừa tạo)
    ↓
CONFIRMED (Đã confirm)
    ↓
CHECKED_IN (Đã nhận phòng)
    ↓
CHECKED_OUT (Đã trả phòng)
```

### 📊 Room Status Flow

```
AVAILABLE (Phòng trống)
    ↓ (Create booking)
RESERVED (Đã đặt, chưa nhận)
    ↓ (Check-in)
OCCUPIED (Đang có khách)
    ↓ (Check-out)
AVAILABLE (Trống lại, cần dọn dẹp)
    ↓ (Cleaning done)
AVAILABLE (Sẵn sàng cho khách mới)
```

---

## 9. Examples & Test Cases

### 🧪 Test Case 1: Normal Check-in (Single Room)

**Given:**
- Booking BK001 với 1 phòng (Room 101)
- Booking status = CONFIRMED
- BookingRoom status = CONFIRMED
- Customer: John Doe (cust_001)

**When:**
```json
POST /employee/bookings/check-in
{
  "checkInInfo": [
    {
      "bookingRoomId": "br_001",
      "customerIds": ["cust_001"]
    }
  ]
}
```

**Then:**
- ✅ BookingRoom br_001 → status = CHECKED_IN
- ✅ Room 101 → status = OCCUPIED
- ✅ Booking BK001 → status = CHECKED_IN (vì chỉ có 1 phòng)
- ✅ BookingCustomer record created: (BK001, cust_001, br_001)
- ✅ Activity log created

---

### 🧪 Test Case 2: Partial Check-in (Multi Rooms)

**Given:**
- Booking BK002 với 3 phòng (Room 101, 102, 103)
- Tất cả BookingRooms status = CONFIRMED

**When:** Check-in chỉ 2 phòng
```json
POST /employee/bookings/check-in
{
  "checkInInfo": [
    {
      "bookingRoomId": "br_001",  // Room 101
      "customerIds": ["cust_001"]
    },
    {
      "bookingRoomId": "br_002",  // Room 102
      "customerIds": ["cust_002"]
    }
    // br_003 (Room 103) không check-in
  ]
}
```

**Then:**
- ✅ br_001, br_002 → CHECKED_IN
- ✅ br_003 → vẫn CONFIRMED
- ✅ Room 101, 102 → OCCUPIED
- ✅ Room 103 → vẫn RESERVED
- ⚠️ Booking BK002 → vẫn CONFIRMED (vì chưa check-in hết)

---

### 🧪 Test Case 3: Multi-Guest Check-in

**Given:**
- Booking BK003 với 1 phòng (Room 201)
- 2 khách: John (cust_001), Mary (cust_002)

**When:**
```json
POST /employee/bookings/check-in
{
  "checkInInfo": [
    {
      "bookingRoomId": "br_001",
      "customerIds": ["cust_001", "cust_002"]
    }
  ]
}
```

**Then:**
- ✅ 2 BookingCustomer records created
- ✅ Both customers linked to Room 201

---

### 🧪 Test Case 4: Walk-in Flow

**Step 1: Create Customer + Booking**
```json
POST /employee/bookings
{
  "customer": {
    "fullName": "Walk-in Guest",
    "phone": "0909999999"
  },
  "rooms": [{ "roomTypeId": "rt_001", "count": 1 }],
  "checkInDate": "2026-01-09T14:00:00Z",
  "checkOutDate": "2026-01-10T12:00:00Z",
  "totalGuests": 1
}
```

**Response:**
```json
{
  "bookingId": "bk_new",
  "booking": {
    "bookingRooms": [
      { "id": "br_new", "status": "PENDING" }
    ]
  }
}
```

**Step 2: Check-in Immediately**
```json
POST /employee/bookings/check-in
{
  "checkInInfo": [
    {
      "bookingRoomId": "br_new",
      "customerIds": ["cust_new"]
    }
  ]
}
```

---

## 10. Troubleshooting

### ❌ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "All rooms must be CONFIRMED" | Trying to check-in PENDING room | Confirm booking first |
| "One or more customers not found" | Invalid customer ID | Verify customer exists in DB |
| "Booking rooms not found" | Invalid bookingRoomId | Check booking details |
| "Employee not authenticated" | Missing JWT token | Login and retry |

---

### 🔍 Debug Checklist

**Khi check-in fail:**
1. ✅ Check booking status: `SELECT * FROM booking WHERE id = ?`
2. ✅ Check booking_room status: `SELECT * FROM booking_room WHERE id = ?`
3. ✅ Verify customer exists: `SELECT * FROM customer WHERE id = ?`
4. ✅ Check room availability: `SELECT * FROM room WHERE id = ?`
5. ✅ Review activity logs: `SELECT * FROM activity WHERE entity_id = ?`

---

## 11. Tóm Tắt

### ✅ Key Takeaways

1. **Check-in = CONFIRMED → CHECKED_IN**
   - BookingRoom status: CONFIRMED → CHECKED_IN
   - Room status: RESERVED → OCCUPIED
   - Booking status: Auto-update khi all rooms checked-in

2. **Partial Check-in Supported**
   - Không bắt buộc check-in hết tất cả phòng cùng lúc
   - Booking status chỉ = CHECKED_IN khi all rooms checked-in

3. **Multi-Guest Support**
   - Mỗi phòng có thể có nhiều khách
   - BookingCustomer link customers → rooms

4. **Walk-in = 2 Steps**
   - Step 1: Create booking (POST /employee/bookings)
   - Step 2: Check-in (POST /employee/bookings/check-in)
   - **Đề xuất:** Tạo API riêng cho walk-in one-step

5. **Activity Logging**
   - Mỗi check-in được log để audit
   - Track: who, when, which room

---

### 📚 Related Documents
- [BACKEND_BUSINESS_LOGIC.md](./BACKEND_BUSINESS_LOGIC.md)
- [booking-flow-complete.md](./docs/booking-flow-complete.md)
- [API_DOCUMENTATION.md](./BACKEND_API_DOCUMENTATION.md)

---

**Last Updated:** 2026-01-09  
**Version:** 1.0  
**Author:** Backend Analysis Team
