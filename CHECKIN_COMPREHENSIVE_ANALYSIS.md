# 🏨 Phân Tích Toàn Diện: Check-in Business Logic (BE → FE)

## 📋 Executive Summary

**Ngày phân tích:** 2026-01-11  
**Phạm vi:** Backend (roommaster-be) ↔ Frontend (hotel-management-system-fe)  
**Mục tiêu:** Đảm bảo Frontend triển khai đúng 100% nghiệp vụ Check-in của Backend

---

## 🎯 BACKEND CHECK-IN BUSINESS LOGIC (Source of Truth)

### 1. Data Models

#### Booking (model chính)
```prisma
model Booking {
  id                String        @id @default(cuid())
  bookingCode       String        @unique
  status            BookingStatus @default(PENDING)  // PENDING | CONFIRMED | CHECKED_IN | PARTIALLY_CHECKED_OUT | CHECKED_OUT | CANCELLED
  
  primaryCustomerId String
  primaryCustomer   Customer      @relation(...)
  
  checkInDate       DateTime
  checkOutDate      DateTime
  totalGuests       Int
  
  // Financial fields
  totalAmount       Decimal
  depositRequired   Decimal
  totalDeposit      Decimal
  totalPaid         Decimal
  balance           Decimal
  
  bookingRooms      BookingRoom[]
  bookingCustomers  BookingCustomer[]
  // ...
}
```

#### BookingRoom (phòng cụ thể trong booking)
```prisma
model BookingRoom {
  id              String        @id
  bookingId       String
  roomId          String
  roomTypeId      String
  
  checkInDate     DateTime
  checkOutDate    DateTime
  actualCheckIn   DateTime?     // ⚠️ Set khi check-in
  actualCheckOut  DateTime?
  
  pricePerNight   Decimal
  // Financial fields per room
  
  status          BookingStatus @default(PENDING)  // ⚠️ CRITICAL: Mỗi room có status riêng
  
  booking         Booking
  room            Room
  roomType        RoomType
  bookingCustomers BookingCustomer[]  // ⚠️ Guests assigned to this room
}
```

#### BookingCustomer (khách ở trong phòng)
```prisma
model BookingCustomer {
  id            String   @id
  bookingId     String
  customerId    String
  bookingRoomId String?  // ⚠️ NULL nếu chưa check-in, có giá trị sau check-in
  
  isPrimary     Boolean  @default(false)
  
  booking       Booking
  customer      Customer
  bookingRoom   BookingRoom?
  
  @@unique([bookingId, customerId])
}
```

#### Room Status
```prisma
enum RoomStatus {
  AVAILABLE        // Sẵn sàng
  RESERVED         // Đã đặt (sau khi create booking)
  OCCUPIED         // ⚠️ Đang có khách (sau check-in)
  CLEANING
  MAINTENANCE
  OUT_OF_SERVICE
}
```

---

### 2. Check-in API Definition

**Endpoint:** `POST /employee/bookings/check-in`  
**Auth Required:** ✅ Yes (Employee)

**Request Body:**
```typescript
interface CheckInPayload {
  checkInInfo: Array<{
    bookingRoomId: string;      // ID của BookingRoom
    customerIds: string[];       // Danh sách customer IDs sẽ ở phòng này
  }>;
  employeeId: string;  // Auto-injected by middleware
}
```

**Response:**
```typescript
{
  data: {
    bookingRooms: BookingRoom[];  // Updated booking rooms with new status
    booking?: Booking;             // Updated booking (if status changed to CHECKED_IN)
  }
}
```

---

### 3. Check-in Business Rules (Backend Validation)

#### ✅ PRE-CONDITIONS (Điều kiện bắt buộc TRƯỚC khi check-in)

1. **BookingRoom Status = CONFIRMED**
   ```typescript
   // Source: booking.service.ts:256-263
   const invalidRooms = bookingRooms.filter((br) => br.status !== BookingStatus.CONFIRMED);
   if (invalidRooms.length > 0) {
     throw new ApiError(
       httpStatus.BAD_REQUEST,
       `Cannot check in. All booking rooms must be CONFIRMED. Invalid rooms: ${...}`
     );
   }
   ```
   **❌ KHÔNG THỂ check-in nếu:**
   - Status = PENDING (chưa confirm/chưa đặt cọc)
   - Status = CHECKED_IN (đã check-in rồi)
   - Status = CHECKED_OUT (đã trả phòng)
   - Status = CANCELLED (đã hủy)

2. **Room Status = AVAILABLE hoặc RESERVED**
   ```typescript
   // Source: booking.service.ts:266-276
   const unavailableRooms = bookingRooms.filter(
     (br) => br.room.status !== RoomStatus.AVAILABLE && br.room.status !== RoomStatus.RESERVED
   );
   if (unavailableRooms.length > 0) {
     throw new ApiError(
       httpStatus.BAD_REQUEST,
       `Cannot check in. The following rooms are not ready: ${roomDetails}`
     );
   }
   ```
   **❌ KHÔNG THỂ check-in nếu phòng đang:**
   - OCCUPIED (đang có khách)
   - CLEANING (đang dọn)
   - MAINTENANCE (đang sửa chữa)
   - OUT_OF_SERVICE (ngừng hoạt động)

3. **Customer IDs phải tồn tại**
   ```typescript
   // Source: booking.service.ts:279-289
   const customers = await this.prisma.customer.findMany({
     where: { id: { in: uniqueCustomerIds } }
   });
   
   if (customers.length !== uniqueCustomerIds.length) {
     throw new ApiError(httpStatus.NOT_FOUND, 'One or more customers not found');
   }
   ```

#### ⚙️ SIDE EFFECTS (Những gì Backend thực hiện khi check-in)

**Transaction Flow:**
```typescript
// Source: booking.service.ts:296-407
await this.prisma.$transaction(async (tx) => {
  // 1. Update BookingRoom status → CHECKED_IN
  await tx.bookingRoom.updateMany({
    where: { id: { in: bookingRoomIds } },
    data: {
      status: BookingStatus.CHECKED_IN,
      actualCheckIn: now.toDate()  // ⚠️ Set actual check-in time
    }
  });

  // 2. Update Room status → OCCUPIED
  await tx.room.updateMany({
    where: { id: { in: roomIds } },
    data: { status: RoomStatus.OCCUPIED }
  });

  // 3. Create/Update BookingCustomer associations
  for (const info of checkInInfo) {
    const bookingCustomerPromises = info.customerIds.map((customerId) =>
      tx.bookingCustomer.upsert({
        where: {
          bookingId_customerId: { bookingId, customerId }
        },
        create: {
          bookingId,
          customerId,
          bookingRoomId: info.bookingRoomId,  // ⚠️ Assign customer to room
          isPrimary: false
        },
        update: {
          bookingRoomId: info.bookingRoomId   // ⚠️ Update room assignment
        }
      })
    );
    await Promise.all(bookingCustomerPromises);
  }

  // 4. Create Activity Log (audit trail)
  await this.activityService.createCheckInActivity(...)

  // 5. Update Booking status to CHECKED_IN (if all rooms checked in)
  const allCheckedIn = allBookingRooms.every(
    (br) => br.status === BookingStatus.CHECKED_IN || bookingRoomIds.includes(br.id)
  );
  if (allCheckedIn) {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CHECKED_IN }
    });
  }
});
```

**Summary of Side Effects:**
| Action | Object | Change |
|--------|--------|--------|
| 1 | `BookingRoom.status` | → `CHECKED_IN` |
| 2 | `BookingRoom.actualCheckIn` | → `now()` |
| 3 | `Room.status` | → `OCCUPIED` |
| 4 | `BookingCustomer.bookingRoomId` | → Set to actual room |
| 5 | `Activity` | Create CHECKED_IN log |
| 6 | `Booking.status` | → `CHECKED_IN` (if all rooms done) |

---

### 4. Điều kiện Booking Status Transition

**Status Flow:**
```
PENDING (tạo booking)
   ↓ (payment/confirm)
CONFIRMED (sẵn sàng check-in)
   ↓ (check-in)
CHECKED_IN (khách đã vào)
   ↓ (check-out)
CHECKED_OUT (hoàn tất)
```

**CONFIRMED Status đạt được khi:**
1. Payment transaction completed (deposit or full payment)
2. Manual confirmation bởi employee (nếu có API)
3. ⚠️ **Backend KHÔNG CÓ API `/employee/bookings/:id/confirm`**

**Check-in CHỈ được phép khi:**
- `BookingRoom.status === 'CONFIRMED'`
- `Room.status IN ['AVAILABLE', 'RESERVED']`

---

## 🖥️ FRONTEND CHECK-IN IMPLEMENTATION

### 1. Hook: `useCheckIn`

**File:** `hotel-management-system-fe/hooks/use-checkin.ts`

#### Search & Filter Logic
```typescript
// Line 30-35
const fetchInitialBookings = useCallback(async () => {
  const searchResults = await bookingService.searchBookings("");
  // ✅ ĐÚNG: Filter chỉ lấy CONFIRMED bookings
  const confirmedBookings = searchResults.filter(
    (b) => b.status === "CONFIRMED"
  );
  setResults(confirmedBookings);
}, [authLoading, user]);
```

**✅ Đánh giá:** Đúng nghiệp vụ - chỉ hiển thị bookings có status CONFIRMED để check-in

#### Check-in Confirmation Logic
```typescript
// Line 72-109
const handleConfirmCheckIn = async (data: BackendCheckInRequest) => {
  // Call real backend API
  const response = await bookingService.checkIn(data);
  
  // Refresh booking details from backend
  if (selectedBooking?.id) {
    const bookingResponse = await bookingService.getBookingById(selectedBooking.id);
    const updatedBooking = bookingResponse.booking;
    
    setResults((prev) =>
      prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
    );
  }
  
  setShowModal(false);
  setSelectedBooking(null);
};
```

**✅ Đánh giá:** 
- Đúng: Gọi backend API check-in
- Đúng: Refresh data sau check-in
- Đúng: Update UI state với data mới từ backend

#### Walk-in Check-in Flow
```typescript
// Line 114-225
const handleConfirmWalkIn = async (data: WalkInFormData) => {
  // Step 1: Auto-select rooms
  const roomsWithIds = await Promise.all(...);
  
  // Step 2: Create booking
  const bookingResponse = await bookingService.createBooking({...});
  
  // Step 3: CRITICAL - Confirm booking first
  await bookingService.confirmBooking(bookingResponse.bookingId);
  
  // Step 4: Refetch to get CONFIRMED status
  const confirmedBooking = await bookingService.getBookingById(bookingResponse.bookingId);
  
  // Step 5: Check-in
  if (confirmedBooking?.bookingRooms) {
    const checkInInfo = confirmedBooking.bookingRooms.map((br) => ({
      bookingRoomId: br.id,
      customerIds: [primaryId],
    }));
    
    await bookingService.checkIn({ checkInInfo });
  }
};
```

**⚠️ PHÁT HIỆN VẤN ĐỀ #1: API `confirmBooking` không tồn tại ở Backend**
- Frontend gọi `bookingService.confirmBooking()` (line 184)
- Backend KHÔNG CÓ route `PATCH /employee/bookings/:id/confirm`
- Walk-in flow sẽ FAIL vì booking mới tạo có status = PENDING
- Backend check-in sẽ reject vì `BookingRoom.status !== CONFIRMED`

---

### 2. Component: `ModernCheckInModal`

**File:** `hotel-management-system-fe/components/checkin-checkout/modern-check-in-modal.tsx`

#### Room Selection Logic
```typescript
// Line 153
const confirmedRooms = booking.bookingRooms?.filter(
  (br) => br.status === "CONFIRMED" || 
          br.status === "PARTIALLY_CHECKED_OUT" || 
          br.status === "CHECKED_IN"
) || [];
```

**❌ PHÁT HIỆN VẤN ĐỀ #2: Cho phép check-in room đã CHECKED_IN**
- Backend validation: CHỈ cho phép status = CONFIRMED
- Frontend filter: Cho phép cả CHECKED_IN và PARTIALLY_CHECKED_OUT
- Kết quả: Frontend hiển thị rooms không thể check-in → Backend sẽ reject

#### Customer Assignment Logic
```typescript
// Line 62-75
const initialStates = booking.bookingRooms
  ?.filter((br) => br.status === "CONFIRMED")
  .map((br) => {
    const roomCustomers = br.bookingCustomers?.map(bc => bc.customerId) || [];
    
    // If no customers assigned yet, default to primary customer
    const defaultCustomers = roomCustomers.length > 0 
      ? roomCustomers 
      : [booking.primaryCustomerId];

    return {
      bookingRoomId: br.id,
      customerIds: defaultCustomers,
      numberOfGuests: defaultCustomers.length,
    };
  }) || [];
```

**⚠️ PHÁT HIỆN VẤN ĐỀ #3: Không có UI để chọn guests**
- Logic đã chuẩn bị customerIds từ BookingCustomer hoặc primaryCustomer
- Nhưng KHÔNG CÓ UI component để user chọn hoặc add thêm guests
- User không thể customize guests cho mỗi room
- Comment code xác nhận: "Customer assignment helpers removed — backend list endpoint doesn't provide bookingCustomers yet."

#### Validation Logic
```typescript
// Line 120-130
const handleConfirm = async () => {
  if (!booking || selectedRooms.size === 0) return;

  const checkInInfo = checkInStates
    .filter((state) => selectedRooms.has(state.bookingRoomId))
    .map((state) => ({
      bookingRoomId: state.bookingRoomId,
      customerIds: state.customerIds,
    }));

  await onConfirm({ checkInInfo });
  handleOpenChange(false);
};
```

**✅ Đánh giá:**
- Đúng: Chỉ check-in selected rooms
- Đúng: Payload format khớp với Backend API
- ⚠️ Thiếu: Không validate customerIds có empty không
- ⚠️ Thiếu: Không validate số lượng guests vs room capacity

---

### 3. Service: `bookingService.checkIn`

**File:** `hotel-management-system-fe/lib/services/booking.service.ts`

```typescript
// Line 293-309
async checkIn(data: CheckInRequest): Promise<BookingResponse> {
  const response = await api.post<ApiResponse<BookingResponse>>(
    "/employee/bookings/check-in",  // ✅ ĐÚNG endpoint
    data,
    { requiresAuth: true }
  );
  const unwrappedData = /* ... response unwrapping ... */;
  return unwrappedData;
}
```

**✅ Đánh giá:**
- Đúng: Endpoint `/employee/bookings/check-in`
- Đúng: HTTP Method POST
- Đúng: Request body format
- Đúng: Response unwrapping logic

---

## 🔴 ISSUES & MISMATCHES SUMMARY

### Issue #1: Missing Backend API - `confirmBooking`
**Severity:** 🔴 CRITICAL  
**Location:** `use-checkin.ts:184`

**Problem:**
- Frontend gọi `bookingService.confirmBooking(bookingId)`
- Backend KHÔNG CÓ route `PATCH /employee/bookings/:id/confirm`
- Frontend service có fallback mock response → Walk-in "thành công" nhưng backend vẫn PENDING
- Khi check-in, Backend reject vì BookingRoom.status !== CONFIRMED

**Root Cause:**
- Backend chỉ cho phép confirm booking qua Transaction (payment)
- Không có API manual confirm cho employee

**Impact:**
- Walk-in check-in flow HOÀN TOÀN KHÔNG HOẠT ĐỘNG
- User tạo booking thành công nhưng không thể check-in
- UI hiển thị success nhưng data không đúng

**Solution:**
- **Option A (Frontend Fix):** Bỏ confirmBooking call, sử dụng Transaction API để confirm thông qua payment
- **Option B (Backend Feature Request):** Tạo API `POST /employee/bookings/:id/confirm` cho manual confirmation

---

### Issue #2: Invalid Room Status Filter
**Severity:** 🟡 MEDIUM  
**Location:** `modern-check-in-modal.tsx:153`

**Problem:**
```typescript
// ❌ SAI
const confirmedRooms = booking.bookingRooms?.filter(
  (br) => br.status === "CONFIRMED" || 
          br.status === "PARTIALLY_CHECKED_OUT" || 
          br.status === "CHECKED_IN"
) || [];

// ✅ ĐÚNG (theo Backend)
const confirmedRooms = booking.bookingRooms?.filter(
  (br) => br.status === "CONFIRMED"
) || [];
```

**Impact:**
- Hiển thị rooms đã CHECKED_IN trong danh sách check-in
- User có thể chọn và thử check-in lại → Backend reject
- Gây confusion cho user

**Solution:**
```typescript
const confirmedRooms = booking.bookingRooms?.filter(
  (br) => br.status === "CONFIRMED"
) || [];

// Show warning nếu có rooms đã checked in
const alreadyCheckedIn = booking.bookingRooms?.filter(
  (br) => br.status === "CHECKED_IN"
).length || 0;

if (alreadyCheckedIn > 0) {
  // Show info badge: "X rooms already checked in"
}
```

---

### Issue #3: No Guest Selection UI
**Severity:** 🟡 MEDIUM  
**Location:** `modern-check-in-modal.tsx:62-75`

**Problem:**
- Backend requires `customerIds: string[]` per room
- Frontend logic chuẩn bị customerIds nhưng KHÔNG CÓ UI để user chọn
- Mặc định chỉ assign primary customer cho tất cả rooms
- Không thể assign multiple guests cho 1 room
- Không thể assign different guests cho different rooms

**Impact:**
- Booking có nhiều guests nhưng chỉ primary customer được assign
- Thông tin guests không đầy đủ trong BookingCustomer
- Không fulfill use case: "Gia đình 4 người đặt 2 phòng, phân chia ai ở phòng nào"

**Backend Data Available:**
```typescript
// Backend returns bookingCustomers in booking response
booking.bookingCustomers: Array<{
  id: string;
  customerId: string;
  bookingRoomId: string | null;  // null before check-in
  customer: { fullName, phone, ... };
}>
```

**Solution:**
- Thêm UI component để chọn guests cho mỗi room
- Hiển thị available guests (từ booking.bookingCustomers)
- Cho phép assign multiple guests per room
- Validate: Mỗi guest chỉ được assign vào 1 room

---

### Issue #4: No Validation for Empty CustomerIds
**Severity:** 🟠 LOW  
**Location:** `modern-check-in-modal.tsx:120`

**Problem:**
- Backend validation cho phép `customerIds` empty array
- Frontend không validate trước khi submit
- Có thể check-in room mà không có guest nào

**Solution:**
```typescript
const handleConfirm = async () => {
  // Validate customerIds not empty
  const invalidRooms = checkInStates
    .filter((state) => selectedRooms.has(state.bookingRoomId))
    .filter((state) => state.customerIds.length === 0);
  
  if (invalidRooms.length > 0) {
    alert("Vui lòng chọn khách cho tất cả các phòng!");
    return;
  }
  
  // ... proceed with check-in
};
```

---

### Issue #5: Room Capacity Not Checked
**Severity:** 🟠 LOW  
**Location:** `modern-check-in-modal.tsx`

**Problem:**
- Backend không validate số guests vs room capacity
- Frontend có thông tin `roomType.capacity` nhưng không check
- Có thể assign 10 guests vào phòng 2 người

**Solution:**
```typescript
// In handleConfirm or validation
checkInStates.forEach(state => {
  const room = booking.bookingRooms.find(br => br.id === state.bookingRoomId);
  const capacity = room?.roomType?.capacity || 0;
  
  if (state.customerIds.length > capacity) {
    throw new Error(
      `Room ${room.room.roomNumber} capacity is ${capacity} but ${state.customerIds.length} guests assigned`
    );
  }
});
```

---

## 🎯 FIXES TO APPLY

### Fix #1: Handle Missing confirmBooking API

**File:** `hotel-management-system-fe/hooks/use-checkin.ts`

**Change:** Walk-in flow cần confirm booking bằng Transaction API thay vì confirmBooking

```typescript
// BEFORE (Lines 182-191)
await bookingService.confirmBooking(bookingResponse.bookingId);
logger.log("Booking confirmed:", bookingResponse.bookingId);

const confirmedBooking = await bookingService.getBookingById(bookingResponse.bookingId);

// AFTER
// Use transaction to confirm booking (deposit or full payment)
const depositTransaction = await transactionService.createTransaction({
  bookingId: bookingResponse.bookingId,
  type: 'DEPOSIT',
  amount: bookingResponse.depositRequired || 0,
  method: 'CASH',  // Or let user select payment method
});

// Wait for transaction to complete and booking status to update
const confirmedBooking = await bookingService.getBookingById(bookingResponse.bookingId);

if (confirmedBooking.booking.status !== 'CONFIRMED') {
  throw new Error('Booking confirmation failed. Please try again.');
}
```

**Note:** Cần thêm payment modal cho walk-in để user chọn payment method trước check-in

---

### Fix #2: Filter Only CONFIRMED Rooms

**File:** `hotel-management-system-fe/components/checkin-checkout/modern-check-in-modal.tsx`

```typescript
// Line 153 - Change filter logic
const confirmedRooms = booking.bookingRooms?.filter(
  (br) => br.status === "CONFIRMED"
) || [];

// Add info about already checked-in rooms
const checkedInRooms = booking.bookingRooms?.filter(
  (br) => br.status === "CHECKED_IN"
) || [];
```

**Add UI notification:**
```tsx
{checkedInRooms.length > 0 && (
  <Alert className="mb-4">
    <AlertDescription>
      ℹ️ {checkedInRooms.length} room(s) already checked in and not shown in the list.
    </AlertDescription>
  </Alert>
)}
```

---

### Fix #3: Add Guest Selection UI

**File:** `hotel-management-system-fe/components/checkin-checkout/modern-check-in-modal.tsx`

**Add new component for guest selection:**
```tsx
// After line 300 (in room card)
<div className="space-y-2">
  <Label className="text-sm font-medium">
    Assign Guests <span className="text-red-600">*</span>
  </Label>
  
  {/* Multi-select for guests */}
  {booking.bookingCustomers?.map(bc => {
    const isAssigned = state?.customerIds.includes(bc.customerId);
    const isAssignedElsewhere = checkInStates.some(
      s => s.bookingRoomId !== bookingRoom.id && 
           s.customerIds.includes(bc.customerId)
    );
    
    return (
      <div key={bc.id} className="flex items-center gap-2">
        <Checkbox
          checked={isAssigned}
          disabled={isAssignedElsewhere}
          onCheckedChange={(checked) => {
            if (checked) {
              addCustomerToRoom(bookingRoom.id, bc.customerId);
            } else {
              removeCustomerFromRoom(bookingRoom.id, bc.customerId);
            }
          }}
        />
        <Label className={isAssignedElsewhere ? "text-gray-400" : ""}>
          {bc.customer.fullName} - {bc.customer.phone}
          {isAssignedElsewhere && " (Assigned to another room)"}
        </Label>
      </div>
    );
  })}
  
  <Button variant="outline" size="sm" onClick={() => openAddGuestModal()}>
    + Add New Guest
  </Button>
</div>
```

**Add helper functions:**
```typescript
const addCustomerToRoom = (bookingRoomId: string, customerId: string) => {
  setCheckInStates(prev =>
    prev.map(state =>
      state.bookingRoomId === bookingRoomId
        ? {
            ...state,
            customerIds: [...state.customerIds, customerId],
            numberOfGuests: state.customerIds.length + 1,
          }
        : state
    )
  );
};

const removeCustomerFromRoom = (bookingRoomId: string, customerId: string) => {
  setCheckInStates(prev =>
    prev.map(state =>
      state.bookingRoomId === bookingRoomId
        ? {
            ...state,
            customerIds: state.customerIds.filter(id => id !== customerId),
            numberOfGuests: state.customerIds.length - 1,
          }
        : state
    )
  );
};
```

---

### Fix #4: Add CustomerIds Validation

**File:** `hotel-management-system-fe/components/checkin-checkout/modern-check-in-modal.tsx`

```typescript
// Line 120 - Add validation before confirm
const handleConfirm = async () => {
  if (!booking || selectedRooms.size === 0) {
    alert("Please select at least one room to check in!");
    return;
  }

  // NEW: Validate customerIds not empty
  const roomsWithoutGuests = checkInStates
    .filter((state) => selectedRooms.has(state.bookingRoomId))
    .filter((state) => state.customerIds.length === 0);
  
  if (roomsWithoutGuests.length > 0) {
    alert("Please assign at least one guest to each selected room!");
    return;
  }

  // NEW: Validate room capacity
  const overCapacityRooms = checkInStates
    .filter((state) => selectedRooms.has(state.bookingRoomId))
    .filter((state) => {
      const room = booking.bookingRooms?.find(br => br.id === state.bookingRoomId);
      const capacity = room?.roomType?.capacity || 999;
      return state.customerIds.length > capacity;
    });
  
  if (overCapacityRooms.length > 0) {
    alert("Some rooms exceed their guest capacity! Please adjust guest assignments.");
    return;
  }

  // Proceed with check-in
  const checkInInfo = checkInStates
    .filter((state) => selectedRooms.has(state.bookingRoomId))
    .map((state) => ({
      bookingRoomId: state.bookingRoomId,
      customerIds: state.customerIds,
    }));

  const requestData: BackendCheckInRequest = {
    checkInInfo,
  };

  try {
    await onConfirm(requestData);
    handleOpenChange(false);
  } catch (error) {
    console.error("Check-in failed:", error);
    // Show error to user
    alert("Check-in failed! Please check if all rooms are in CONFIRMED status.");
  }
};
```

---

## 📝 BACKEND ISSUES TO REPORT

### Backend Issue #1: No Manual Confirmation API
**File:** `Bugs_For_BE.md`

**Issue:**
```markdown
### Missing API: Manual Booking Confirmation

**Endpoint:** `POST /employee/bookings/:id/confirm`

**Current Situation:**
- Booking status changes to CONFIRMED only through Transaction (payment)
- No API for employee to manually confirm booking without payment

**Problem:**
- Walk-in guests cannot check-in immediately without payment flow
- Employee cannot confirm bookings for pre-arranged payments (bank transfer pending)
- Cannot handle special cases (VIP, company accounts, etc.)

**Proposed Solution:**
Add endpoint:
```
POST /employee/bookings/:id/confirm
Authorization: Bearer <employee_token>

Response: { booking: Booking }

Business Logic:
- Validate booking status is PENDING
- Update booking.status → CONFIRMED
- Update all bookingRooms.status → CONFIRMED
- Update rooms.status → RESERVED
- Create activity log
```

**Workaround:**
Frontend must use Transaction API to create 0-value deposit to trigger confirmation.
```

---

### Backend Issue #2: BookingCustomers Not Returned in List API
**File:** `Bugs_For_BE.md`

**Issue:**
```markdown
### Missing Data: BookingCustomers in List Response

**Endpoint:** `GET /employee/bookings`

**Current Situation:**
- List API returns Booking with bookingRooms
- bookingRooms does NOT include bookingCustomers relation
- Frontend cannot display guest assignments per room

**Problem:**
- Frontend check-in modal cannot show which guests are assigned to which rooms
- Cannot pre-fill guest selection for re-check-in scenarios
- Must call separate getBookingById for each booking to get full data

**Impact:**
- Performance: Extra API calls for detailed view
- UX: Cannot show guest info in list/cards

**Proposed Solution:**
Include bookingCustomers in list API response:
```typescript
bookingRooms: [
  {
    id: "...",
    room: { ... },
    roomType: { ... },
    bookingCustomers: [  // ADD THIS
      {
        id: "...",
        customerId: "...",
        customer: {
          fullName: "...",
          phone: "..."
        }
      }
    ]
  }
]
```
```

---

## ✅ RECOMMENDATIONS

### For Frontend Team:

1. **Immediate (MUST FIX):**
   - ❌ Fix #1: Handle missing confirmBooking API (bổ sung payment flow cho walk-in)
   - ❌ Fix #2: Filter chỉ CONFIRMED rooms cho check-in list
   - ❌ Fix #4: Add validation cho customerIds không empty

2. **Short-term (SHOULD FIX):**
   - 🟡 Fix #3: Add UI để chọn guests cho mỗi room
   - 🟡 Thêm payment modal cho walk-in flow
   - 🟡 Hiển thị warning khi có rooms đã checked-in

3. **Nice-to-have:**
   - 🔵 Validate room capacity vs number of guests
   - 🔵 Show room status (AVAILABLE/RESERVED/OCCUPIED) trong UI
   - 🔵 Add bulk check-in option (check-in all rooms at once)

### For Backend Team:

1. **Critical:**
   - 🔴 Add API `POST /employee/bookings/:id/confirm` để manual confirmation

2. **Important:**
   - 🟡 Include bookingCustomers trong list API response
   - 🟡 Add validation cho room capacity vs guests count

---

## 📊 COMPLIANCE MATRIX

| Feature | Backend Logic | Frontend Implementation | Status |
|---------|---------------|-------------------------|--------|
| Check-in API endpoint | `/employee/bookings/check-in` | `/employee/bookings/check-in` | ✅ Match |
| Request format | `{ checkInInfo: [{bookingRoomId, customerIds}] }` | Same | ✅ Match |
| BookingRoom status check | Must be CONFIRMED | Filters CONFIRMED only | ✅ Match (after fix) |
| Room status check | Must be AVAILABLE/RESERVED | No check | ⚠️ Backend validates |
| Customer validation | Must exist in DB | No pre-validation | ⚠️ Backend validates |
| Side effects | 6 operations in transaction | Trusts backend | ✅ Correct |
| Status update | CHECKED_IN when all done | Refresh from backend | ✅ Correct |
| Guest assignment | Required per room | Auto-assigns primary | ⚠️ Missing UI |
| Walk-in flow | Requires CONFIRMED status | Uses confirmBooking (missing) | ❌ Broken |

---

## 🔚 CONCLUSION

**Overall Assessment: 🟡 PARTIALLY COMPATIBLE**

**What Works:**
- ✅ Normal check-in flow (for already CONFIRMED bookings)
- ✅ API endpoint và request format
- ✅ Status filtering logic (sau khi fix)
- ✅ UI refresh after check-in

**What's Broken:**
- ❌ Walk-in flow (missing confirmBooking API)
- ❌ Guest selection/assignment (no UI)
- ⚠️ Room status filter (shows invalid rooms)

**Priority Actions:**
1. Fix walk-in flow bằng cách thêm payment step
2. Fix room status filter
3. Thêm guest selection UI
4. Request Backend add manual confirmation API

**Timeline:**
- Quick fixes (2-3 hours): #1, #2, #4
- Full solution (1-2 days): #3, payment integration
- Backend dependency: Pending API from Backend team
