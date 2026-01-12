# Triển khai Phụ Thu & Phạt (Surcharge & Penalty) - BE → FE

**Date**: January 12, 2026  
**Status**: ✅ Implementation Complete

---

## 1. Backend Analysis (roommaster-be)

### 1.1 Data Models

**ServiceUsage** (model chính để lưu penalty/surcharge):
```prisma
model ServiceUsage {
  id            String  @id
  bookingId     String?     // Optional - booking level
  bookingRoomId String?     // Optional - room level
  employeeId    String
  serviceId     String      // ID của service "Phạt" hoặc "Phụ thu"
  
  quantity      Int         // Số lượng (default: 1)
  unitPrice     Decimal     // Giá gốc của service
  customPrice   Decimal?    // GIÁ TÙY CHỈNH (dùng cho penalty/surcharge)
  totalPrice    Decimal     // = customPrice × quantity (hoặc unitPrice × quantity)
  totalPaid     Decimal     // Số tiền đã thanh toán
  
  note          String?     // LÝ DO penalty/surcharge
  status        ServiceUsageStatus // PENDING/TRANSFERRED/COMPLETED
  
  // Relations
  booking       Booking?
  bookingRoom   BookingRoom?
  service       Service
  employee      Employee
}
```

**Service** (bảng services - có 2 service đặc biệt):
```prisma
model Service {
  id       String
  name     String   // "Phạt" hoặc "Phụ thu" hoặc tên service thường
  price    Decimal  // Giá mặc định (không dùng cho penalty/surcharge)
  unit     String
  isActive Boolean
}
```

**AppSetting** (lưu ID của penalty/surcharge service):
```prisma
model AppSetting {
  id    String @id
  key   String @unique
  value Json   // { serviceId: "xxx" }
}
```

### 1.2 Backend Business Logic

**Phạt (Penalty)**:
- Service riêng với name = "Phạt" (seeded trong database)
- ID được lưu trong `AppSetting` với key `PENALTY_SERVICE_ID`
- **Không** có danh mục penalty items cố định
- User nhập **tự do**: customPrice + reason
- API: `POST /employee/service/penalty`

**Phụ thu (Surcharge)**:
- Service riêng với name = "Phụ thu" (seeded trong database)
- ID được lưu trong `AppSetting` với key `SURCHARGE_SERVICE_ID`
- **Không** có danh mục surcharge items cố định
- User nhập **tự do**: customPrice + reason
- API: `POST /employee/service/surcharge`

**Service thường (Regular Service)**:
- Dịch vụ bình thường: massage, giặt ủi, minibar...
- Có giá cố định (`unitPrice = service.price`)
- API: `POST /employee/service/service-usage`

### 1.3 Backend API Endpoints

#### 1.3.1 Create Penalty
```typescript
POST /employee/service/penalty
Authorization: Bearer <token>

Request Body:
{
  bookingId?: string;       // Optional - booking level penalty
  bookingRoomId?: string;   // Optional - room level penalty
  customPrice: number;      // REQUIRED - giá tùy chỉnh
  quantity: number;         // Default: 1
  reason: string;           // REQUIRED - lý do (min: 3, max: 500 chars)
}

Response (201):
{
  id: string;
  bookingId?: string;
  bookingRoomId?: string;
  serviceId: string;        // ID của service "Phạt"
  quantity: number;
  unitPrice: Decimal;       // Giá gốc service (không dùng)
  customPrice: Decimal;     // Giá tùy chỉnh
  totalPrice: Decimal;      // = customPrice × quantity
  totalPaid: Decimal;       // = 0
  note: string;             // = reason
  status: "PENDING";
  employeeId: string;
  createdAt: string;
  updatedAt: string;
}
```

#### 1.3.2 Create Surcharge
```typescript
POST /employee/service/surcharge
Authorization: Bearer <token>

Request Body:
{
  bookingId?: string;
  bookingRoomId?: string;
  customPrice: number;      // REQUIRED
  quantity: number;         // Default: 1
  reason: string;           // REQUIRED (min: 3, max: 500)
}

Response (201):
// Giống penalty response nhưng serviceId là của "Phụ thu"
```

#### 1.3.3 Get Service Usages (including penalty/surcharge)
```typescript
GET /employee/service/service-usage?bookingId={id}&bookingRoomId={id}
Authorization: Bearer <token>

Response:
{
  data: ServiceUsage[];
  // Filter client-side by serviceId để lấy penalty/surcharge
}
```

#### 1.3.4 Update Service Usage
```typescript
PATCH /employee/service/service-usage/:id
Authorization: Bearer <token>

Request Body:
{
  quantity?: number;
  status?: ServiceUsageStatus; // PENDING | TRANSFERRED | COMPLETED
}
```

#### 1.3.5 Delete Service Usage
```typescript
DELETE /employee/service/service-usage/:id
Authorization: Bearer <token>
```

### 1.4 Backend Validation Rules

**Penalty/Surcharge Creation**:
- `customPrice`: required, must be number > 0
- `quantity`: default = 1
- `reason`: required, min 3 chars, max 500 chars
- `bookingId` OR `bookingRoomId`: optional nhưng ít nhất 1 phải có (booking/room level)

**Service Usage Status Flow**:
```
PENDING → TRANSFERRED → COMPLETED
```

**Financial Tracking**:
- `totalPrice` = `customPrice` × `quantity`
- `balance` = `totalPrice` - `totalPaid` (calculated field, not stored)
- Không tự động charge, phải payment riêng

---

## 2. Frontend Current State (hotel-management-system-fe)

### 2.1 Existing Components

✅ **Modal Components**:
- `components/checkin-checkout/add-penalty-modal.tsx`
- `components/checkin-checkout/add-surcharge-modal.tsx`
- Used trong checkout flow

✅ **API Service Layer**:
- `lib/services/service-unified.service.ts`
- ❌ **ĐANG CALL SAI ENDPOINT**:
  - Current: `POST /employee/service/service-usage` (dùng serviceId của "Phạt"/"Phụ thu")
  - Expected: `POST /employee/service/penalty` và `/employee/service/surcharge`

✅ **Type Definitions**:
- `lib/types/service-unified.ts`
- Có `CreatePenaltySurchargeRequest` interface

❌ **OLD Penalty Types (không dùng)**:
- `lib/types/penalty.ts` - Định nghĩa cũ với `PenaltyItem` (penaltyID, penaltyName...)
- `components/penalties/` - Components cũ cho penalty items

### 2.2 Vấn đề cần sửa

**1. API Endpoint sai** ❌:
```typescript
// ❌ Current (SAI)
penaltyAPI.applyPenalty() → POST /employee/service/service-usage

// ✅ Expected (ĐÚNG)
penaltyAPI.applyPenalty() → POST /employee/service/penalty
```

**2. Request payload không khớp** ❌:
```typescript
// ❌ Current
{
  serviceId: penaltyServiceId,  // Backend KHÔNG cần field này
  bookingRoomId,
  quantity,
  customPrice,
  note: reason,
  employeeId                    // Backend tự lấy từ req.employee.id
}

// ✅ Expected
{
  bookingRoomId,
  customPrice,
  quantity,
  reason                        // Backend expect "reason", không phải "note"
}
```

---

## 3. Implementation Plan

### 3.1 Sửa API Service

**File**: `lib/services/service-unified.service.ts`

**Changes**:
1. `penaltyAPI.applyPenalty()` → Call `POST /employee/service/penalty`
2. `surchargeAPI.applySurcharge()` → Call `POST /employee/service/surcharge`
3. Remove `serviceId` và `employeeId` từ payload (Backend tự xử lý)
4. Rename `note` → `reason` trong payload

### 3.2 Update Modal Integration

**AddPenaltyModal** và **AddSurchargeModal** đã đúng:
- Input: description, amount, notes
- Output: `AddPenaltyFormData` với `description`, `amount`, `notes`

**Hook integration** (e.g., `use-checkout.ts`):
```typescript
const handleAddPenalty = async (data: AddPenaltyFormData) => {
  await penaltyAPI.applyPenalty({
    bookingRoomId: selectedBookingRoomId,
    customPrice: data.amount,
    quantity: 1,
    reason: data.description + (data.notes ? `\n${data.notes}` : '')
  });
};
```

### 3.3 No Changes Needed

✅ **Modal Components**: Đã đúng, không cần sửa
✅ **Type Definitions**: Interface `CreatePenaltySurchargeRequest` đã đúng
✅ **UI Flow**: Checkout page đã integrate modal đúng

---

## 4. Business Rules Summary

### 4.1 Khi nào dùng Penalty/Surcharge?

**Penalty (Phạt)**:
- Hư hỏng tài sản phòng
- Mất đồ dùng khách sạn
- Vi phạm quy định (hút thuốc, mang thú cưng...)
- Checkout trễ quá grace period

**Surcharge (Phụ thu)**:
- Phụ thu giờ cao điểm
- Phụ thu ngày lễ/Tết
- Phụ thu early check-in
- Phụ thu extra guest

### 4.2 Không có danh mục cố định

Backend **KHÔNG** có bảng penalty items/surcharge items riêng.
- Không có PEN001, PEN002... như trong FE cũ
- User nhập **tự do**: reason + customPrice
- Lưu vào `ServiceUsage` với `serviceId` của "Phạt"/"Phụ thu"

### 4.3 Service ID Management

Backend quản lý service ID qua `AppSetting`:
- Key: `PENALTY_SERVICE_ID`
- Value: `{ serviceId: "xxx" }`
- Frontend **KHÔNG CẦN** lưu service ID
- Frontend call API `/employee/service/penalty` → Backend tự get service ID

---

## 5. API Integration Verification

### 5.1 Penalty Flow

```typescript
// 1. User mở AddPenaltyModal
<AddPenaltyModal 
  open={showPenaltyModal}
  onConfirm={handleAddPenalty}
/>

// 2. User nhập thông tin:
// - description: "Làm vỡ bình hoa"
// - amount: 500000
// - notes: "Bình hoa trang trí phòng 101"

// 3. Call API
await penaltyAPI.applyPenalty({
  bookingRoomId: "br_123",
  customPrice: 500000,
  quantity: 1,
  reason: "Làm vỡ bình hoa\nBình hoa trang trí phòng 101"
});

// 4. Backend tạo ServiceUsage:
// - serviceId: (lấy từ AppSetting PENALTY_SERVICE_ID)
// - customPrice: 500000
// - totalPrice: 500000 × 1 = 500000
// - note: "Làm vỡ bình hoa\nBình hoa trang trí phòng 101"
// - status: PENDING

// 5. Frontend refresh service usages
await serviceUsageAPI.getServiceUsages({ bookingRoomId: "br_123" });
```

### 5.2 Surcharge Flow

```typescript
// Similar to penalty, nhưng call surchargeAPI.applySurcharge()
```

---

## 6. Testing Checklist

### 6.1 Backend Verification (KHÔNG SỬA)

- [x] `POST /employee/service/penalty` exists
- [x] `POST /employee/service/surcharge` exists
- [x] `AppSetting` có `PENALTY_SERVICE_ID` và `SURCHARGE_SERVICE_ID`
- [x] Database có service "Phạt" và "Phụ thu"

### 6.2 Frontend Implementation

- [x] Fix `penaltyAPI.applyPenalty()` → Call `/employee/service/penalty`
- [x] Fix `surchargeAPI.applySurcharge()` → Call `/employee/service/surcharge`
- [x] Remove `serviceId` và `employeeId` từ payload
- [x] Rename `note` → `reason` trong payload
- [x] Verify modal integration
- [x] Build test

### 6.3 Runtime Testing (Next Steps)

- [ ] Test add penalty trong checkout flow
- [ ] Test add surcharge trong checkout flow
- [ ] Verify penalty/surcharge hiển thị trong folio
- [ ] Verify total amount calculation
- [ ] Test update penalty/surcharge status
- [ ] Test delete penalty/surcharge

---

## 7. Backend vs Frontend Compatibility

### 7.1 ✅ Compatible

- ✅ Backend API `/employee/service/penalty` và `/employee/service/surcharge`
- ✅ Frontend có modal để input penalty/surcharge
- ✅ Request/response structure khớp sau khi sửa
- ✅ ServiceUsage model match giữa BE-FE

### 7.2 ❌ Incompatible (FIXED)

- ❌ ~~Endpoint sai (dùng `/service-usage` thay vì `/penalty`)~~ → ✅ FIXED
- ❌ ~~Payload có `serviceId` và `employeeId` thừa~~ → ✅ FIXED
- ❌ ~~Field `note` vs `reason`~~ → ✅ FIXED

---

## 8. No Backend Changes Required

**Backend roommaster-be**: ✅ TUYỆT ĐỐI KHÔNG SỬA

- ✅ API đã hoàn chỉnh
- ✅ Business logic đúng
- ✅ Validation đầy đủ
- ✅ Database model phù hợp

**Frontend**: Chỉ cần sửa API calls để match Backend

---

## 9. Documentation References

- Backend Service: `roommaster-be/src/services/usage-service.service.ts`
- Backend Controller: `roommaster-be/src/controllers/employee/employee.usage-service.controller.ts`
- Backend Routes: `roommaster-be/src/routes/v1/employee/usage-service.route.ts`
- Backend AppSetting: `roommaster-be/src/services/app-setting.service.ts`
- Prisma Schema: `roommaster-be/prisma/schema.prisma` (ServiceUsage model)

- Frontend API Service: `hotel-management-system-fe/lib/services/service-unified.service.ts`
- Frontend Modal: `hotel-management-system-fe/components/checkin-checkout/add-penalty-modal.tsx`
- Frontend Types: `hotel-management-system-fe/lib/types/service-unified.ts`

---

## 10. Summary

**Phụ thu & Phạt** trong hệ thống:
- **Không phải** danh mục cố định (PEN001, PEN002...)
- **Là** ServiceUsage với customPrice
- Backend có 2 API chuyên dụng: `/penalty` và `/surcharge`
- Frontend chỉ cần gọi đúng API endpoint

**Implementation**: ✅ COMPLETE
- Đã sửa `penaltyAPI` và `surchargeAPI` để call đúng endpoint
- Payload match 100% với Backend expectation
- Modal components không cần thay đổi
- Ready for runtime testing

---

**End of Document**
