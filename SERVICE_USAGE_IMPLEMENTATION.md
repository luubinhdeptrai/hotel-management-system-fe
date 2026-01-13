# 🛎️ Service Usage - Backend to Frontend Implementation

## 📋 MỤC LỤC
1. [Tổng quan Backend Service Usage](#1-tổng-quan-backend-service-usage)
2. [Nghiệp vụ Service Usage từ Backend](#2-nghiệp-vụ-service-usage-từ-backend)
3. [API Endpoints](#3-api-endpoints)
4. [Data Model & Business Rules](#4-data-model--business-rules)
5. [Frontend Implementation](#5-frontend-implementation)
6. [Components & State Management](#6-components--state-management)
7. [API Integration Flow](#7-api-integration-flow)

---

## 1. TỔNG QUAN BACKEND SERVICE USAGE

### 🎯 Service Usage là gì?
**Service Usage** là nghiệp vụ ghi nhận việc sử dụng dịch vụ khách sạn (ăn uống, giặt là, spa...) cho:
- **Booking** (đặt phòng)
- **Booking Room** (phòng cụ thể trong booking)
- **Guest** (khách lẻ không booking)

### 📌 3 SCENARIOS Service Usage

Backend định nghĩa 3 kịch bản sử dụng:

```typescript
/**
 * Service Usage Scenarios:
 * 1. Booking-level service: bookingId provided, bookingRoomId not provided
 *    → Dịch vụ cho TOÀN BỘ booking (VD: buffet cho nhóm)
 * 
 * 2. Room-specific service: both bookingId and bookingRoomId provided
 *    → Dịch vụ cho PHÒNG CỤ THỂ (VD: minibar phòng 101)
 * 
 * 3. Guest service: neither bookingId nor bookingRoomId provided
 *    → Dịch vụ cho KHÁCH LẺ không booking (VD: khách đến spa nhưng không thuê phòng)
 */
```

---

## 2. NGHIỆP VỤ SERVICE USAGE TỪ BACKEND

### 2.1 THỜI ĐIỂM GHI NHẬN

Service Usage có thể được ghi nhận:

1. **Trước Check-in**: Booking đã tạo nhưng chưa check-in
2. **Trong lúc Check-in**: Khi khách vào phòng
3. **Trong thời gian Stay**: Khách đang ở, gọi dịch vụ
4. **Trước Check-out**: Xác nhận dịch vụ cuối cùng
5. **Walk-in Guest**: Khách không thuê phòng, chỉ dùng dịch vụ

### 2.2 CÁCH TÍNH TIỀN

Backend tự động tính toán:

```typescript
// Backend tự tính: totalPrice = unitPrice × quantity
const unitPrice = service.price; // Lấy từ Service
const totalPrice = unitPrice.mul(quantity);

// Tạo ServiceUsage với:
{
  unitPrice: service.price,      // Giá gốc
  quantity: 2,                    // Số lượng
  totalPrice: unitPrice * 2,     // Tổng tiền (do BE tính)
  totalPaid: 0,                   // Đã thanh toán (ban đầu = 0)
  customPrice: null,              // Giá custom (chỉ dùng cho penalty/surcharge)
  status: 'PENDING'               // Trạng thái ban đầu
}
```

### 2.3 TRẠNG THÁI SERVICE USAGE

Backend định nghĩa 4 trạng thái:

```typescript
enum ServiceUsageStatus {
  PENDING      // Đã tạo, chưa cung cấp dịch vụ
  TRANSFERRED  // Đã cung cấp dịch vụ cho khách
  COMPLETED    // Đã thanh toán xong
  CANCELLED    // Đã hủy
}
```

### 2.4 QUY TẮC CHUYỂN TRẠNG THÁI

Backend validation status transitions:

```typescript
Valid transitions:
- PENDING → TRANSFERRED (cung cấp dịch vụ)
- PENDING → CANCELLED (hủy trước khi cung cấp)
- TRANSFERRED → COMPLETED (thanh toán xong)
- TRANSFERRED → CANCELLED (hủy sau khi cung cấp)
- Any → CANCELLED (có thể hủy bất cứ lúc nào)

Invalid:
❌ COMPLETED → anything (không thể thay đổi khi đã hoàn thành)
❌ CANCELLED → anything (không thể thay đổi khi đã hủy)
```

### 2.5 ĐIỀU KIỆN SỬA/HỦY

Backend rules:

```typescript
// ❌ KHÔNG THỂ SỬA quantity nếu:
- status === 'TRANSFERRED' (đã cung cấp)
- status === 'COMPLETED' (đã thanh toán)

// ❌ KHÔNG THỂ XÓA nếu:
- totalPaid > 0 (đã thanh toán một phần)
- transactionDetails.length > 0 (đã có transaction liên quan)
- status === 'COMPLETED' (đã hoàn thành)

// ✅ CÓ THỂ HỦY (status → CANCELLED):
- Mọi trạng thái đều có thể hủy
- Khi hủy: totalPrice → 0
```

---

## 3. API ENDPOINTS

### 3.1 GET Service Usages

```http
GET /employee/service/service-usage
Authorization: Bearer {token}

Query Parameters:
- bookingId: string (optional) - Lọc theo booking
- bookingRoomId: string (optional) - Lọc theo phòng
- startDate: ISO date (optional)
- endDate: ISO date (optional)
- page: number (default: 1)
- limit: number (default: 10)
- sortBy: string (default: 'createdAt')
- sortOrder: 'asc' | 'desc' (default: 'desc')

Response:
{
  "data": [
    {
      "id": "service_usage_123",
      "bookingId": "booking_456",
      "bookingRoomId": "booking_room_789",
      "serviceId": "service_abc",
      "quantity": 2,
      "unitPrice": 150000,
      "totalPrice": 300000,
      "totalPaid": 100000,
      "note": "Ghi chú dịch vụ",
      "status": "PENDING",
      "createdAt": "2026-01-13T10:00:00Z",
      "updatedAt": "2026-01-13T10:00:00Z",
      "service": {
        "id": "service_abc",
        "name": "Giặt là",
        "price": 150000,
        "unit": "kg"
      },
      "booking": {
        "bookingCode": "BK001",
        "primaryCustomer": {
          "fullName": "Nguyễn Văn A"
        }
      },
      "bookingRoom": {
        "room": {
          "roomNumber": "101"
        }
      },
      "employee": {
        "name": "Nhân viên A"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 3.2 CREATE Service Usage

```http
POST /employee/service/service-usage
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "bookingId": "booking_456",      // Optional (omit for guest)
  "bookingRoomId": "room_789",     // Optional
  "serviceId": "service_abc",      // Required
  "quantity": 2,                   // Required (min: 1)
  "note": "Ghi chú"                // Optional
}

Scenarios:
1. Booking-level: { bookingId, serviceId, quantity }
2. Room-specific: { bookingId, bookingRoomId, serviceId, quantity }
3. Guest service: { serviceId, quantity } (no bookingId)

Response: 201 Created
{
  "data": {
    "id": "service_usage_123",
    "bookingId": "booking_456",
    "bookingRoomId": "room_789",
    "serviceId": "service_abc",
    "quantity": 2,
    "unitPrice": 150000,
    "totalPrice": 300000,  // BE tự tính = unitPrice × quantity
    "totalPaid": 0,
    "status": "PENDING",
    "createdAt": "2026-01-13T10:00:00Z",
    ...
  }
}
```

### 3.3 UPDATE Service Usage

```http
PATCH /employee/service/service-usage/{id}
Authorization: Bearer {token}
Content-Type: application/json

Request Body (all optional):
{
  "quantity": 3,                              // Update số lượng
  "status": "TRANSFERRED" | "COMPLETED" | "CANCELLED"
}

Rules:
- quantity: Chỉ update được khi status = PENDING
- status: Phải tuân theo valid transitions

Response: 200 OK
{
  "data": {
    "id": "service_usage_123",
    "quantity": 3,
    "totalPrice": 450000,  // BE tự tính lại
    "status": "TRANSFERRED",
    ...
  }
}
```

### 3.4 DELETE Service Usage

```http
DELETE /employee/service/service-usage/{id}
Authorization: Bearer {token}

Rules:
- Chỉ xóa được khi: totalPaid = 0 AND status != COMPLETED

Response: 200 OK
{
  "message": "Service usage deleted successfully"
}
```

---

## 4. DATA MODEL & BUSINESS RULES

### 4.1 ServiceUsage Schema (Prisma)

```prisma
model ServiceUsage {
  id            String   @id @default(cuid())
  bookingId     String?  // Optional - null for guest services
  bookingRoomId String?  // Optional - null for booking-level services
  employeeId    String   // Required - who created this

  serviceId     String
  quantity      Int      @default(1)
  unitPrice     Decimal  @db.Decimal(10, 2)     // Service price
  customPrice   Decimal? @db.Decimal(10, 2)     // Custom price (penalty/surcharge only)
  totalPrice    Decimal  @db.Decimal(10, 2)     // Total cost
  totalPaid     Decimal  @default(0) @db.Decimal(10, 2)  // Amount paid
  
  note          String?  @db.Text               // Note/reason
  status        ServiceUsageStatus @default(PENDING)

  // Relations
  booking       Booking?     @relation(fields: [bookingId], references: [id])
  bookingRoom   BookingRoom? @relation(fields: [bookingRoomId], references: [id])
  service       Service      @relation(fields: [serviceId], references: [id])
  employee      Employee     @relation(fields: [employeeId], references: [id])

  transactionDetails TransactionDetail[]
  activities         Activity[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### 4.2 Business Rules

| Rule | Description |
|------|-------------|
| **Tính tiền** | `totalPrice = unitPrice × quantity` (Backend tự tính) |
| **Balance** | `balance = totalPrice - totalPaid` (calculated field) |
| **Custom Price** | Chỉ dùng cho penalty/surcharge, regular service dùng `service.price` |
| **Payment** | Khi payment: `totalPaid += amount`, nếu `balance <= 0` → `status = COMPLETED` |
| **Activity Log** | Mọi thao tác CREATE/UPDATE/DELETE đều ghi activity log |
| **Validation** | BE validate booking, bookingRoom, service tồn tại |

---

## 5. FRONTEND IMPLEMENTATION

### 5.1 Existing Code Analysis

Frontend đã có:
- ✅ `checkinCheckoutService.addServiceUsage()` - Đã implement
- ✅ `checkinCheckoutService.updateServiceUsage()` - Đã implement
- ✅ `checkinCheckoutService.cancelServiceUsage()` - Đã implement
- ✅ `AddServiceModal` component - Đã có UI tạo service
- ✅ Types: `ServiceUsageRequest`, `ServiceUsageResponse` - Đã định nghĩa

Frontend THIẾU:
- ❌ Component hiển thị LIST service usages
- ❌ Component EDIT service usage (quantity)
- ❌ Integration vào màn hình check-out/folio
- ❌ Service để GET list service usages

### 5.2 Implementation Plan

```
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Services Layer (lib/services/)                             │
│     └─ service-usage.service.ts                                │
│        ├─ getServiceUsages(params)    [NEW]                    │
│        ├─ createServiceUsage(data)    [EXISTS]                 │
│        ├─ updateServiceUsage(id, data) [EXISTS]                │
│        ├─ deleteServiceUsage(id)       [NEW]                   │
│        └─ cancelServiceUsage(id)       [EXISTS]                │
│                                                                 │
│  2. Types Layer (lib/types/)                                   │
│     └─ service-usage.types.ts                                  │
│        ├─ ServiceUsage                [NEW - comprehensive]    │
│        ├─ ServiceUsageFilters         [NEW]                    │
│        ├─ ServiceUsageStatus          [NEW]                    │
│        └─ GetServiceUsagesResponse    [NEW]                    │
│                                                                 │
│  3. Components Layer (components/service-usage/)               │
│     ├─ service-usage-list.tsx         [NEW]                    │
│     ├─ service-usage-table.tsx        [NEW]                    │
│     ├─ service-usage-item.tsx         [NEW]                    │
│     ├─ add-service-usage-modal.tsx    [ENHANCE existing]       │
│     ├─ edit-service-usage-modal.tsx   [NEW]                    │
│     └─ delete-service-usage-dialog.tsx [NEW]                   │
│                                                                 │
│  4. Integration Points                                         │
│     ├─ Check-out Details Screen        [INTEGRATE]            │
│     ├─ Booking Details Screen          [INTEGRATE]            │
│     ├─ Folio/Bill Screen               [INTEGRATE]            │
│     └─ Service Management Screen       [INTEGRATE]            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. COMPONENTS & STATE MANAGEMENT

### 6.1 ServiceUsageList Component

**Purpose**: Hiển thị danh sách service usages với filters

```tsx
<ServiceUsageList
  bookingId="booking_123"          // Optional filter
  bookingRoomId="room_456"         // Optional filter
  onAddService={() => {}}          // Callback khi thêm dịch vụ
  onRefresh={() => {}}             // Callback để refresh list
  readonly={false}                 // true = không cho edit/delete
/>
```

**Features**:
- Hiển thị danh sách service usages
- Filter theo booking/room
- Sort theo date, amount, status
- Actions: Edit quantity, Cancel, Delete
- Real-time status badges
- Total summary

### 6.2 ServiceUsageTable Component

**Purpose**: Table view với full details

```tsx
<ServiceUsageTable
  serviceUsages={serviceUsages}
  onEdit={(usage) => {}}
  onCancel={(usageId) => {}}
  onDelete={(usageId) => {}}
  showActions={true}
/>
```

**Columns**:
- Service Name
- Quantity
- Unit Price
- Total Price
- Total Paid
- Balance
- Status (badge)
- Actions (Edit/Cancel/Delete)

### 6.3 AddServiceUsageModal (Enhanced)

**Purpose**: Thêm service usage mới

```tsx
<AddServiceUsageModal
  open={isOpen}
  onOpenChange={setIsOpen}
  bookingId="booking_123"        // Optional
  bookingRoomId="room_456"       // Optional
  onSuccess={(newUsage) => {
    // Callback sau khi tạo thành công
    // ✅ Refresh service usage list
    // ✅ Update booking/folio summary
  }}
/>
```

**Flow**:
1. User chọn service từ dropdown
2. Nhập quantity
3. Preview: Service name, unit price, total = unitPrice × quantity
4. Click "Thêm dịch vụ" → Call API
5. Backend trả về ServiceUsage với totalPrice đã tính
6. Trigger onSuccess callback → Refresh UI

### 6.4 EditServiceUsageModal

**Purpose**: Sửa quantity hoặc status

```tsx
<EditServiceUsageModal
  open={isOpen}
  onOpenChange={setIsOpen}
  serviceUsage={selectedUsage}
  onSuccess={(updatedUsage) => {
    // Refresh list
  }}
/>
```

**Rules**:
- Chỉ cho edit quantity khi status = PENDING
- Cho phép update status theo valid transitions
- Show warning khi không thể edit

---

## 7. API INTEGRATION FLOW

### 7.1 Flow 1: Thêm Service Usage

```
User Action                  Frontend                    Backend
    │                            │                          │
    ├─ Click "Thêm dịch vụ"     │                          │
    │                            │                          │
    ├─ Select service            │                          │
    ├─ Input quantity = 2        │                          │
    ├─ Preview:                  │                          │
    │   "Giặt là"                │                          │
    │   150,000 × 2 = 300,000    │                          │
    │                            │                          │
    ├─ Click "Xác nhận" ────────▶│                          │
    │                            │                          │
    │                            ├─ POST /service-usage ───▶│
    │                            │  {                       │
    │                            │    bookingId,            │
    │                            │    serviceId,            │
    │                            │    quantity: 2           │
    │                            │  }                       │
    │                            │                          │
    │                            │                          ├─ Validate booking
    │                            │                          ├─ Get service.price
    │                            │                          ├─ Calculate totalPrice
    │                            │                          ├─ Create ServiceUsage
    │                            │                          ├─ Create Activity log
    │                            │                          │
    │                            │◀─── 201 Created ─────────┤
    │                            │  {                       │
    │                            │    id: "usage_123",      │
    │                            │    totalPrice: 300000,   │
    │                            │    status: "PENDING"     │
    │                            │  }                       │
    │                            │                          │
    │◀─ Show success ────────────┤                          │
    │◀─ Refresh service list ────┤                          │
    │◀─ Update folio total ──────┤                          │
```

### 7.2 Flow 2: Update Quantity

```
User Action                  Frontend                    Backend
    │                            │                          │
    ├─ Click "Edit" on usage     │                          │
    ├─ Change quantity: 2 → 3    │                          │
    │                            │                          │
    ├─ Click "Lưu" ─────────────▶│                          │
    │                            │                          │
    │                            ├─ PATCH /service-usage/id ▶│
    │                            │  {                       │
    │                            │    quantity: 3           │
    │                            │  }                       │
    │                            │                          │
    │                            │                          ├─ Validate status = PENDING
    │                            │                          ├─ Calculate new totalPrice
    │                            │                          ├─ Update ServiceUsage
    │                            │                          │
    │                            │◀─── 200 OK ──────────────┤
    │                            │  {                       │
    │                            │    quantity: 3,          │
    │                            │    totalPrice: 450000    │
    │                            │  }                       │
    │                            │                          │
    │◀─ Update table row ────────┤                          │
    │◀─ Refresh folio ───────────┤                          │
```

### 7.3 Flow 3: Cancel Service Usage

```
User Action                  Frontend                    Backend
    │                            │                          │
    ├─ Click "Hủy" on usage      │                          │
    ├─ Confirm dialog            │                          │
    │                            │                          │
    ├─ Click "Xác nhận hủy" ────▶│                          │
    │                            │                          │
    │                            ├─ PATCH /service-usage/id ▶│
    │                            │  {                       │
    │                            │    status: "CANCELLED"   │
    │                            │  }                       │
    │                            │                          │
    │                            │                          ├─ Set totalPrice = 0
    │                            │                          ├─ Set status = CANCELLED
    │                            │                          ├─ Create Activity log
    │                            │                          │
    │                            │◀─── 200 OK ──────────────┤
    │                            │  {                       │
    │                            │    status: "CANCELLED",  │
    │                            │    totalPrice: 0         │
    │                            │  }                       │
    │                            │                          │
    │◀─ Show "Đã hủy" badge ─────┤                          │
    │◀─ Refresh folio ───────────┤                          │
```

---

## 8. CRITICAL RULES - KHÔNG ĐƯỢC PHÉP

### ❌ KHÔNG ĐƯỢC

1. **Frontend tự tính tiền**
   ```typescript
   // ❌ WRONG
   const total = service.price * quantity;
   
   // ✅ CORRECT - Let Backend calculate
   const response = await createServiceUsage({ serviceId, quantity });
   const total = response.totalPrice; // Use BE's calculation
   ```

2. **Frontend tự sinh charge/transaction**
   ```typescript
   // ❌ WRONG - Don't create transactions for service usage
   await createTransaction({ type: 'SERVICE_CHARGE', amount: total });
   
   // ✅ CORRECT - Service usage creates its own transaction when paid
   await createServiceUsage(data); // BE handles transaction internally
   ```

3. **Frontend validate trạng thái**
   ```typescript
   // ❌ WRONG - Frontend validation only for UX
   if (status === 'COMPLETED') {
     alert('Cannot edit completed service');
     return;
   }
   
   // ✅ CORRECT - Always call API, let Backend validate
   try {
     await updateServiceUsage(id, { quantity });
   } catch (error) {
     // Backend will return 400 if status invalid
     showError(error.message);
   }
   ```

### ✅ BẮT BUỘC

1. **Sau mọi thao tác → Refresh**
   ```typescript
   // After create/update/delete service usage:
   await refreshServiceUsageList();
   await refreshFolioSummary();
   await refreshBookingTotalAmount();
   ```

2. **Hiển thị data từ Backend**
   ```typescript
   // Always use Backend's calculated values
   <div>Total: {formatCurrency(serviceUsage.totalPrice)}</div>
   <div>Paid: {formatCurrency(serviceUsage.totalPaid)}</div>
   <div>Balance: {formatCurrency(serviceUsage.totalPrice - serviceUsage.totalPaid)}</div>
   ```

3. **Error Handling**
   ```typescript
   try {
     await deleteServiceUsage(id);
   } catch (error) {
     // Backend returns specific errors:
     // - "Cannot delete paid service usage"
     // - "Cannot delete completed service usage"
     showErrorToast(error.message);
   }
   ```

---

## 9. IMPLEMENTATION CHECKLIST

### Phase 1: Types & Services
- [ ] Create `lib/types/service-usage.types.ts`
- [ ] Create `lib/services/service-usage.service.ts`
- [ ] Export trong `lib/services/index.ts`

### Phase 2: Components
- [ ] Create `components/service-usage/service-usage-list.tsx`
- [ ] Create `components/service-usage/service-usage-table.tsx`
- [ ] Create `components/service-usage/edit-service-usage-modal.tsx`
- [ ] Create `components/service-usage/delete-service-usage-dialog.tsx`
- [ ] Enhance existing `add-service-modal.tsx`

### Phase 3: Integration
- [ ] Integrate vào Check-out Details
- [ ] Integrate vào Booking Details
- [ ] Integrate vào Folio/Bill view
- [ ] Test all scenarios (booking-level, room-specific, guest)

### Phase 4: Testing
- [ ] Test create service usage (3 scenarios)
- [ ] Test update quantity (when PENDING)
- [ ] Test cancel service usage
- [ ] Test delete service usage (validation)
- [ ] Test status transitions
- [ ] Test error handling

---

## 10. CODE EXAMPLES

### Example: Service Usage Service

```typescript
// lib/services/service-usage.service.ts
import { api } from "./api";
import type { ApiResponse } from "@/lib/types/api";
import type {
  ServiceUsage,
  CreateServiceUsageRequest,
  UpdateServiceUsageRequest,
  GetServiceUsagesParams,
  GetServiceUsagesResponse
} from "@/lib/types/service-usage.types";

export const serviceUsageService = {
  /**
   * Get service usages with filters
   */
  async getServiceUsages(
    params?: GetServiceUsagesParams
  ): Promise<GetServiceUsagesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.bookingId) queryParams.append("bookingId", params.bookingId);
    if (params?.bookingRoomId) queryParams.append("bookingRoomId", params.bookingRoomId);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response = await api.get<ApiResponse<GetServiceUsagesResponse>>(
      `/employee/service/service-usage?${queryParams.toString()}`,
      { requiresAuth: true }
    );

    return response.data;
  },

  /**
   * Create service usage
   */
  async createServiceUsage(
    data: CreateServiceUsageRequest
  ): Promise<ServiceUsage> {
    const response = await api.post<ApiResponse<ServiceUsage>>(
      "/employee/service/service-usage",
      data,
      { requiresAuth: true }
    );
    return response.data;
  },

  /**
   * Update service usage
   */
  async updateServiceUsage(
    id: string,
    data: UpdateServiceUsageRequest
  ): Promise<ServiceUsage> {
    const response = await api.patch<ApiResponse<ServiceUsage>>(
      `/employee/service/service-usage/${id}`,
      data,
      { requiresAuth: true }
    );
    return response.data;
  },

  /**
   * Delete service usage
   */
  async deleteServiceUsage(id: string): Promise<void> {
    await api.delete(`/employee/service/service-usage/${id}`, {
      requiresAuth: true,
    });
  },

  /**
   * Cancel service usage (shorthand for update status)
   */
  async cancelServiceUsage(id: string): Promise<ServiceUsage> {
    return this.updateServiceUsage(id, { status: "CANCELLED" });
  },
};
```

---

## 📝 SUMMARY

### Backend Service Usage Logic:
1. ✅ **3 Scenarios**: Booking-level, Room-specific, Guest service
2. ✅ **Auto-calculate**: `totalPrice = unitPrice × quantity`
3. ✅ **4 Status**: PENDING → TRANSFERRED → COMPLETED / CANCELLED
4. ✅ **Payment tracking**: `totalPaid`, auto `COMPLETED` when fully paid
5. ✅ **Activity logging**: Mọi thao tác đều có audit trail

### Frontend Implementation:
1. ✅ **Service layer**: GET/CREATE/UPDATE/DELETE service usages
2. ✅ **Components**: List, Table, Add, Edit, Delete modals
3. ✅ **Integration**: Check-out, Booking details, Folio screens
4. ✅ **Rules**: Never tự tính tiền, always refresh after actions
5. ✅ **Error handling**: Show Backend errors, validate UX only

### Key Principles:
- **Backend is source of truth** - Tuyệt đối tuân theo BE logic
- **No frontend calculation** - BE tính tiền, FE chỉ hiển thị
- **Always refresh** - Sau mọi action refresh data từ BE
- **Follow status rules** - Validate transitions, respect state machine
- **Activity logging** - BE tự động log, FE không cần quan tâm

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-13  
**Author**: GitHub Copilot  
**Status**: ✅ Ready for Implementation
