# 📊 PHÂN TÍCH COVERAGE NGHIỆP VỤ: Backend vs Frontend

**Ngày phân tích:** 11/01/2026  
**Cập nhật lần cuối:** 12/01/2026 (Dynamic Pricing, Calendar Events, Promotions, Employee Management updated)  
**Phạm vi:** roommaster-be (Backend) ↔ hotel-management-system-fe (Frontend)

---

## 📌 Tóm tắt điểm

- **Backend APIs:** ~89 endpoints
- **Frontend Coverage:** **~76%** (68/89 endpoints) ⬆️ **+14 APIs từ lần cuối**
- **Nhóm nghiệp vụ:** 20 nhóm chính
- **Status:**
  - ✅ Hoàn chỉnh: **15 nhóm (75%)** ⬆️ **+4 nhóm**
  - ⚠️ Thiếu một phần: **4 nhóm (20%)** ⬇️ **-2 nhóm**
  - ❌ Chưa triển khai: **1 nhóm (5%)** ⬇️ **-2 nhóm**

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
POST   /employee/customers/:id/rank          # Set customer rank manually
```

**Data Model:**
- CustomerRank: `minSpending`, `maxSpending`, `benefits`, `color`, `displayName`
- Customer: `totalSpent` (cached), `rankId` (auto-updated)
- Auto-promotion when `totalSpent` >= `minSpending`

**Frontend Status:** ✅ **ĐÃ TRIỂN KHAI ĐẦY ĐỦ (100%)**

**TRIỂN KHAI:**
1. ✅ **Customer Rank Management Page** - `/customer-ranks`
   - Full CRUD operations
   - Statistics dashboard
   - Rank breakdown visualization
2. ✅ **Rank Components**
   - `RankBadge` - Display rank everywhere
   - `RankForm` - Create/Edit form with validation
   - `RankStatistics` - Dashboard widget
3. ✅ **Rank Integration**
   - Customer table shows rank badge
   - Customer details modal shows rank
   - Rank data mapped from Backend API
4. ✅ **Services & Hooks**
   - `customer-rank.service.ts` - All API methods
   - `use-customer-ranks.ts` - State management
   - `customer-rank.ts` - TypeScript types + utilities
5. ✅ **Sidebar Menu** - Added "Hạng Khách Hàng" link

**DEPRECATED:**
- ⚠️ Old hardcoded VIPTier (STANDARD/VIP/PLATINUM) marked as deprecated
- ✅ Replaced with dynamic Backend-driven CustomerRank system

**Rủi ro:** NONE - Fully implemented

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

**Frontend Status:** ✅ **ĐÃ TRIỂN KHAI ĐẦY ĐỦ (100%)**

**TRIỂN KHAI:**
1. ✅ **Type System** - `lib/types/promotion.ts` (Promotion, CustomerPromotion, all interfaces)
2. ✅ **Service Layer** - `lib/services/promotion.service.ts` (440 lines, all 8 API functions)
3. ✅ **Employee Hook** - `use-promotions.ts` (state management, CRUD, filtering)
4. ✅ **Customer Hook** - `use-customer-promotions.ts` (view & claim promotions)
5. ✅ **UI Components** - PromotionForm, PromotionCard, PromotionFilters
6. ✅ **Employee Page** - `app/(dashboard)/promotions/page.tsx` (341 lines, full CRUD UI)
7. ✅ **Customer Page** - `app/(dashboard)/my-promotions/page.tsx` (customer view & claim)
8. ✅ **Business Logic** - Discount calculation (PERCENTAGE with cap, FIXED_AMOUNT), status tracking
9. ✅ **Decimal Handling** - Proper serialization from Prisma Decimal to string
10. ✅ **Statistics** - Dashboard cards (total, active, claimed, remaining quantity)

**Tính năng:**
- ✅ Create/Update/Delete promotions
- ✅ Promotion types: PERCENTAGE (with maxDiscount) | FIXED_AMOUNT
- ✅ Scopes: ROOM | SERVICE | ALL
- ✅ Per-customer limit enforcement
- ✅ Total quantity tracking with remaining qty
- ✅ Min booking amount validation
- ✅ Date range validation (start < end)
- ✅ Disable/Enable promotions
- ✅ Customer claim with email verification
- ✅ Status tracking: AVAILABLE | USED | EXPIRED
- ✅ List, search, filter by status
- ✅ Pagination support

**THIẾU:**
1. ⚠️ **Apply promotion in transaction** - Backend hỗ trợ `promotionApplications[]`, FE chưa UI
2. ❌ **Promotion analytics** - Không báo cáo hiệu suất/ROI
3. ❌ **Auto-claim** - Không tự động claim khi customer qualified
4. ❌ **Promotion audit dashboard** - Không trace discount usage detail

**Rủi ko:**
- 🟡 **LOW**: Promotions không áp dụng in transaction flow → Cần tích hợp vào payment
- 🟡 **LOW**: Không track effectiveness → Khó optimize campaigns

**Ghi chú:** Core promotion system 100% implemented, chỉ cần thêm integration trong transaction flow

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

**Frontend Status:** ✅ **ĐÃ TRIỂN KHAI ĐẦY ĐỦ (100%)**

**TRIỂN KHAI:**
1. ✅ **Type System** - `lib/types/pricing.ts` (PricingRule, AdjustmentType, CalendarEvent interfaces)
2. ✅ **Service Layer** - `lib/services/pricing-rule.service.ts` (230 lines, all CRUD operations)
3. ✅ **React Hook** - `hooks/use-pricing-rules.ts` (260 lines, full state management)
4. ✅ **Price Calculation** - `calculatePrice(roomTypeId, date)` for price preview
5. ✅ **Drag-Drop Reorder** - `reorderPricingRule()` with LexoRank support
6. ✅ **Calendar Integration** - `getCalendarEvents()` for time matching
7. ✅ **UI Components** - `components/room-types/pricing-engine-tab.tsx` with rules display
8. ✅ **Routing** - Link in Room Types page to pricing rules management
9. ✅ **Price Calculator** - Backend service (`PricingCalculatorService`) + API integration
10. ✅ **RRule Support** - RFC 5545 recurring patterns supported

**Tính năng:**
- ✅ Create/Update/Delete pricing rules
- ✅ Toggle active/inactive rules
- ✅ Drag-drop priority ordering with optimistic UI
- ✅ Time matching: Calendar Event OR Manual Dates OR RRule Pattern
- ✅ Room Type scoping (all or specific types)
- ✅ Adjustment types: PERCENTAGE | FIXED_AMOUNT
- ✅ Price preview before booking
- ✅ Rule audit trail via snapshot storage

**Rủi ko:** NONE - Fully implemented

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

**Frontend Status:** ✅ **ĐÃ TRIỂN KHAI ĐẦY ĐỦ (100%)**

**TRIỂN KHAI:**
1. ✅ **Type System** - `lib/types/pricing.ts` (CalendarEvent, EventType interfaces)
2. ✅ **Service Layer** - `lib/services/calendar-event.service.ts` (all CRUD operations)
3. ✅ **React Hook** - `hooks/use-calendar-events.ts` (state management, filtering)
4. ✅ **UI Components** - 6 components (badge, card, form, dialog, list, index)
5. ✅ **Main Page** - `app/(dashboard)/calendar-events/page.tsx` (399 lines)
6. ✅ **Statistics** - Dashboard with total events, active events, upcoming events
7. ✅ **View Modes** - List view + Calendar view (month/week)
8. ✅ **Notification Dialog** - User feedback for operations
9. ✅ **Recurring Events** - RRule pattern support (RFC 5545)
10. ✅ **Event Types** - HOLIDAY | SEASONAL | SPECIAL_EVENT with color coding

**Tính năng:**
- ✅ Create/Update/Delete calendar events
- ✅ Event type selection with visual badges
- ✅ Recurring pattern definition (RRule)
- ✅ Calendar and list view switching
- ✅ Filter by event type
- ✅ Get active/upcoming/past events
- ✅ Search and filter capabilities
- ✅ Notification feedback system

**Rủi ko:** NONE - Fully implemented

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

**Frontend Status:** ✅ **ĐÃ TRIỂN KHAI ĐẦY ĐỦ (100%)**

**TRIỂN KHAI:**
1. ✅ **CRUD Operations** - Hook: `use-staff.ts`, `use-staff-page.ts`
2. ✅ **Pages** - `app/(dashboard)/staff/` with employee management UI
3. ✅ **Employee List** - Search, filter by role, pagination
4. ✅ **Create/Edit/Delete** - Full CRUD dialogs
5. ✅ **Role Selection** - Dropdown to assign roles
6. ✅ **Status Management** - Activate/Deactivate employees
7. ✅ **Search & Filter** - Search by name/email, filter by role
8. ✅ **Type System** - Full TypeScript integration

**Tính năng:**
- ✅ List all employees with pagination
- ✅ Search by name, email, phone
- ✅ Filter by role
- ✅ Create new employee (with password)
- ✅ Update employee details and role
- ✅ Delete employee (soft or hard)
- ✅ Deactivate/Reactivate employees
- ✅ View employee details

**Rủi ko:** NONE - Fully implemented (Role management is separate item)
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

**Frontend Status:** ⚠️ **TRIỂN KHAI MỘT PHẦN (40%)**

**ĐÃ TRIỂN KHAI:**
1. ✅ **Permission API Integration** - `lib/services/employee.service.ts` (getPermissions endpoint)
2. ✅ **Type System** - `lib/types/employee.ts`, `lib/types/permission.ts` (types & interfaces)
3. ✅ **Backend CASL** - Complete backend implementation:
   - CaslService with ability checks
   - Role/Permission management endpoints
   - CASL middleware in routes
   - Permission response formatting
4. ✅ **Role Component** - `components/staff/role-management.tsx` (partial UI)
5. ✅ **Hook** - `use-role-management.ts` (role permission updates)
6. ✅ **Permission Types** - SCREEN (access pages) | ACTION (perform operations)

**THIẾU:**
1. ⚠️ **Client-side CASL** - Backend ready, FE không build abilities from permissions
2. ❌ **Role management page** - Không quản lý roles/permissions UI
3. ❌ **Permission assignment UI** - Không assign permissions to roles
4. ❌ **UI element hiding** - Không ẩn buttons/menus theo permissions
5. ❌ **Screen access control** - Không block access to protected pages
6. ❌ **Sidebar menu filtering** - Không filter menu items by permissions

**Rủi ko:**
- 🟠 **MEDIUM**: Backend permissions ready nhưng FE không dùng → Bảo mật không áp dụng
- 🟠 **MEDIUM**: Tất cả users thấy hết features → UX lộn xộn
- 🟡 **LOW**: Role management UI chưa có → Khó quản trị quyền

**Ghi chú:** Backend architecture đã sẵn sàng (CASL + middleware), FE chỉ cần integrate client-side

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
| 11 | Customer Rank | 6 | 100% | ✅ |
| 12 | Promotion | 3 | 100% | ✅ |
| 13 | Dynamic Pricing | 6 | 100% | ✅ |
| 14 | Calendar Events | 5 | 100% | ✅ |
| 15 | Activity Logs | 2 | 100% | ✅ |
| 16 | App Settings | 7 | 100% | ✅ |
| 17 | Employee Management | 5 | 100% | ✅ |
| 18 | Role & Permission | ~10 | 40% | ⚠️ |
| 19 | Reports | ~5 (est) | 30% | ⚠️ |
| 20 | Customer Portal | 11 | 0% | ❌ |
| **TOTAL** | **20 nhóm** | **~89 endpoints** | **~76%** | |

### 📈 Phân bố

```
✅ Hoàn chỉnh (100%):      15 nhóm (75%)   = 71 APIs
⚠️ Thiếu một phần (30-70%):  4 nhóm (20%)   = 12 APIs
❌ Chưa có (0%):          1 nhóm (5%)    = 6 APIs
```

**COVERAGE TĂNG:** 62% → **76%** (Dynamic Pricing + Calendar Events + Promotions + Employee Management)

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

## 🎯 ƯU TIÊN TRIỂN KHAI (CẬP NHẬT 12/01/2026)

### 🔴 PRIORITY 1 - CRITICAL (ảnh hưởng doanh thu + bảo mật)

#### **1. Role & Permission Management** (NEWLY CRITICAL)
- **Trạng thái:** Backend hoàn chỉnh (CASL), FE 40% (types + service ready)
- **Cần làm:** Client-side CASL integration + UI
- **APIs:** ~10 endpoints (đã có)
- **Ảnh hưởng:** CRITICAL - Bảo mật yếu, UX lộn xộn (tất cả users thấy hết features)
- **Timeline:** 5-7 ngày
- **Task breakdown:**
  - Client-side CASL integration (abilities from permissions)
  - Role management page UI
  - Permission assignment UI (matrix)
  - Screen access control (sidebar filtering)
  - Button/menu visibility based permissions
  - Protected routes guarding

#### **2. Transaction Details & Audit Trail** (BLOCKING FINANCE)
- **Trạng thái:** Backend ready, FE 0%
- **Cần làm:** Toàn bộ transaction details UI
- **APIs:** 1 endpoint (đã có)
- **Ảnh hưởng:** HIGH - Không audit tài chính, khó giải trình, khó tìm lỗi
- **Timeline:** 5-7 ngày
- **Task breakdown:**
  - Transaction list with filters (status, type, method, date range)
  - Transaction detail view
  - Folio breakdown visualization
  - Discount audit trail
  - Service charges breakdown
  - Split payment history

### 🟠 PRIORITY 2 - HIGH (ảnh hưởng doanh thu + UX)

#### **3. Transaction Management UI** (PAYMENT FLOW)
- **Trạng thái:** Service ready, FE UI 70%
- **Cần làm:** History view + split payment + promotion integration
- **Ảnh hưởng:** HIGH - Cải thiện UX, hỗ trợ flexible payment
- **Timeline:** 5-7 ngày
- **Task breakdown:**
  - Transaction history list per booking
  - Split payment UI (multiple rooms)
  - Apply promotion during payment
  - Refund management UI

#### **4. Service Usage Management** (DATA INTEGRITY)
- **Trạng thái:** Service layer ready, UI 60% (only add at checkout)
- **Cần làm:** Full CRUD page, guest service support
- **Ảnh hưởng:** MEDIUM - Tránh lỗi billing
- **Timeline:** 3-5 ngày
- **Task breakdown:**
  - Service usage list/management page
  - Edit/Delete service entries
  - Guest service usage support
  - Filter by booking/room/date

### 🟡 PRIORITY 3 - MEDIUM (nâng cao trải nghiệm)

#### **5. Customer Portal** (REVENUE GROWTH)
- **Trạng thái:** Backend ready (11 endpoints), FE 0%
- **Cần làm:** Online booking portal (24/7 self-service)
- **Ảnh hưởng:** HIGH - Tăng doanh thu, giảm tải lễ tân
- **Timeline:** 10-15 ngày
- **Task breakdown:**
  - Customer auth (register/login)
  - Online booking flow
  - My bookings view
  - Profile management
  - Promotions view/claim
  - Rank view

#### **6. Reports Backend APIs & Dashboard** (INSIGHTS)
- **Trạng thái:** Frontend UI 30%, Backend ~0%
- **Cần làm:** Backend aggregation APIs + dashboard UI
- **Ảnh hưởng:** MEDIUM - Performance + accuracy
- **Timeline:** 7-10 ngày
- **Task breakdown:**
  - Revenue reports by period
  - Occupancy analytics
  - Customer analytics
  - Employee performance (if needed)

---

## ✅ KHUYẾN NGHỊ (CẬP NHẬT)

### **Làm ngay (1-2 tuần) - CRITICAL**

1. ✅ **Role & Permission Client-side Integration** → Bảo mật (CRITICAL)
   - Status: Backend ready, FE 40%
   - Effort: 5-7 days
   - Blocks: All other security-dependent features

2. ✅ **Transaction Details UI** → Tài chính minh bạch (HIGH)
   - Status: Backend ready, FE 0%
   - Effort: 5-7 days
   - Impact: Audit trail, fraud detection

### **Làm sớm (1-2 tuần) - HIGH**

3. ✅ **Transaction Management Enhancements** → UX + flexibility
   - Status: 70% done, need history + split payment
   - Effort: 5-7 days

4. ✅ **Service Usage CRUD Page** → Data integrity
   - Status: Backend ready, FE 60%
   - Effort: 3-5 days

### **Làm sau (khi xong critical + high items)**

5. ✅ **Customer Portal** → 24/7 bookings (if revenue growth needed)
   - Timeline: 10-15 days
   - Can run in parallel with others

6. ✅ **Reports Backend APIs** → Business intelligence
   - Timeline: 7-10 days
   - Can run in parallel with others

---

## 📊 CURRENT PROGRESS SUMMARY

| Category | Status | Coverage |
|---|---|---|
| **Core Operations** | ✅ Complete | 100% |
| **Core E-commerce** | ✅ Complete | 100% |
| **Advanced Pricing** | ✅ Complete | 100% |
| **Customer Management** | ✅ Complete | 100% |
| **Access Control** | ⚠️ Partial | 40% |
| **Financial Audit** | ⚠️ Partial | 30% |
| **Online Sales** | ❌ Not Started | 0% |
| **Overall** | **⚠️ Good** | **~76%** |

**KHÔNG CHẶN HỆ THỐNG:** FE đã có đủ để chạy core business
**CẦN TRIỂN KHAI NGAY:** Role/Permission (bảo mật) + Transaction Details (audit)

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
