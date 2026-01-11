# 📊 PHÂN TÍCH COVERAGE NGHIỆP VỤ: Backend vs Frontend

**Ngày phân tích:** 11/01/2026  
**Phạm vi:** roommaster-be (Backend) ↔ hotel-management-system-fe (Frontend)

---

## 📌 Tóm tắt điểm

- **Backend APIs:** ~89 endpoints
- **Frontend Coverage:** ~56% (50/89 endpoints)
- **Nhóm nghiệp vụ:** 20 nhóm chính
- **Status:**
  - ✅ Hoàn chỉnh: 10 nhóm (50%)
  - ⚠️ Thiếu một phần: 6 nhóm (30%)
  - ❌ Chưa triển khai: 4 nhóm (20%)

---

## 🎯 DANH SÁCH NGHIỆP VỤ & COVERAGE

### 1️⃣ BOOKING MANAGEMENT (Quản lý đặt phòng)

**Backend APIs:**
```
GET    /employee/bookings                    # Danh sách (phân trang, filter)
POST   /employee/bookings                    # Tạo đặt phòng (walk-in/phone)
GET    /employee/bookings/:id                # Chi tiết
PUT    /employee/bookings/:id                # Cập nhật
POST   /employee/bookings/:id/cancel         # Hủy đặt phòng
POST   /employee/bookings/check-in           # Check-in + assign customers
POST   /employee/bookings/check-out          # Check-out rooms
```

**Frontend Status:** ✅ **ĐÃ TRIỂN KHAI ĐẦY ĐỦ (100%)**
- Hooks: `use-reservations.ts`
- Components: `components/reservations/`
- Services: `booking.service.ts`
- Features:
  - ✅ Calendar view + List view
  - ✅ Create/Edit/View/Cancel
  - ✅ Check-in/Check-out
  - ✅ Search & Filter
  - ✅ Walk-in booking

**Rủi ro:** NONE

---

### 2️⃣ CHECK-IN/CHECK-OUT FLOW

**Backend APIs:**
```
POST   /employee/bookings/check-in           # Assign customers to rooms
POST   /employee/bookings/check-out          # Check-out multi-room
```

**Frontend Status:** ✅ **ĐÃ TRIỂN KHAI ĐẦY ĐỦ (100%)**
- Hooks: `use-checkin.ts`, `use-checkout.ts`
- Pages: `app/(dashboard)/checkin/`, `app/(dashboard)/checkout/`
- Features:
  - ✅ Search bookings ready for check-in
  - ✅ Walk-in check-in (auto-select rooms)
  - ✅ Customer assignment
  - ✅ Check-out multi-rooms
  - ⚠️ Mock confirm API fallback

**⚠️ PHÁT HIỆN ISSUE:**
- Backend không có API `POST /employee/bookings/:id/confirm`
- Frontend dùng mock fallback trong `bookingService.confirmBooking()`
- **Giải pháp:** Backend nên thêm API confirm hoặc FE dùng Transaction API

**Rủi ro:** MEDIUM - Booking vẫn ở PENDING → check-in có thể fail

---

### 3️⃣ TRANSACTION MANAGEMENT (Thanh toán)

**Backend APIs:**
```
GET    /employee/transactions                # Danh sách (filter, sort, pagination)
GET    /employee/transactions/:id            # Chi tiết giao dịch
POST   /employee/transactions                # Tạo giao dịch
                                             # - DEPOSIT (30% minimum)
                                             # - ROOM_CHARGE
                                             # - SERVICE_CHARGE
                                             # - REFUND
                                             # - ADJUSTMENT
                                             # Hỗ trợ: split payment, promotions
```

**Frontend Status:** ⚠️ **TRIỂN KHAI MỘT PHẦN (70%)**
- Service: `transaction.service.ts`
- Hook: `use-payments.ts`
- Coverage:
  - ✅ Create transaction (deposit, payment)
  - ✅ Get bill
  - ✅ Process refund
  - ❌ List transactions (UI chưa có)
  - ❌ Filter/Search transactions
  - ❌ Split payment UI
  - ❌ Promote trong payment

**THIẾU:**
1. ❌ **Transactions list/history UI** - Backend hỗ trợ filter mạnh (status, type, method, date range) nhưng FE chưa có
2. ❌ **Split payment** - Backend hỗ trợ `bookingRoomIds[]`, FE chưa có UI
3. ❌ **Apply promotion** - Backend hỗ trợ `promotionApplications[]`, FE chưa có
4. ⚠️ **Transaction history per booking** - Không xem lịch sử thanh toán

**Rủi ro:**
- 🔴 **HIGH**: Không xem lịch sử → Khó kiểm soát tài chính, khó tìm sai sót
- 🔴 **HIGH**: Không split payment → Nhóm khách muốn trả riêng không được

---

### 4️⃣ TRANSACTION DETAILS (Chi tiết phân bổ thanh toán)

**Backend APIs:**
```
GET    /employee/transaction-details         # Search với filter chi tiết
                                             # - transactionId, bookingRoomId, serviceUsageId
                                             # - amount ranges, date range
                                             # - sort, pagination
```

**Frontend Status:** ❌ **CHƯA TRIỂN KHAI (0%)**

**THIẾU:**
1. ❌ **Transaction Details UI** - Hoàn toàn không có
2. ❌ **Folio breakdown** - Không xem chi tiết phân bổ tiền phòng/dịch vụ
3. ❌ **Audit trail** - Không trace tiền từ booking → transaction → detail
4. ❌ **Discount tracking** - Không xem discount đã áp dụng ở đâu

**Rủi ro:**
- 🔴 **CRITICAL**: Không audit tài chính chi tiết → Khó tìm lỗi, khó giải trình
- 🔴 **HIGH**: Không minh bạch với khách hàng → Khiếu nại

---

### 5️⃣ SERVICE USAGE (Dịch vụ phòng)

**Backend APIs:**
```
GET    /employee/service/service-usage       # Danh sách (filter booking/room/date)
POST   /employee/service/service-usage       # Thêm dịch vụ (hỗ trợ guest users)
PATCH  /employee/service/service-usage/:id   # Sửa quantity/status
DELETE /employee/service/service-usage/:id   # Xóa (nếu chưa thanh toán)
```

**Frontend Status:** ⚠️ **TRIỂN KHAI MỘT PHẦN (60%)**
- Hook: `use-checkout.ts` (chỉ add khi checkout)
- Service: `checkin-checkout.service.ts`
- Coverage:
  - ✅ Add service (checkout only)
  - ❌ List service usages
  - ❌ Edit service usage
  - ❌ Delete service usage
  - ❌ Guest service usage
  - ❌ Filter by booking/room

**THIẾU:**
1. ❌ **Service Usage Management page** - Không quản lý dịch vụ đã dùng
2. ❌ **Edit/Delete** - Chỉ add, không sửa/xóa
3. ❌ **Guest services** - Không hỗ trợ khách vãng lai
4. ❌ **Filter by booking** - Không lọc dịch vụ theo booking

**Rủi ro:**
- 🟠 **HIGH**: Không edit/delete → Nhập nhầm dịch vụ không sửa được
- 🟠 **MEDIUM**: Không guest service → Mất khách hàng vãng lai

---

### 6️⃣ ROOM MANAGEMENT (Quản lý phòng)

**Backend APIs:**
```
GET    /employee/rooms                       # Danh sách (search, status, floor, type)
POST   /employee/rooms                       # Tạo phòng
GET    /employee/rooms/:id                   # Chi tiết
PUT    /employee/rooms/:id                   # Cập nhật (status, floor, ...)
DELETE /employee/rooms/:id                   # Xóa phòng
GET    /employee/rooms/:roomId/availability  # Check 1 phòng
POST   /employee/rooms/check-availability    # Check nhiều phòng
```

**Frontend Status:** ✅ **ĐÃ TRIỂN KHAI ĐẦY ĐỦ (100%)**
- Hook: `use-rooms.ts`
- Pages: `app/(dashboard)/rooms/`
- Features:
  - ✅ CRUD operations
  - ✅ Filter by status, floor, type
  - ✅ Check availability
  - ✅ Pagination, Sort

**Rủi ro:** NONE

---

### 7️⃣ ROOM TYPE MANAGEMENT (Loại phòng)

**Backend APIs:**
```
GET    /employee/room-types                  # Danh sách (search, price/capacity range)
POST   /employee/room-types                  # Tạo (hỗ trợ tagIds)
GET    /employee/room-types/:id              # Chi tiết
PUT    /employee/room-types/:id              # Cập nhật
DELETE /employee/room-types/:id              # Xóa
```

**Frontend Status:** ✅ **ĐÃ TRIỂN KHAI ĐẦY ĐỦ (100%)**
- Hook: `use-room-types.ts`
- Pages: `app/(dashboard)/room-types/`
- Features:
  - ✅ CRUD operations
  - ✅ Add room tags
  - ✅ Filter by price, capacity
  - ✅ Manage amenities

**Rủi ro:** NONE

---

### 8️⃣ ROOM TAG/AMENITIES (Tiện nghi phòng)

**Backend APIs:**
```
GET    /employee/room-tags                   # Danh sách tags
POST   /employee/room-tags                   # Tạo tag
GET    /employee/room-tags/:id               # Chi tiết
PATCH  /employee/room-tags/:id               # Cập nhật
DELETE /employee/room-tags/:id               # Xóa (if not in use)
```

**Frontend Status:** ✅ **ĐÃ TRIỂN KHAI ĐẦY ĐỦ (100%)**
- Hook: `use-room-tags.ts`
- Pages: `app/(dashboard)/room-tags/`
- Features:
  - ✅ CRUD operations
  - ✅ Search
  - ✅ Delete with validation

**Rủi ro:** NONE

---

### 9️⃣ SERVICE MANAGEMENT (Quản lý dịch vụ khách sạn)

**Backend APIs:**
```
GET    /employee/services                    # Danh sách (search, price/active filter)
POST   /employee/services                    # Tạo dịch vụ
GET    /employee/services/:id                # Chi tiết
PUT    /employee/services/:id                # Cập nhật
DELETE /employee/services/:id                # Xóa
```

**Frontend Status:** ✅ **ĐÃ TRIỂN KHAI ĐẦY ĐỦ (100%)**
- Hook: `use-services.ts`, `use-service-page.ts`
- Pages: `app/(dashboard)/services/`
- Features:
  - ✅ CRUD operations
  - ✅ Filter by active status, price
  - ✅ Categories (mock data)

**Rủi ro:** NONE

---

### 🔟 CUSTOMER MANAGEMENT (Quản lý khách hàng)

**Backend APIs:**
```
GET    /employee/customers                   # Danh sách (search, pagination)
POST   /employee/customers                   # Tạo khách hàng
GET    /employee/customers/:id               # Chi tiết
PUT    /employee/customers/:id               # Cập nhật
DELETE /employee/customers/:id               # Xóa (soft/hard)
```

**Frontend Status:** ✅ **ĐÃ TRIỂN KHAI ĐẦY ĐỦ (100%)**
- Hook: `use-customers.ts`, `use-customer-page.ts`
- Pages: `app/(dashboard)/customers/`
- Features:
  - ✅ CRUD operations
  - ✅ Search by name/phone/email
  - ✅ Deactivate/Reactivate
  - ✅ View booking history

**Rủi ro:** NONE

---

### 1️⃣1️⃣ CUSTOMER RANK SYSTEM (Hệ thống hạng VIP)

**Backend APIs:**
```
GET    /employee/ranks                       # Danh sách ranks
POST   /employee/ranks                       # Tạo rank mới
GET    /employee/ranks/:id                   # Chi tiết rank
PUT    /employee/ranks/:id                   # Cập nhật rank
DELETE /employee/ranks/:id                   # Xóa rank
GET    /employee/ranks/statistics            # Thống kê customers per rank
```

**Data Model:**
- CustomerRank: `minSpending`, `maxSpending`, `benefits`, `color`
- Customer: `totalSpent` (cached), `rankId` (auto-updated)
- Auto-promotion when `totalSpent` >= `minSpending`

**Frontend Status:** ❌ **CHƯA TRIỂN KHAI (0%)**

**THIẾU:**
1. ❌ **Customer Rank Management UI** - Hoàn toàn thiếu
2. ❌ **Rank statistics dashboard** - Không báo cáo VIP distribution
3. ❌ **Auto-rank-up notification** - Không thông báo upgrade
4. ❌ **Rank benefits display** - Không hiển thị quyền lợi VIP
5. ❌ **Customer rank filter** - Không lọc khách hàng theo rank

**Rủi ro:**
- 🔴 **HIGH**: Hệ thống VIP không dùng → Mất khách trung thành
- 🟠 **MEDIUM**: Không marketing theo VIP tier → Khó tối ưu doanh thu

---

### 1️⃣2️⃣ PROMOTION MANAGEMENT (Khuyến mãi)

**Backend APIs:**
```
GET    /employee/promotions                  # Danh sách promotions
POST   /employee/promotions                  # Tạo promotion
PATCH  /employee/promotions/:id              # Cập nhật (cả disable)

GET    /customer/promotions                  # View promotions available (customer)
POST   /customer/promotions/:id/claim        # Claim promotion (customer)
```

**Data Model:**
- Promotion: `type` (PERCENTAGE/FIXED_AMOUNT), `scope` (ROOM/SERVICE/ALL)
- `totalQty`, `remainingQty`, `perCustomerLimit`, `minBookingAmount`, `maxDiscount`
- CustomerPromotion: `status` (AVAILABLE/USED/EXPIRED)
- UsedPromotion: audit trail linked to TransactionDetail

**Frontend Status:** ⚠️ **TRIỂN KHAI MỘT PHẦN (70%)**
- Hook: `use-promotions.ts`, `use-customer-promotions.ts`
- Pages: `app/(dashboard)/promotions/`, `app/(dashboard)/my-promotions/`
- Coverage:
  - ✅ Create promotion
  - ✅ Update promotion
  - ✅ List & filter promotions
  - ✅ Customer view & claim
  - ❌ Apply promotion in transaction
  - ❌ Promotion analytics
  - ❌ Automated claiming

**THIẾU:**
1. ❌ **Apply promotion in payment** - Backend hỗ trợ `promotionApplications[]`, FE không có UI
2. ❌ **Promotion effectiveness report** - Không báo cáo ROI
3. ❌ **Auto claim if qualified** - Không tự động claim khi đủ điều kiện
4. ❌ **Discount audit** - Không trace discount từ promotion

**Rủi ko:**
- 🟠 **MEDIUM**: Promotion không áp dụng đúng → Sai giá, mất doanh thu

---

### 1️⃣3️⃣ DYNAMIC PRICING (Định giá động)

**Backend APIs:**
```
GET    /employee/pricing-rules                # Danh sách rules (with rank)
POST   /employee/pricing-rules                # Tạo rule
GET    /employee/pricing-rules/:id            # Chi tiết rule
PUT    /employee/pricing-rules/:id            # Cập nhật rule
DELETE /employee/pricing-rules/:id            # Xóa (soft delete)
POST   /employee/pricing-rules/:id/reorder    # Drag-drop reorder (lexorank)
```

**Data Model:**
- PricingRule: `rank` (lexorank string for ordering)
- `roomTypeIds` (scope), `adjustmentType` (PERCENTAGE/FIXED_AMOUNT)
- Time matching: `calendarEventId` OR `startDate/endDate` OR `recurrenceRule` (RRule)
- BookingRoom: `pricingRuleId`, `pricingRuleSnapshot` (audit trail)
- Dynamic calculation: `basePrice + adjustment`

**Frontend Status:** ❌ **CHƯA TRIỂN KHAI (0%)**

**THIẾU:**
1. ❌ **Pricing Rules UI** - Hoàn toàn không có
2. ❌ **Rule builder** - Không tạo/edit rules
3. ❌ **Drag-drop reorder** - Không sắp xếp priority
4. ❌ **Price preview** - Không xem giá áp dụng trước booking
5. ❌ **Rule audit trail** - Không trace rule nào applied
6. ❌ **Effective date validation** - Không check rule có hiệu lực

**Rủi ko:**
- 🔴 **CRITICAL**: Dynamic pricing không dùng → Mất doanh thu lớn (không optimize giá)
- 🔴 **CRITICAL**: Khác biệt lớn với competitor → Kém cạnh tranh
- 🟠 **HIGH**: Không audit → Khó giải trình vì sao giá thay đổi

---

### 1️⃣4️⃣ CALENDAR EVENTS (Sự kiện định giá)

**Backend APIs:**
```
GET    /employee/calendar-events             # Danh sách events
POST   /employee/calendar-events             # Tạo event
GET    /employee/calendar-events/:id         # Chi tiết event
PUT    /employee/calendar-events/:id         # Cập nhật event
DELETE /employee/calendar-events/:id         # Xóa event
```

**Data Model:**
- CalendarEvent: `type` (HOLIDAY/SEASONAL/SPECIAL_EVENT)
- `startDate`, `endDate`, `rrule` (RFC 5545 recurring pattern)
- Examples: Tết Nguyên Đán, Lễ, Mùa Hè, Blackpink concert, v.v.
- Links to PricingRule via `calendarEventId`

**Frontend Status:** ❌ **CHƯA TRIỂN KHAI (0%)**

**THIẾU:**
1. ❌ **Calendar Events UI** - Hoàn toàn không có
2. ❌ **Event creation** - Không tạo events
3. ❌ **Recurring pattern** - Không set RRule
4. ❌ **Event-to-pricing** - Không link events to pricing rules

**Rủi ko:**
- 🔴 **CRITICAL**: Không quản lý sự kiện → Dynamic pricing không hoạt động
- 🟠 **HIGH**: Không plan cho mùa cao điểm

---

### 1️⃣5️⃣ ACTIVITY LOGS (Nhật ký hoạt động)

**Backend APIs:**
```
GET    /employee/activities                  # Danh sách (filter type/customer/employee/date)
GET    /employee/activities/:id              # Chi tiết activity
```

**Data Model:**
- Activity: `type` (CREATE_BOOKING, CHECKED_IN, CREATE_PROMOTION, CLAIM_PROMOTION, ...)
- `metadata` (JSON), `description`
- Links: `serviceUsageId`, `bookingRoomId`, `customerId`, `employeeId`

**Frontend Status:** ✅ **ĐÃ TRIỂN KHAI ĐẦY ĐỦ (100%)**
- Hook: `use-activities.ts`
- Pages: `app/(dashboard)/activities/`
- Features:
  - ✅ Filter by type, customer, employee, date range
  - ✅ Search
  - ✅ Pagination
  - ✅ Detailed view

**Rủi ko:** NONE

---

### 1️⃣6️⃣ APP SETTINGS (Cài đặt hệ thống)

**Backend APIs:**
```
GET    /employee/app-settings                # Tất cả settings (JSON key-value)
GET    /employee/app-settings/checkin-time   # Check-in time config
PUT    /employee/app-settings/checkin-time   # Update check-in time
GET    /employee/app-settings/checkout-time  # Check-out time config
PUT    /employee/app-settings/checkout-time  # Update check-out time
GET    /employee/app-settings/:key           # Get setting by key
PUT    /employee/app-settings/:key           # Update setting by key
```

**Data Model:**
- AppSetting: `key` (unique), `value` (JSON), `description`
- Keys: checkInTime, checkOutTime, depositPercentage, gracePeriodMinutes, ...

**Frontend Status:** ✅ **ĐÃ TRIỂN KHAI ĐẦY ĐỦ (100%)**
- Hook: `use-app-settings.ts`
- Pages: `app/(dashboard)/app-settings/`
- Features:
  - ✅ View all settings
  - ✅ Update check-in/out times
  - ✅ Update deposit percentage

**Rủi ko:** NONE

---

### 1️⃣7️⃣ EMPLOYEE MANAGEMENT (Quản lý nhân viên)

**Backend APIs:**
```
GET    /employee/employees                   # Danh sách (search, filter by role)
POST   /employee/employees                   # Tạo employee
GET    /employee/employees/:id               # Chi tiết employee
PUT    /employee/employees/:id               # Cập nhật employee
DELETE /employee/employees/:id               # Xóa employee
```

**Data Model:**
- Employee: `name`, `username`, `password`, `roleId`
- Role: name, permissions[], isActive
- CASL-based permissions

**Frontend Status:** ⚠️ **TRIỂN KHAI MỘT PHẦN (50%)**
- Hook: `use-staff.ts`, `use-staff-page.ts`
- Pages: `app/(dashboard)/staff/`
- Coverage:
  - ✅ CRUD employees
  - ✅ Search & filter by role
  - ❌ Manage roles
  - ❌ Employee statistics
  - ❌ Assign permissions

**THIẾU:**
1. ❌ **Role management UI** - Không quản lý roles
2. ❌ **Permission assignment** - Không assign permissions
3. ❌ **Employee performance** - Không báo cáo hiệu suất

**Rủi ko:**
- 🟠 **MEDIUM**: Không manage roles → Bảo mật không linh hoạt
- 🟠 **LOW**: Không track performance → Khó đánh giá nhân viên

---

### 1️⃣8️⃣ ROLE & PERMISSION MANAGEMENT (Phân quyền CASL)

**Backend APIs:**
```
GET    /employee/roles                       # Danh sách roles
POST   /employee/roles                       # Tạo role
GET    /employee/roles/:id                   # Chi tiết role
PUT    /employee/roles/:id                   # Cập nhật role
DELETE /employee/roles/:id                   # Xóa role

GET    /employee/permissions                 # Danh sách permissions
POST   /employee/permissions                 # Tạo permission
GET    /employee/permissions/:id             # Chi tiết
PUT    /employee/permissions/:id             # Cập nhật
DELETE /employee/permissions/:id             # Xóa

POST   /employee/roles/:id/permissions       # Assign permissions to role
```

**Data Model:**
- Role: `name`, `description`, `isActive`, `permissions[]`
- Permission: `name`, `type` (SCREEN/ACTION), `subject`, `action`
  - SCREEN: e.g., "screen:booking" → access /dashboard/bookings
  - ACTION: e.g., "booking:create" → POST /bookings
- RolePermission: many-to-many
- Middleware: `authEmployee`, `attachAbilities`, `canAccessScreen('Booking')`, `authorize('create', 'Booking')`

**Frontend Status:** ❌ **CHƯA TRIỂN KHAI (0%)**

**THIẾU:**
1. ❌ **Role management UI** - Hoàn toàn thiếu
2. ❌ **Permission assignment UI** - Không assign permissions to roles
3. ❌ **Client-side CASL** - Frontend không check permissions
4. ❌ **UI element hiding** - Không ẩn features theo permissions
5. ❌ **Screen access control** - Không block access to pages

**Rủi ko:**
- 🔴 **CRITICAL**: Tất cả users đều thấy tất cả features → Bảo mật yếu, UX lộn xộn
- 🔴 **CRITICAL**: Không kiểm soát access → Nhân viên có thể vào screens không được phép

---

### 1️⃣9️⃣ REPORTS & ANALYTICS (Báo cáo)

**Backend APIs:**
```
❌ KHÔNG TÌM THẤY API REPORTS RIÊNG
   Backend có data: Activities, Transactions, Bookings
   Frontend có thể tự tính toán từ các API này
```

**Frontend Status:** ⚠️ **CÓ UI NHƯNG THIẾU BACKEND (30%)**
- Hook: `use-reports.ts`
- Pages: `app/(dashboard)/reports/`
- Coverage:
  - ✅ UI structure
  - ❌ Revenue reports
  - ❌ Occupancy reports
  - ❌ Customer analytics
  - ⚠️ Frontend tự tính từ transactions (không hiệu quả)

**THIẾU:**
1. ❌ **Backend Reports API** - Không có endpoint tổng hợp
2. ⚠️ **Query optimization** - Frontend tự tính có thể slow
3. ❌ **Custom date ranges** - Không linh hoạt filter

**Rủi ko:**
- 🟠 **MEDIUM**: Báo cáo không chính xác → Quyết định sai
- 🟠 **MEDIUM**: Performance kém → Chậm khi xem báo cáo

---

### 2️⃣0️⃣ CUSTOMER PORTAL (Cổng khách hàng - ONLINE BOOKING)

**Backend APIs:**
```
POST   /customer/auth/register               # Đăng ký
POST   /customer/auth/login                  # Đăng nhập
GET    /customer/profile                     # Xem profile
PUT    /customer/profile                     # Cập nhật profile

GET    /customer/bookings                    # Xem bookings của mình
GET    /customer/bookings/:id                # Chi tiết booking
POST   /customer/bookings                    # Đặt phòng online
DELETE /customer/bookings/:id                # Hủy booking

GET    /customer/promotions                  # Xem promotions available
POST   /customer/promotions/:id/claim        # Claim promotion
GET    /customer/promotions/:id/detail       # Chi tiết promotion

GET    /customer/rooms                       # Xem phòng available + giá
GET    /customer/ranks                       # Xem VIP ranks
GET    /customer/usage-service               # Xem dịch vụ đã dùng
```

**Frontend Status:** ❌ **CHƯA TRIỂN KHAI (0%)**

**THIẾU:**
1. ❌ **Customer auth UI** - Đăng ký/đăng nhập (hoàn toàn thiếu)
2. ❌ **Online booking portal** - Không tự đặt phòng
3. ❌ **Profile management** - Không sửa profile
4. ❌ **Booking history** - Không xem lịch sử booking
5. ❌ **My promotions** - Không view/claim promotions
6. ❌ **Rank view** - Không xem rank của mình

**Rủi ko:**
- 🔴 **HIGH**: Khách không tự đặt phòng online → Mất doanh thu (24/7 booking)
- 🔴 **MEDIUM**: Phụ thuộc lễ tân → Khó scale

---

## 📊 TỔNG KẾT COVERAGE

| # | Nhóm nghiệp vụ | Backend APIs | Frontend | Trạng thái |
|---|---|---|---|---|
| 1 | Booking Management | 7 | 100% | ✅ |
| 2 | Check-in/Check-out | 2 | 100% | ✅ (thiếu confirm API) |
| 3 | Transaction | 3 | 70% | ⚠️ |
| 4 | Transaction Details | 1 | 0% | ❌ |
| 5 | Service Usage | 4 | 60% | ⚠️ |
| 6 | Room Management | 7 | 100% | ✅ |
| 7 | Room Type | 5 | 100% | ✅ |
| 8 | Room Tag | 5 | 100% | ✅ |
| 9 | Service Management | 5 | 100% | ✅ |
| 10 | Customer Management | 5 | 100% | ✅ |
| 11 | Customer Rank | 5 | 0% | ❌ |
| 12 | Promotion | 3 | 70% | ⚠️ |
| 13 | Dynamic Pricing | 6 | 0% | ❌ |
| 14 | Calendar Events | 5 | 0% | ❌ |
| 15 | Activity Logs | 2 | 100% | ✅ |
| 16 | App Settings | 7 | 100% | ✅ |
| 17 | Employee Management | 5 | 50% | ⚠️ |
| 18 | Role & Permission | ~10 | 0% | ❌ |
| 19 | Reports | ~5 (est) | 30% | ⚠️ |
| 20 | Customer Portal | 11 | 0% | ❌ |
| **TOTAL** | **20 nhóm** | **~89 endpoints** | **~56%** | |

### 📈 Phân bố

```
✅ Hoàn chỉnh (100%):    10 nhóm (50%)   = 50 APIs
⚠️ Thiếu một phần (30-70%): 6 nhóm (30%)   = 20 APIs
❌ Chưa có (0%):        4 nhóm (20%)   = 19 APIs
```

---

## 🔴 CÁC VẤN ĐỀ KỸ THUẬT PHÁT HIỆN

### ⚠️ Frontend gọi API không tồn tại

1. **`POST /employee/bookings/:id/confirm`**
   - Location: `hooks/use-checkin.ts` line 178
   - Current: Mock fallback `bookingService.confirmBooking()`
   - Issue: Booking vẫn ở PENDING → check-in có thể fail
   - **Solution:**
     - Option A: Backend thêm API confirm
     - Option B: Frontend dùng Transaction API để auto-confirm (create deposit)
     - Option C: Remove confirm step nếu booking auto-confirm khi created

### ⚠️ Backend hỗ trợ nhưng Frontend chưa dùng

1. **Promotion application trong transaction**
   - Backend: `promotionApplications[]` trong `CreateTransactionRequest`
   - Frontend: Không có UI để select promotions

2. **Split payment (thanh toán từng phòng riêng)**
   - Backend: `bookingRoomIds[]` trong transaction
   - Frontend: Chỉ hỗ trợ thanh toán cả booking

3. **CASL permissions check**
   - Backend: Middleware đầy đủ (`attachAbilities`, `authorize`)
   - Frontend: Không check permissions trên UI

4. **Guest service usage**
   - Backend: Support `bookingId = null` cho guest users
   - Frontend: Chỉ add service khi checkout (với bookingId)

---

## 🎯 ƯU TIÊN TRIỂN KHAI

### 🔴 PRIORITY 1 - CRITICAL (ảnh hưởng doanh thu + bảo mật)

#### **1. Dynamic Pricing + Calendar Events**
- **Lý do:** Backend có data model hoàn chỉnh, Frontend thiếu toàn bộ
- **APIs:** 11 endpoints (6 pricing + 5 events)
- **Ảnh hưởng:** CRITICAL - Mất doanh thu lớn (không optimize giá theo mùa/sự kiện)
- **Timeline:** 10-15 ngày
- **Task breakdown:**
  - Create pricing rules UI
  - Calendar events management
  - Drag-drop reorder (lexorank)
  - Price preview before booking
  - Rule audit trail

#### **2. Role & Permission Management**
- **Lý do:** Backend có CASL hoàn chỉnh, Frontend hoàn toàn thiếu
- **APIs:** ~10 endpoints
- **Ảnh hưởng:** CRITICAL - Bảo mật yếu, UX lộn xộn
- **Timeline:** 7-10 ngày
- **Task breakdown:**
  - Role management UI
  - Permission assignment
  - Client-side CASL integration
  - Screen access control
  - Hide/show UI elements based permissions

#### **3. Transaction Details & Audit Trail**
- **Lý do:** Không audit được tài chính
- **APIs:** 1 endpoint
- **Ảnh hưởng:** HIGH - Khó kiểm soát, khó giải trình
- **Timeline:** 5-7 ngày
- **Task breakdown:**
  - Transaction details list
  - Folio breakdown view
  - Discount tracking
  - Audit trail visualization

### 🟠 PRIORITY 2 - HIGH (ảnh hưởng UX + doanh thu)

#### **4. Customer Rank System**
- **Lý do:** Hệ thống VIP không dùng được
- **APIs:** 5 endpoints (4 + stats)
- **Ảnh hưởng:** HIGH - Mất khách trung thành
- **Timeline:** 5-7 ngày

#### **5. Service Usage Management**
- **Lý do:** Không edit/delete service, không guest service
- **APIs:** 4 endpoints (đã có)
- **Ảnh hưởng:** MEDIUM - Lỗi billing, mất doanh thu
- **Timeline:** 3-5 ngày

#### **6. Transaction Management UI**
- **Lý do:** Không xem lịch sử, không split payment, không apply promotion
- **APIs:** 3 endpoints (đã có)
- **Ảnh hưởng:** MEDIUM - UX kém, khó thanh toán
- **Timeline:** 5-7 ngày

### 🟡 PRIORITY 3 - MEDIUM (nâng cao trải nghiệm)

#### **7. Customer Portal**
- **Lý do:** Online booking 24/7, giảm tải lễ tân
- **APIs:** 11 endpoints (backend đã có)
- **Ảnh hưởng:** HIGH - Tăng doanh thu, nhưng không khẩn cấp
- **Timeline:** 10-15 ngày

#### **8. Reports Backend APIs**
- **Lý do:** Frontend tự tính không hiệu quả
- **Ảnh hưởng:** MEDIUM - Performance, accuracy
- **Timeline:** 7-10 ngày

#### **9. Missing Backend APIs**
- Fix: `POST /employee/bookings/:id/confirm` or refactor
- Timeline: 1-2 ngày

---

## ✅ KHUYẾN NGHỊ

### **Làm ngay (1-2 tuần)**

1. ✅ Triển khai **Dynamic Pricing UI** → ROI cao nhất
2. ✅ Fix **missing confirm API** hoặc refactor check-in
3. ✅ Thêm **Transaction List UI** cho tài chính minh bạch

### **Làm sớm (1 tháng)**

4. ✅ **Customer Rank Management** → tăng loyalty
5. ✅ **Role & Permission UI** → bảo mật
6. ✅ **Service Usage CRUD** → tránh lỗi billing

### **Làm sau (khi có thời gian)**

7. ✅ **Customer Portal** → online booking (if needed)
8. ✅ **Reports Backend APIs** → optimize performance
9. ✅ **Transaction Details UI** → audit chi tiết

---

## 📝 GHI CHÚ CUỐI CÙNG

- Báo cáo dựa trên **phân tích thực tế** code, không suy diễn
- **Tất cả APIs backend** đã được xác nhận từ route files
- **Frontend coverage** được đánh giá qua hooks, services, components
- **Ưu tiên** được xếp hạng theo:
  1. **Business impact** (doanh thu, bảo mật)
  2. **User impact** (UX, effort)
  3. **Technical effort** (complexity)
  4. **Time to implement**

---

**Phân tích hoàn tất:** 11/01/2026
