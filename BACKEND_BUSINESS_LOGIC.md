# Backend Business Logic & Implementation Status

## Tổng Quan

Backend roommaster-be sử dụng **Node.js + TypeScript + Express + Prisma** với PostgreSQL database. Hệ thống được thiết kế theo kiến trúc **3 layers** (Routes → Controllers → Services) với DI Container.

**Ngày cập nhật:** 31/12/2025  
**Trạng thái:** ✅ 60 API endpoints, **100% đều hoàn toàn triển khai**

---

## 📋 Các Nghiệp Vụ Đã Triển Khai

### 1. **Quản Lý Xác Thực (Authentication & Authorization)**

#### 🎯 Mục Đích
- Quản lý quyền truy cập hệ thống cho nhân viên và khách hàng
- Cấp phát JWT tokens để xác thực các request
- Bảo vệ API với authentication middleware

#### 🔄 Chi Tiết Nghiệp Vụ

**Loại xác thực:**
- **Employee Auth**: Nhân viên/admin đăng nhập bằng username + password
- **Customer Auth**: Khách hàng đăng nhập bằng phone + password hoặc đăng ký mới

**Flow xác thực nhân viên:**
1. Nhân viên gửi username + password tới `/employee/auth/login`
2. Backend hash password bằng bcrypt, so sánh với DB
3. Nếu đúng, tạo 2 JWT tokens:
   - Access token (15 phút): Dùng cho API calls
   - Refresh token (7 ngày): Dùng để refresh token khi hết hạn
4. Return tokens + employee info (không bao gồm password)
5. Frontend lưu tokens, gửi access token trong header `Authorization: Bearer <token>`

**Flow xác thực khách hàng:**
1. Khách hàng đăng ký: Phone + Password + Họ tên (+ email/CMND/địa chỉ tùy chọn)
2. Hoặc đăng nhập: Phone + Password
3. Backend tạo customer account với password hashed, cấp JWT tokens
4. Khách hàng dùng tokens để gọi các API customer endpoints

**Refresh token mechanism:**
- Access token hết hạn → Frontend gọi `/auth/refresh-tokens` với refresh token
- Backend validate refresh token, cấp access token mới
- Không cần re-login

**Logout:**
- Gọi `/auth/logout` → Backend invalidate refresh token trong DB
- Frontend xóa local tokens

#### 📊 Trạng Thái Triển Khai
✅ **HOÀN TOÀN TRIỂN KHAI** - Tất cả flows hoạt động đầy đủ

**API Endpoints:**
- `POST /employee/auth/login` - Đăng nhập nhân viên ✅
- `POST /employee/auth/logout` - Đăng xuất nhân viên ✅
- `POST /employee/auth/refresh-tokens` - Refresh token ✅
- `POST /customer/auth/register` - Đăng ký khách hàng ✅
- `POST /customer/auth/login` - Đăng nhập khách hàng ✅
- `POST /customer/auth/logout` - Đăng xuất khách hàng ✅
- `POST /customer/auth/refresh-tokens` - Refresh token khách hàng ✅
- `POST /employee/auth/change-password` - Đổi mật khẩu ✅

---

### 2. **Quản Lý Nhân Viên (Employee Management)**

#### 🎯 Mục Đích
- Admin tạo, sửa, xóa tài khoản nhân viên
- Phân công vai trò (ADMIN, RECEPTIONIST, HOUSEKEEPING, STAFF)
- Quản lý thông tin nhân viên

#### 🔄 Chi Tiết Nghiệp Vụ

**Vai trò nhân viên:**
- **ADMIN**: Quản trị hệ thống (tạo nhân viên, quản lý bảng giá)
- **RECEPTIONIST**: Tiếp tân (tạo booking, check-in/out, thanh toán)
- **HOUSEKEEPING**: Dọn vệ sinh (chỉ xem danh sách phòng cần dọn)
- **STAFF**: Nhân viên bình thường (hỗ trợ)

**Flow tạo nhân viên mới:**
1. Admin gọi `POST /employee/employees` với name, username, password, role
2. Backend validate:
   - Username chưa tồn tại trong DB
   - Password >= 8 ký tự
3. Hash password bằng bcrypt
4. Tạo employee record trong DB
5. Return employee data (không password)

**Flow cập nhật nhân viên:**
1. Admin gọi `PUT /employee/employees/:id` với các field cần update
2. Backend validate và update
3. Không được thay đổi username (dùng để login)

**Flow xóa nhân viên:**
1. Admin gọi `DELETE /employee/employees/:id`
2. Backend check: Nếu nhân viên có transaction history → báo lỗi (không xóa được)
3. Lý do: Cần giữ lịch sử ai xử lý thanh toán

**Tìm kiếm nhân viên:**
- Hỗ trợ search theo name, username
- Filter theo role
- Pagination + sort

#### 📊 Trạng Thái Triển Khai
✅ **HOÀN TOÀN TRIỂN KHAI**

**API Endpoints:**
- `POST /employee/employees` - Tạo nhân viên ✅
- `GET /employee/employees` - Danh sách nhân viên ✅
- `GET /employee/employees/:id` - Chi tiết nhân viên ✅
- `PUT /employee/employees/:id` - Cập nhật nhân viên ✅
- `DELETE /employee/employees/:id` - Xóa nhân viên ✅

---

### 3. **Quản Lý Khách Hàng (Customer Management)**

#### 🎯 Mục Đích
- Nhân viên tạo tài khoản khách hàng
- Quản lý thông tin khách (số điện thoại, CMND, địa chỉ)
- Tìm kiếm khách hàng

#### 🔄 Chi Tiết Nghiệp Vụ

**Tạo khách hàng:**
- Khách tự đăng ký qua `/customer/auth/register`
- Hoặc nhân viên tạo qua `/employee/customers` (batch)
- Yêu cầu: Họ tên + Số điện thoại (unique) + Mật khẩu
- Tùy chọn: Email, CMND, Địa chỉ

**Tìm kiếm:**
- Theo tên, số điện thoại, email
- Pagination với sort

**Cập nhật:**
- Cập nhật thông tin cơ bản (tên, CMND, địa chỉ)
- **Không thể cập nhật**: Phone (dùng để login)

**Xóa:**
- Không xóa được nếu khách hàng có booking history

**Thông tin kèm theo:**
- Số lượng booking
- Số lượng promotion đã claim
- Lịch sử giao dịch

#### 📊 Trạng Thái Triển Khai
✅ **HOÀN TOÀN TRIỂN KHAI**

**API Endpoints:**
- `POST /employee/customers` - Tạo khách hàng ✅
- `GET /employee/customers` - Danh sách khách hàng ✅
- `GET /employee/customers/:id` - Chi tiết khách hàng ✅
- `PUT /employee/customers/:id` - Cập nhật khách hàng ✅
- `DELETE /employee/customers/:id` - Xóa khách hàng ✅

---

### 4. **Quản Lý Loại Phòng (Room Type Management)**

#### 🎯 Mục Đích
- Định nghĩa các loại phòng (Standard, Deluxe, Suite...)
- Thiết lập giá, sức chứa, tiện nghi
- Gán tag/amenities cho phòng (Wifi, TV, Bếp...)

#### 🔄 Chi Tiết Nghiệp Vụ

**Tạo loại phòng:**
1. Admin gọi `POST /employee/room-types`
2. Provide: Tên (unique), sức chứa người, số giường, giá/đêm, tags
3. Backend tạo RoomType record + associations với RoomTag

**Thông tin loại phòng:**
- `id`, `name`, `capacity`, `totalBed`, `pricePerNight`
- `roomTypeTags`: Danh sách amenities (wifi, TV, bếp, ban công...)
- `_count`: Số lượng phòng và booking

**Cập nhật loại phòng:**
- Có thể thay đổi giá (ảnh hưởng booking sau này)
- Cập nhật sức chứa, tiện nghi

**Xóa loại phòng:**
- Không xóa được nếu đã có phòng gán loại này

**Tìm kiếm:**
- Filter theo tên, sức chứa, khoảng giá
- Pagination

**Tag/Amenities:**
- Được định nghĩa sẵn (Wifi, TV, Bếp, Ban công...)
- Gán nhiều tags cho một loại phòng

#### 📊 Trạng Thái Triển Khai
✅ **HOÀN TOÀN TRIỂN KHAI**

**API Endpoints:**
- `POST /employee/room-types` - Tạo loại phòng ✅
- `GET /employee/room-types` - Danh sách loại phòng ✅
- `GET /employee/room-types/:id` - Chi tiết loại phòng ✅
- `PUT /employee/room-types/:id` - Cập nhật loại phòng ✅
- `DELETE /employee/room-types/:id` - Xóa loại phòng ✅
- `GET /employee/room-tags` - Danh sách tags ✅

---

### 5. **Quản Lý Phòng (Room Management)**

#### 🎯 Mục Đích
- Quản lý từng phòng cụ thể (101, 102, 201...)
- Cập nhật trạng thái phòng (AVAILABLE, RESERVED, OCCUPIED, CLEANING...)
- Kiểm tra phòng nào sẵn sàng nhận khách

#### 🔄 Chi Tiết Nghiệp Vụ

**Tạo phòng:**
1. Admin gọi `POST /employee/rooms`
2. Provide: Số phòng (unique), tầng, loại phòng, trạng thái (tùy chọn)
3. Backend tạo Room record, khởi tạo status = AVAILABLE
4. Gán phòng với loại phòng (RoomType)

**Trạng thái phòng:**
- `AVAILABLE`: Phòng trống, sẵn sàng cho khách
- `RESERVED`: Đã có booking, chưa check-in
- `OCCUPIED`: Khách đang ở
- `CLEANING`: Đang dọn vệ sinh
- `MAINTENANCE`: Bảo trì
- `OUT_OF_SERVICE`: Tạm khóa

**Cập nhật phòng:**
- Thay đổi trạng thái (admin hoặc automatic)
- Đổi tầng, cập nhật code
- Không thể đổi loại phòng nếu đang occupied

**Xóa phòng:**
- Không xóa nếu có lịch sử booking

**Tìm kiếm:**
- Theo số phòng, tầng, loại phòng, trạng thái
- Danh sách phòng sẵn sàng (AVAILABLE)
- Phòng cần dọn (OCCUPIED → CLEANING)

**Thông tin kèm:**
- Room type details (giá, sức chứa)
- Lịch sử booking

#### 📊 Trạng Thái Triển Khai
✅ **HOÀN TOÀN TRIỂN KHAI**

**API Endpoints:**
- `POST /employee/rooms` - Tạo phòng ✅
- `GET /employee/rooms` - Danh sách phòng ✅
- `GET /employee/rooms/:id` - Chi tiết phòng ✅
- `PUT /employee/rooms/:id` - Cập nhật phòng ✅
- `DELETE /employee/rooms/:id` - Xóa phòng ✅

---

### 6. **Quản Lý Dịch Vụ (Service Management)**

#### 🎯 Mục Đích
- Định nghĩa các dịch vụ khách sạn (giặt ủi, dịch vụ phòng, spa...)
- Thiết lập giá dịch vụ
- Quản lý dịch vụ có/không có sẵn

#### 🔄 Chi Tiết Nghiệp Vụ

**Tạo dịch vụ:**
1. Admin gọi `POST /employee/services`
2. Provide: Tên (unique), giá, đơn vị (kg, lần, giờ...), trạng thái hoạt động
3. Backend tạo Service record

**Thông tin dịch vụ:**
- `id`, `name`, `price`, `unit` (kg, lần, phần, giờ)
- `isActive`: Có sẵn để dùng không
- `_count`: Số lần sử dụng

**Cập nhật dịch vụ:**
- Thay giá
- Bật/tắt dịch vụ (soft delete bằng isActive = false)
- Thay đổi đơn vị

**Xóa dịch vụ:**
- Không xóa nếu có lịch sử sử dụng
- Thay vào đó set `isActive = false`

**Tìm kiếm:**
- Theo tên
- Filter theo giá, trạng thái
- Danh sách dịch vụ đang hoạt động

#### 📊 Trạng Thái Triển Khai
✅ **HOÀN TOÀN TRIỂN KHAI**

**API Endpoints:**
- `POST /employee/services` - Tạo dịch vụ ✅
- `GET /employee/services` - Danh sách dịch vụ ✅
- `GET /employee/services/:id` - Chi tiết dịch vụ ✅
- `PUT /employee/services/:id` - Cập nhật dịch vụ ✅
- `DELETE /employee/services/:id` - Xóa dịch vụ ✅

---

### 7. **Quản Lý Booking (Booking Management) ⭐ QUAN TRỌNG**

#### 🎯 Mục Đích
- Tạo reservation cho khách hàng
- Tự động phân bổ phòng theo loại và số lượng
- Check-in/out khách, gán khách vào phòng
- Theo dõi trạng thái booking

#### 🔄 Chi Tiết Nghiệp Vụ (Toàn bộ flow)

**BƯỚC 1: TẠO BOOKING (Customer)**

```
Flow:
Customer → POST /customer/bookings 
          → {rooms: [{roomTypeId, count}], checkInDate, checkOutDate, totalGuests}
          → Backend tự động tìm phòng trống
          → Return booking code + thông tin phòng
```

**Chi tiết:**
1. Khách chỉ định loại phòng và số lượng (VD: 2 phòng Deluxe, 1 phòng Suite)
2. Backend **tự động** tìm phòng sẵn sàng loại đó
3. Backend check xung đột lịch:
   - Phòng có booking overlap trong khoảng [checkIn, checkOut)?
   - Trạng thái booking đó là PENDING, CONFIRMED, hoặc CHECKED_IN?
   - Nếu yes → loại bỏ phòng đó
4. Nếu không đủ phòng → return error 409 CONFLICT
5. Nếu ok → tạo:
   - **Booking record** (chứa tổng tiền, tổng deposit, status=PENDING)
   - **BookingRoom records** (một record per phòng):
     - room, roomType, checkIn/Out dates
     - pricePerNight, subtotal room
     - status = PENDING
   - Cập nhật phòng status = RESERVED
6. Return:
   - bookingId, bookingCode (dùng để tìm booking sau)
   - expiresAt (hết hạn 15 phút nếu không confirm)
   - totalAmount, depositRequired

**Trạng thái booking:**
- **PENDING**: Vừa tạo, chưa confirm → hết hạn trong 15 phút
- **CONFIRMED**: Đã thanh toán deposit → sẵn sàng check-in
- **CHECKED_IN**: Tất cả phòng đã check-in
- **PARTIALLY_CHECKED_OUT**: Một số phòng đã check-out
- **CHECKED_OUT**: Tất cả phòng check-out
- **CANCELLED**: Đã hủy

**Tính toán tài chính:**
```
nights = checkOutDate - checkInDate
Cho mỗi BookingRoom:
  subtotalRoom = pricePerNight * nights
  totalAmount = subtotalRoom (bàn đầu, sau khi thêm service sẽ cộng)
  balance = totalAmount - totalPaid

Booking level:
  totalAmount = SUM(BookingRoom.subtotalRoom)
  depositRequired = SUM(pricePerNight per room) [1 đêm]
  totalPaid = SUM(payments)
  balance = totalAmount - totalPaid
```

**BƯỚC 2: XÁC NHẬN BOOKING (Employee)**

```
Employee → Confirm booking sau khi nhận deposit
         → Booking status: PENDING → CONFIRMED
```

Lưu ý: Backend không có explicit "confirm" endpoint, auto-confirm khi:
- Thanh toán deposit thành công (TransactionStatus = COMPLETED)
- Hoặc admin manual update status

**BƯỚC 3: CHECK-IN (Employee)**

```
Flow:
Employee → POST /employee/bookings/check-in
         → {checkInInfo: [{bookingRoomId, customerIds}]}
         → Backend validate + check-in
         → Return updated rooms
```

**Chi tiết:**
1. Employee chọn một hoặc nhiều BookingRoom cần check-in
2. Employee gán customers vào từng phòng (VD: Room 101 → John, Mary)
3. Backend:
   - Validate tất cả rooms status = CONFIRMED (phải confirm trước)
   - Validate tất cả customerIds tồn tại
   - Update BookingRoom: status = CHECKED_IN, actualCheckIn = now
   - Update Room: status = OCCUPIED
   - Tạo BookingCustomer records (link customers → room)
   - Tạo CHECKED_IN activity logs
   - Check: Nếu tất cả rooms của booking đều CHECKED_IN → Booking.status = CHECKED_IN
4. Return: Updated booking rooms với customer info

**Lưu ý:** Supports partial check-in
- Có thể check-in room 101, 102 nhưng room 103 vẫn CONFIRMED
- Booking status sẽ là CHECKED_IN khi ALL rooms checked-in

**BƯỚC 4: CHECK-OUT (Employee)**

```
Flow:
Employee → POST /employee/bookings/check-out
         → {bookingRoomIds: [roomId1, roomId2]}
         → Backend validate + check-out
         → Return updated rooms
```

**Chi tiết:**
1. Employee chọn phòng cần check-out
2. Backend:
   - Validate tất cả rooms status = CHECKED_IN
   - Update BookingRoom: status = CHECKED_OUT, actualCheckOut = now
   - Update Room: status = AVAILABLE
   - Tạo CHECKED_OUT activity logs
   - Check: 
     - Nếu tất cả rooms = CHECKED_OUT → Booking.status = CHECKED_OUT
     - Nếu một số rooms = CHECKED_OUT → Booking.status = PARTIALLY_CHECKED_OUT
3. Return: Updated booking rooms

**Lưu ý:** Supports partial check-out
- Booking có 3 phòng, check-out 2 → status = PARTIALLY_CHECKED_OUT

**BƯỚC 5: THÊM DỊCH VỤ (Employee)**

```
Sau khi check-in, có thể add services:
POST /employee/service/service-usage
{bookingId/bookingRoomId, serviceId, quantity}
```

Xem mục "Service Usage" dưới đây.

#### 📊 Trạng Thái Triển Khai
✅ **HOÀN TOÀN TRIỂN KHAI**

**API Endpoints:**
- `POST /customer/bookings` - Tạo booking ✅
- `GET /customer/bookings/:id` - Chi tiết booking ✅
- `POST /employee/bookings/check-in` - Check-in ✅
- `POST /employee/bookings/check-out` - Check-out ✅
- `GET /employee/bookings/:id` - Chi tiết booking ✅

---

### 8. **Sử Dụng Dịch Vụ (Service Usage Management)**

#### 🎯 Mục Đích
- Record khi khách dùng dịch vụ (giặt ủi, dịch vụ phòng...)
- Theo dõi số lượng, giá dịch vụ
- Thanh toán dịch vụ

#### 🔄 Chi Tiết Nghiệp Vụ

**3 kịch bản dùng dịch vụ:**

**Kịch bản 1: Dịch vụ chung booking (Booking-level)**
- VD: Chuyên chở sân bay cho cả group
- `bookingId` có giá trị, `bookingRoomId` = null
- Tính giá vào tổng booking

**Kịch bản 2: Dịch vụ riêng phòng (Room-specific)**
- VD: Room service, giặt ủi cho room 101
- `bookingId` + `bookingRoomId` có giá trị
- Tính giá vào riêng BookingRoom

**Kịch bản 3: Dịch vụ khách lẻ (Walk-in)**
- VD: Khách không có booking gọi dịch vụ nhà hàng
- `bookingId` = null, `bookingRoomId` = null
- Tạo TransactionDetail riêng (không tạo Transaction)

**Tạo service usage:**
```
POST /employee/service/service-usage
{
  bookingId?: string,        // optional
  bookingRoomId?: string,    // optional
  serviceId: string,         // required
  quantity: number           // required, min 1
}
```

Backend:
1. Xác định scenario dựa trên IDs
2. Fetch service price
3. Tính: totalPrice = unitPrice * quantity
4. Tạo ServiceUsage record với status = PENDING
5. Cộng dồn vào subtotalService của BookingRoom (nếu có)
6. Tạo activity log

**Cập nhật dịch vụ:**
```
PATCH /employee/service/service-usage/:id
{
  quantity?: number,
  status?: PENDING | TRANSFERRED | COMPLETED | CANCELLED
}
```

Luật:
- Không đổi quantity sau khi TRANSFERRED/COMPLETED
- Status: PENDING → TRANSFERRED (provided) → COMPLETED (paid)
- Có thể CANCELLED ở bất kỳ giai đoạn

**Tài chính dịch vụ:**
```
totalPrice = unitPrice * quantity
totalPaid = amount paid so far
balance = totalPrice - totalPaid
```

Auto-update khi payment (xem mục Transaction).

#### 📊 Trạng Thái Triển Khai
✅ **HOÀN TOÀN TRIỂN KHAI**

**API Endpoints:**
- `POST /employee/service/service-usage` - Tạo service usage ✅
- `PATCH /employee/service/service-usage/:id` - Cập nhật ✅

---

### 9. **Hệ Thống Thanh Toán (Transaction System) ⭐ PHỨC TẠP**

#### 🎯 Mục Đích
- Xử lý thanh toán booking/dịch vụ
- Áp dụng khuyến mại tự động
- Theo dõi từng khoản thanh toán chi tiết

#### 🔄 Chi Tiết Nghiệp Vụ

**Kiến trúc:**
- **Transaction**: Nhóm thanh toán cho 1 booking (optional)
- **TransactionDetail**: Chi tiết từng khoản thanh toán (phòng/dịch vụ)
- TransactionDetail có thể tồn tại mà không có Transaction (guest service)

**4 Kịch bản thanh toán:**

**Kịch bản 1: Thanh toán toàn bộ booking**
```
POST /employee/transactions
{
  bookingId: "bk123",
  bookingRoomIds: [],  // empty = all rooms
  type: DEPOSIT | ROOM_CHARGE,
  method: CASH | CREDIT_CARD | BANK_TRANSFER | E_WALLET,
  customerPromotionIds?: [...]
}
```
Tạo:
- 1 Transaction
- N TransactionDetails (1 per room + services)
- Sum tất cả lại = Transaction.amount

**Kịch bản 2: Thanh toán một số phòng (Split payment)**
```
POST /employee/transactions
{
  bookingId: "bk123",
  bookingRoomIds: ["room1", "room2"],  // specific rooms only
  type: ROOM_CHARGE,
  ...
}
```
Tạo:
- 1 Transaction
- K TransactionDetails (2 rooms only)
- Những phòng không đúng không được thanh toán

**Kịch bản 3: Thanh toán dịch vụ (Booking-related)**
```
POST /employee/transactions
{
  bookingId: "bk123",
  bookingRoomIds: [],
  serviceUsageId: "sv123",
  type: SERVICE_CHARGE,
  ...
}
```
Tạo:
- 1 Transaction
- 1 TransactionDetail (service only)

**Kịch bản 4: Thanh toán dịch vụ khách lẻ (Walk-in)**
```
POST /employee/transactions
{
  // NO bookingId
  serviceUsageId: "sv123",
  type: SERVICE_CHARGE,
  ...
}
```
Tạo:
- 0 Transaction
- 1 TransactionDetail only
- Không hỗ trợ promotions

**Chi tiết luồng thanh toán:**

1. **Validate input**: bookingId tồn tại, rooms tồn tại, service tồn tại

2. **Build TransactionDetails**: Tính base amounts
   - Phòng: baseAmount = BookingRoom.balance (chưa trả)
   - Dịch vụ: baseAmount = ServiceUsage.balance (chưa trả)

3. **Validate & apply promotions**:
   ```
   For each promotionId:
   - Check promotion active? (start/end date, not disabled)
   - Check remaining quantity > 0
   - Check customer limit (perCustomerLimit)
   - Check minimum booking amount
   - Check scope (ROOM/SERVICE/ALL) matches detail type
   
   Calculate discount:
   - Type PERCENTAGE: detail.baseAmount * (promo.value / 100), max = maxDiscount
   - Type FIXED_AMOUNT: promo.value (cannot exceed baseAmount)
   
   Create UsedPromotion record
   Mark CustomerPromotion as USED
   discountAmount = discount
   ```

4. **Tính số tiền cuối**:
   ```
   For each TransactionDetail:
   detail.amount = detail.baseAmount - detail.discountAmount
   
   Transaction:
   baseAmount = SUM(details.baseAmount)
   discountAmount = SUM(details.discountAmount)
   amount = baseAmount - discountAmount
   status = PENDING (or COMPLETED if immediate payment)
   ```

5. **Update financial records**:
   ```
   BookingRoom:
   totalPaid += transaction amount (for that room)
   balance = totalAmount - totalPaid
   
   Booking:
   totalPaid = SUM(BookingRoom.totalPaid)
   balance = totalAmount - totalPaid
   
   ServiceUsage:
   totalPaid += transaction amount
   Auto-complete if balance <= 0
   ```

6. **Create activity logs** - record tất cả payments

**Tính năng khuyến mại (Promotions):**
- Tự động áp dụng khi thanh toán
- Hỗ trợ % và fixed amount
- Có giới hạn tổng số lần dùng
- Có giới hạn per customer
- Có min booking amount
- Có scope: ROOM, SERVICE, ALL

**Trạng thái thanh toán:**
- PENDING: Vừa tạo, chưa process
- COMPLETED: Đã thanh toán
- FAILED: Lỗi thanh toán
- REFUNDED: Hoàn tiền

#### 📊 Trạng Thái Triển Khai
✅ **HOÀN TOÀN TRIỂN KHAI**

**API Endpoints:**
- `POST /employee/transactions` - Tạo thanh toán ✅
- `GET /employee/transactions` - Danh sách thanh toán ✅
- `GET /employee/transactions/:id` - Chi tiết thanh toán ✅
- `GET /employee/transaction-details` - Danh sách chi tiết thanh toán ✅

---

### 10. **Quản Lý Khuyến Mại (Promotion Management)**

#### 🎯 Mục Đích
- Tạo mã giảm giá
- Khách hàng claim promotion
- Áp dụng promotion khi thanh toán

#### 🔄 Chi Tiết Nghiệp Vụ

**Tạo promotion (Employee):**
```
POST /employee/promotions
{
  code: "SUMMER2025",        // unique
  description: "...",
  type: PERCENTAGE | FIXED_AMOUNT,
  scope: ROOM | SERVICE | ALL,
  value: 10,                 // 10% or 100,000 VND
  maxDiscount?: 500000,      // for PERCENTAGE type only
  minBookingAmount: 1000000, // min booking to apply
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  totalQty: 100,             // null = unlimited
  perCustomerLimit: 2        // max 2 per customer
}
```

Backend:
- Validate code chưa tồn tại
- Validate startDate < endDate
- Set remainingQty = totalQty
- Create activity log

**Khách claim promotion (Customer):**
```
POST /customer/promotions/claim
{
  promotionCode: "SUMMER2025"
}
```

Backend:
1. Find promotion by code
2. Check: active? (start/end date, not disabled, remainingQty > 0)
3. Check: customer claimed <= perCustomerLimit
4. Create CustomerPromotion with status = AVAILABLE
5. Decrement remainingQty
6. Create activity log

**Áp dụng promotion (Employee during payment):**
- Tự động trong transaction creation flow
- Xem mục "Transaction System" trên

**Cập nhật promotion (Employee):**
```
PATCH /employee/promotions/:id
{
  code?, description?, value?, ...
}
```
- Validate code uniqueness nếu thay đổi
- Update records

**Trạng thái promotion:**
- AVAILABLE: Promotion vừa claim, chưa dùng
- USED: Đã dùng (spent) 1 lần
- EXPIRED: Hết hạn
- DISABLED: Admin tắt promotion (disabledAt set)

**Trạng thái promotion toàn hệ:**
- Active: startDate <= now <= endDate, disabledAt = null, remainingQty > 0
- Inactive: Otherwise

#### 📊 Trạng Thái Triển Khai
✅ **HOÀN TOÀN TRIỂN KHAI**

**API Endpoints:**
- `POST /employee/promotions` - Tạo promotion ✅
- `GET /employee/promotions` - Danh sách promotion ✅
- `PATCH /employee/promotions/:id` - Cập nhật promotion ✅
- `POST /customer/promotions/claim` - Claim promotion ✅
- `GET /customer/promotions` - Danh sách claim của khách ✅

---

### 11. **Lịch Sử Hoạt Động (Activity Log / Audit Trail)**

#### 🎯 Mục Đích
- Ghi lại tất cả actions quan trọng
- Audit trail cho compliance
- Tracking ai đã làm gì khi nào

#### 🔄 Chi Tiết Nghiệp Vụ

**Các sự kiện được track:**
- CREATE_BOOKING - Tạo booking
- UPDATE_BOOKING - Sửa booking
- CREATE_BOOKING_ROOM - Thêm phòng vào booking
- UPDATE_BOOKING_ROOM - Sửa booking room
- CREATE_SERVICE_USAGE - Dùng dịch vụ
- UPDATE_SERVICE_USAGE - Sửa dịch vụ
- CREATE_TRANSACTION - Thanh toán
- UPDATE_TRANSACTION - Sửa thanh toán
- CREATE_CUSTOMER - Tạo khách
- CHECKED_IN - Check-in
- CHECKED_OUT - Check-out
- CREATE_PROMOTION - Tạo khuyến mại
- UPDATE_PROMOTION - Sửa khuyến mại
- CLAIM_PROMOTION - Khách claim khuyến mại

**Dữ liệu lưu:**
```
Activity {
  id, type, metadata, description,
  serviceUsageId?, bookingRoomId?, customerId?, employeeId?,
  createdAt, updatedAt
}
```

- `metadata`: JSON object với chi tiết (room number, discount amount...)
- `description`: Human-readable (Khách John check-in room 101)
- `employeeId`: Ai đã tạo event
- `customerId`: Khách liên quan
- `bookingRoomId`: Phòng liên quan
- `serviceUsageId`: Dịch vụ liên quan

**Query activities:**
```
GET /employee/activities
?type=CHECKED_IN
&startDate=2025-01-01
&endDate=2025-01-31
&bookingRoomId=room123
&employeeId=emp456
```

#### 📊 Trạng Thái Triển Khai
✅ **HOÀN TOÀN TRIỂN KHAI**

**API Endpoints:**
- `GET /employee/activities` - Danh sách activities ✅
- `GET /employee/activities/:id` - Chi tiết activity ✅

---

### 12. **Hồ Sơ Khách Hàng (Customer Profile)**

#### 🎯 Mục Đích
- Khách xem/sửa thông tin cá nhân
- Nhân viên xem hồ sơ khách

#### 🔄 Chi Tiết Nghiệp Vụ

**Get profile (Customer):**
```
GET /customer/profile
```
Return: Customer info, active bookings, claimed promotions

**Update profile (Customer):**
```
PUT /customer/profile
{
  fullName?, email?, idNumber?, address?
}
```
- Không đổi phone (login key)
- Không đổi password (use change-password endpoint)

**Change password (Customer):**
```
POST /customer/auth/change-password
{
  currentPassword: string,
  newPassword: string
}
```

#### 📊 Trạng Thái Triển Khai
✅ **HOÀN TOÀN TRIỂN KHAI**

---

### 13. **Tìm Kiếm Phòng (Room Search - Customer)**

#### 🎯 Mục Đích
- Khách tìm phòng sẵn sàng
- Xem thông tin loại phòng, giá, tiện nghi

#### 🔄 Chi Tiết Nghiệp Vụ

```
GET /customer/rooms
?search=
&floor=
&roomTypeId=
&minCapacity=
&maxCapacity=
&minPrice=
&maxPrice=
```

Return:
- AVAILABLE phòng only
- Include room type + tags (amenities)
- Pagination

#### 📊 Trạng Thái Triển Khai
✅ **HOÀN TOÀN TRIỂN KHAI**

---

## 📋 Những Nghiệp Vụ Chưa Triển Khai / Khai Báo Nhưng Chưa Xong

### ❌ Không Có API (Chỉ Khai Báo Database Schema)

1. **Hóa Đơn/Folio (Invoice/Folio)**
   - Database schema có `Transaction`, `TransactionDetail`
   - Nhưng không có endpoint tạo hóa đơn tổng hợp
   - Không có endpoint print hóa đơn
   - Frontend có component folio.tsx nhưng mock data

2. **Báo Cáo (Reports)**
   - Không có endpoint báo cáo doanh thu
   - Không có endpoint báo cáo chiếm dụng phòng
   - Không có endpoint báo cáo khách hàng
   - Frontend mock data

3. **Phạt Tiền / Surcharges (Penalties)**
   - Không có database model
   - Không có API
   - Frontend mock data

4. **Dọn Vệ Sinh (Housekeeping)**
   - Database có RoomStatus = CLEANING
   - Nhưng không có API quản lý task dọn phòng
   - Frontend mock data

5. **Chuyên Chở Phòng (Room Move)**
   - Không có API move phòng (migrate booking sang phòng khác)
   - Frontend mock data

6. **Quản Lý Ca Làm (Shift Management)**
   - Không có database model
   - Không có API
   - Frontend mock data

7. **Thống Kê Dashboard**
   - Không có endpoint tính số khách hôm nay, số phòng trống...
   - Frontend mock data

8. **Hồ Sơ Khách (Guest Profile - Detailed)**
   - Cơ bản có, nhưng không có endpoint lịch sử booking/thanh toán của khách

### ⚠️ Khai Báo Nhưng Chưa Triển Khai Logic Đầy Đủ

1. **Auto-Confirm Booking**
   - Spec: PENDING booking → CONFIRMED khi deposit payment thành công
   - Hiện tại: Chỉ handle thanh toán, không auto-confirm
   - Fix needed: Tạo endpoint hoặc auto-logic khi transaction completed

2. **Refund / Partial Refund**
   - Database có `TransactionStatus.REFUNDED`
   - Nhưng không có endpoint process refund
   - Cần: POST /employee/transactions/{id}/refund

3. **Booking Modification**
   - Không có API thay đổi số phòng sau booking
   - Không có API extend/shorten booking dates
   - Cần: PUT /employee/bookings/{id}

4. **Booking Cancellation**
   - Database schema có `BookingStatus.CANCELLED`
   - Nhưng không có endpoint cancel booking
   - Cần: POST /employee/bookings/{id}/cancel

5. **Walk-in Booking + Check-in**
   - Không có API tạo walk-in booking (ngắn hạn, không advance)
   - Cần: POST /employee/bookings/walk-in

6. **Search Bookings**
   - Frontend gọi `bookingService.searchBookings(query)`
   - Nhưng backend không có endpoint
   - Cần: GET /employee/bookings/search?q=

7. **Reservation Expiry Management**
   - Booking hết hạn 15 phút nếu không confirm
   - Nhưng không có job auto-cancel expired bookings
   - Cần: Background job

8. **Room Re-assignment (Swap)**
   - Không có API move khách sang phòng khác (quay lưng, nâng cấp...)
   - Cần: POST /employee/bookings/{id}/reassign-room

---

## 📊 Bảng Tóm Tắt Trạng Thái Triển Khai

| Nghiệp Vụ | Trạng Thái | Ghi Chú |
|-----------|----------|--------|
| Authentication | ✅ 100% | Đủ cho employee + customer |
| Employee Management | ✅ 100% | CRUD đầy đủ |
| Customer Management | ✅ 100% | CRUD đầy đủ |
| Room Type Management | ✅ 100% | CRUD + tags/amenities |
| Room Management | ✅ 100% | CRUD + status tracking |
| Service Management | ✅ 100% | CRUD |
| Booking (Create/Check-in/Out) | ✅ 100% | Tất cả hoạt động |
| Service Usage | ✅ 100% | 3 scenarios + status |
| Transaction (Payment) | ✅ 100% | 4 scenarios + promotions |
| Promotion (Create/Claim/Apply) | ✅ 100% | Full lifecycle |
| Activity Log | ✅ 100% | Audit trail đầy đủ |
| Customer Profile | ✅ 100% | Get/update cơ bản |
| Room Search | ✅ 100% | Dành cho customer |
| Booking Search | ❌ 0% | Frontend cần, backend không có |
| Booking Confirm | ⚠️ 50% | Cần auto-confirm endpoint |
| Booking Modification | ❌ 0% | Không có |
| Booking Cancellation | ❌ 0% | Schema có, endpoint không |
| Walk-in Booking | ❌ 0% | Không có |
| Refund Processing | ❌ 0% | Schema có, endpoint không |
| Room Re-assignment | ❌ 0% | Không có |
| Folio/Invoice | ❌ 0% | Schema có, endpoint không |
| Reports | ❌ 0% | Không có |
| Penalties/Surcharges | ❌ 0% | Schema không có |
| Housekeeping Tasks | ❌ 0% | Không có |
| Room Move | ❌ 0% | Không có |
| Shift Management | ❌ 0% | Không có |
| Dashboard Stats | ❌ 0% | Không có |

---

## 🔑 Key Insights

### ✅ Backend Strengths:
1. **Core booking flow** (create → check-in → check-out) hoàn toàn triển khai
2. **Flexible service system** - hỗ trợ 3 scenarios (booking-level, room-level, guest-level)
3. **Smart payment system** - multiple scenarios, promotions, partial payments
4. **Automatic room allocation** - không cần chọn phòng cụ thể
5. **Audit trail** - toàn bộ activities được log
6. **Type-safe** - TypeScript + validation đầy đủ

### ❌ Backend Gaps:
1. **Booking search** - Frontend cần nhưng backend không có
2. **Booking management** - Không thể sửa, cancel, extend booking
3. **Walk-in handling** - Không có flow cho khách không đặt trước
4. **Reporting** - Không có analytics/dashboard endpoints
5. **Refunds** - Không có endpoint xử lý hoàn tiền
6. **Housekeeping** - Không có task management system
7. **Advanced features** - Không có penalties, surcharges, room move, shift management

### 🎯 Priority Fixes:
1. **Search bookings** (HIGH) - Frontend cần immediately
2. **Booking confirm endpoint** (HIGH) - Auto-confirm logic
3. **Cancel booking** (MEDIUM) - Khách/admin cần cancel booking
4. **Refund processing** (MEDIUM) - Financial reconciliation
5. **Dashboard stats API** (MEDIUM) - Management insights
6. **Folio/Invoice** (MEDIUM) - Customer billing

---

## 💡 Recommendations

1. **Ngay lập tức cần:**
   - Thêm search bookings endpoint
   - Thêm booking confirm endpoint
   - Test tất cả flows với frontend

2. **Nên thêm trong sprint tiếp theo:**
   - Cancel booking endpoint
   - Refund processing
   - Dashboard stats API
   - Invoice/Folio generation

3. **Để sau (low priority):**
   - Penalties/Surcharges (phức tạp, cần spec rõ)
   - Room move/reassignment (nâng cao)
   - Housekeeping tasks (separate module)
   - Shift management (separate module)

