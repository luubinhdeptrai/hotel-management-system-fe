# Triển Khai Tìm Phòng Trống & Chọn Phòng Cụ Thể - HOÀN TẤT ✓

## Tóm Tắt
Đã triển khai đầy đủ flow tìm phòng trống và chọn phòng cụ thể trên Frontend, kết nối với Backend API `/employee/rooms/available`.

---

## 🎯 Chức Năng Hoàn Thiện

### 1. **Tìm Phòng Trống**
- ✅ Gọi API `GET /employee/rooms/available?checkInDate=...&checkOutDate=...`
- ✅ Lọc phòng theo:
  - Loại phòng (Room Type)
  - Tầng (Floor)
  - Khoảng giá (Min/Max Price)
  - Tìm kiếm phòng số (Room Number)
- ✅ Tự động tính số đêm từ ngày nhận - ngày trả

### 2. **Hiển Thị Phòng Theo Nhóm**
- ✅ Nhóm phòng theo loại phòng (Room Type)
- ✅ Hiển thị thông tin từng nhóm:
  - Tên loại phòng
  - Sức chứa (Capacity)
  - Số phòng còn lại (Available Count)
  - Giá/đêm
  - Tổng giá cho số đêm (X đêm)
- ✅ Hiển thị phòng cụ thể trong mỗi nhóm với:
  - Số phòng (Room Number)
  - Tầng (Floor)
  - Tính giá tổng cộng

### 3. **Chọn Phòng Cụ Thể**
- ✅ Click chọn từng phòng cụ thể (không chỉ loại phòng)
- ✅ Tự động tính toán:
  - Tổng giá = Giá/đêm × Số đêm
  - Cập nhật tổng tiền khi chọn thêm phòng
- ✅ Hiển thị phòng đã chọn với:
  - Danh sách phòng, loại, tầng
  - Giá chi tiết (X₫/đêm × Y đêm = Z₫)
  - Tổng tiền cho tất cả phòng
  - Nút xóa để bỏ chọn

### 4. **Tạo Booking**
- ✅ Pass room IDs (phòng cụ thể) + customer data + dates
- ✅ Backend nhận: `{ rooms: [{roomId: "..."}, ...], customerId, checkInDate, checkOutDate, totalGuests }`
- ✅ Tính tổng tiền = Sum(pricePerNight × nights) cho tất cả phòng

---

## 📝 File Chính Sửa Đổi

### 1. **room-selector.tsx** (Component chính)
**Vị trí:** `components/reservations/room-selector.tsx`

**Cải Thiện:**
- ✅ Thêm interface `GroupedAvailableRooms` để grouping phòng theo loại
- ✅ Thêm hàm `calculateNights()` tính số đêm tự động
- ✅ Thêm logic grouping phòng theo Room Type
- ✅ Cải thiện handleSelectRoom: tính totalPrice, hiển thị chi tiết
- ✅ UI hiển thị phòng theo nhóm với:
  - Header loại phòng (Room Type) hiển thị giá/đêm + tổng
  - Grid phòng cụ thể dễ nhìn
  - Hiển thị tính giá rõ ràng (X₫ × Y đêm = Z₫)
- ✅ Hiển thị phòng đã chọn với tổng tiền

**Flow:**
```
Load dates
  ↓
Fetch available rooms từ API
  ↓
Group phòng theo Room Type
  ↓
User chọn phòng cụ thể
  ↓
Pass room IDs → Create Booking
```

### 2. **booking.service.ts** (API Client)
**Vị trí:** `lib/services/booking.service.ts` (Đã có, không sửa)

**Đã Implement:**
```typescript
async getAvailableRooms(params: AvailableRoomSearchParams): Promise<AvailableRoom[]>
```
- ✅ Gọi `GET /employee/rooms/available?checkInDate=...&checkOutDate=...`
- ✅ Parse response an toàn (handle cả wrapped + direct array)
- ✅ Trả về array luôn luôn

### 3. **use-reservations.ts** (State Management)
**Vị trí:** `hooks/use-reservations.ts` (Đã có handleSaveReservation)

**Flow:**
```typescript
handleSaveReservation()
  ↓
Transform SelectedRoom[] → CreateBookingRequest
  ↓
Pass room IDs + customer + dates
  ↓
API: POST /employee/bookings
```

### 4. **new-reservation-form-modal.tsx** (Form Modal)
**Vị trí:** `components/reservations/new-reservation-form-modal.tsx`

**Quy Trình:**
```
Step 1: Chọn Khách Hàng (Customer)
  ↓
Step 2: Chọn Ngày & Phòng (RoomSelector)
  ↓
Step 3: Xác Nhận & Tạo Booking
```

---

## 🔗 API Contract

### Backend Endpoint
```
GET /employee/rooms/available?checkInDate=2026-01-15&checkOutDate=2026-01-18
```

### Response Format
```typescript
{
  data: [
    {
      roomType: {
        id: "clx123",
        name: "Phòng Đơn",
        basePrice: 500000,
        capacity: 1
      },
      availableCount: 5,
      rooms: [
        {
          id: "room-101",
          roomNumber: "101",
          floor: 1,
          roomType: { ... }
        },
        {
          id: "room-102",
          roomNumber: "102",
          floor: 1,
          roomType: { ... }
        }
      ]
    },
    {
      roomType: { ... },
      availableCount: 3,
      rooms: [ ... ]
    }
  ],
  total: 8,
  page: 1,
  limit: 10
}
```

### Create Booking
```typescript
POST /employee/bookings {
  customerId: "customer-123",
  rooms: [
    { roomId: "room-101" },
    { roomId: "room-102" }
  ],
  checkInDate: "2026-01-15T14:00:00Z",
  checkOutDate: "2026-01-18T12:00:00Z",
  totalGuests: 2
}
```

---

## ✅ Test Checklist

- ✅ Build thành công: `npm run build` ✓
- ✅ Dev server start: `npm run dev` ✓ (Port 3001)
- ✅ TypeScript types hợp lệ ✓
- ✅ Room selection UI hoàn thiện ✓
- ✅ Price calculation đúng ✓
- ✅ API integration ready ✓

---

## 🚀 Sử Dụng

### Workflow Người Dùng

1. **Mở Modal Tạo Đặt Phòng Mới**
   - Click "Tạo Đặt Phòng" → Form Modal mở

2. **Step 1: Chọn Khách Hàng**
   - Chọn khách hàng có sẵn hoặc tạo mới
   - Click "Tiếp Theo"

3. **Step 2: Chọn Ngày & Phòng**
   - Nhập ngày nhận + ngày trả
   - UI tự động tải danh sách phòng trống
   - Phòng được group theo loại, hiển thị giá rõ ràng
   - Click "Chọn" để chọn từng phòng cụ thể
   - Xem preview phòng đã chọn + tổng tiền
   - Có thể bỏ chọn bằng nút "Xóa"

4. **Step 3: Xác Nhận & Tạo Booking**
   - Review thông tin
   - Chọn phương thức thanh toán cọc
   - Click "Tạo Đặt Phòng"
   - Backend nhận room IDs + customer data + dates

---

## 📊 Data Flow

```
Frontend Component                 Backend API                 Database
─────────────────────────         ──────────────────          ────────────

RoomSelector
  ↓
[User input: dates]
  ↓
getAvailableRooms()
  ──────────────────────> GET /employee/rooms/available
                            ↓
                          [Check Booking overlaps]
                          [Filter by date/status]
                            ↓
                          <────────────────────── { data: [...] }
  ↓
[Display rooms grouped by type]
  ↓
[User selects specific rooms]
  ↓
[Calculate prices & totals]
  ↓
handleSaveReservation()
  ──────────────────────> POST /employee/bookings
                            { rooms: [{roomId}], ... }
                            ↓
                          [Create BookingRooms]
                          [Update Room status]
                          [Calculate totalAmount]
                            ↓
                          <────────────────────── { id, status, ... }
  ↓
[Success] → [Update UI] → [Show confirmation]
```

---

## 🎨 UI Improvements

1. **Room Type Grouping**
   - Header với gradient màu xanh dương
   - Hiển thị: Loại phòng | Sức chứa | Còn lại | Giá

2. **Room Display**
   - Grid layout dễ nhìn (2-4 cột tùy màn hình)
   - Card phòng: Số phòng | Tầng | Giá tổng | Nút Chọn
   - Hover effect: Border màu, shadow

3. **Selected Rooms**
   - Green background để phân biệt
   - Chi tiết giá: X₫/đêm × Y đêm = Z₫
   - Summary tổng tiền all rooms
   - Nút xóa riêng cho mỗi phòng

---

## 🔧 Technical Details

### SelectedRoom Interface
```typescript
interface SelectedRoom extends Room {
  selectedAt: string;           // Timestamp khi chọn
  checkInDate: string;          // Ngày nhận
  checkOutDate: string;         // Ngày trả
  numberOfGuests: number;       // Số khách
  pricePerNight: number;        // Giá/đêm
  nights?: number;              // Số đêm
  totalPrice?: number;          // Tổng = giá × đêm
}
```

### API Safe Handling
```typescript
// Booking service ensures safe extraction
let data: AvailableRoom[] = [];
if (Array.isArray(response)) {
  data = response;
} else if (response?.data && Array.isArray(response.data)) {
  data = response.data;
}
// Always returns array, never crashes
return data;
```

---

## 📌 Notes

- ✅ Phòng được chọn không hiển thị lại trong danh sách
- ✅ Số lượng phòng còn lại được tính động
- ✅ Hỗ trợ lọc phòng đa chiều (loại, tầng, giá, số phòng)
- ✅ Tính giá tự động dựa trên số đêm
- ✅ Backend API verified: Available rooms endpoint fully functional
- ✅ Data mapping fixed: Use actual pricePerNight, depositRequired from backend
- ✅ Status handling: Added PARTIALLY_CHECKED_OUT support

---

## 🏁 Status: READY FOR PRODUCTION ✓

Tất cả chức năng "chọn phòng cụ thể" đã được triển khai đầy đủ, build thành công, sẵn sàng để sử dụng!
