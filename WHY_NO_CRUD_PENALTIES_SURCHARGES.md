# Tại sao Phạt và Phụ thu KHÔNG CRUD?

## Câu hỏi của Developer

> "Phụ thu và Phạt không CRUD được à, tại sao?"

## Trả lời ngắn gọn

**Phạt** và **Phụ thu** KHÔNG PHẢI là services cần CRUD. Chúng chỉ là **containers** (placeholder services) để tracking ServiceUsage với custom price.

- ✅ **CRUD**: ServiceUsage records (mỗi lần apply penalty/surcharge)
- ❌ **KHÔNG CRUD**: Services "Phạt" và "Phụ thu" (chỉ đọc)

---

## Backend Architecture Deep Dive

### 1. Database Structure

Backend sử dụng **1 bảng Service duy nhất** chứa:

1. **Regular Services** (Giặt ủi, Bữa sáng, Spa, ...): CRUD được
2. **Penalty Service** (name = "Phạt"): READ-ONLY, seeded
3. **Surcharge Service** (name = "Phụ thu"): READ-ONLY, seeded

```typescript
// roommaster-be/prisma/schema.prisma
model Service {
  id       String  @id @default(cuid())
  name     String  // "Giặt ủi" | "Phạt" | "Phụ thu"
  price    Float   // Default price
  unit     String  // "lần" | "ngày" | "giờ"
  isActive Boolean @default(true)
  
  serviceUsages ServiceUsage[] // Tracking usage
}

model ServiceUsage {
  id            String  @id @default(cuid())
  serviceId     String  // Points to Service table
  bookingRoomId String
  quantity      Int     @default(1)
  
  unitPrice    Float   // Original service price (backup)
  customPrice  Float?  // ⚠️ Custom price (for penalty/surcharge)
  totalPrice   Float   // quantity * (customPrice ?? unitPrice)
  totalPaid    Float   @default(0)
  note         String? // ⚠️ Reason for penalty/surcharge
  status       ServiceUsageStatus
  
  service      Service       @relation(...)
  bookingRoom  BookingRoom   @relation(...)
}
```

### 2. Seed Data (Hard-coded)

Backend seeds 2 special services:

```typescript
// roommaster-be/prisma/seeds/service.seed.ts
const services = [
  // Regular services (CRUD-able)
  { name: "Giặt ủi", price: 50000, unit: "kg" },
  { name: "Bữa sáng", price: 150000, unit: "suất" },
  { name: "Massage", price: 300000, unit: "giờ" },
  
  // ⚠️ Special services (READ-ONLY)
  { name: "Phạt", price: 0, unit: "lần" },       // Placeholder for penalties
  { name: "Phụ thu", price: 0, unit: "lần" }     // Placeholder for surcharges
];
```

### 3. App Settings Store IDs

```typescript
// roommaster-be/prisma/seeds/app-settings.seed.ts
await prisma.appSetting.createMany([
  { key: 'penalty_service_id', value: '<ID_of_Phạt_service>' },
  { key: 'surcharge_service_id', value: '<ID_of_Phụ_thu_service>' }
]);
```

Backend sử dụng App Settings để lưu IDs của 2 services đặc biệt này.

---

## Tại sao dùng thiết kế này?

### Problem: Penalties/Surcharges không có catalog cố định

Khác với services thông thường (Giặt ủi = 50K/kg), mỗi penalty/surcharge có:

1. **Custom Price**: 
   - "Phạt vỡ cốc" = 50,000 VND
   - "Phạt vỡ TV" = 5,000,000 VND
   - "Phạt mất chìa khóa" = 200,000 VND
   
2. **Custom Note/Reason**: 
   - "Vỡ cốc thuỷ tinh tại bàn ăn"
   - "Vỡ TV 55 inch trong phòng 302"

➡️ Không thể tạo sẵn catalog cho tất cả trường hợp!

### Solution: Dynamic Pricing with ServiceUsage

Backend không lưu catalog penalties/surcharges. Thay vào đó:

```typescript
// Backend service: roommaster-be/src/services/usage-service.service.ts
async createPenalty(data: CreatePenaltyDto) {
  const penaltyServiceId = await appSettings.get('penalty_service_id');
  
  return prisma.serviceUsage.create({
    data: {
      serviceId: penaltyServiceId,        // Points to "Phạt" service
      bookingRoomId: data.bookingRoomId,
      quantity: 1,
      customPrice: data.customPrice,      // ⚠️ Custom price per case
      note: data.note,                    // ⚠️ Reason for penalty
      status: 'PENDING'
    }
  });
}
```

### Key Design Principles

1. **No Catalog**: Penalties/Surcharges không có pre-defined items
2. **Flexibility**: Mỗi penalty/surcharge có giá riêng (customPrice)
3. **Unified Billing**: ServiceUsage handles tất cả charges (services + penalties + surcharges)
4. **Simplicity**: 1 table, 1 flow, 1 API pattern

---

## Alternative Approaches (NOT chosen)

### Cách 1: Multi-services with Prefix

Tạo nhiều services với prefix:

```typescript
// ❌ Backend KHÔNG dùng cách này
const penaltyServices = [
  { name: "Phạt - Vỡ đồ", price: 50000 },
  { name: "Phạt - Mất chìa khóa", price: 200000 },
  { name: "Phạt - Hút thuốc", price: 500000 },
  // ... hàng trăm cases?
];
```

**Issues**:
- ❌ Không liệt kê hết được cases
- ❌ Phải CRUD nhiều services
- ❌ Price cố định, không flexible

### Cách 2: JSON Templates in App Settings

Lưu templates trong App Settings:

```typescript
// ❌ Backend KHÔNG dùng cách này
{
  "penalty_templates": [
    { "name": "Vỡ đồ", "defaultPrice": 50000 },
    { "name": "Mất chìa khóa", "defaultPrice": 200000 }
  ]
}
```

**Issues**:
- ❌ Vẫn không flexible (default price)
- ❌ Cần UI riêng để manage templates
- ❌ Phức tạp hơn cần thiết

### Cách 3: Pure Dynamic (✅ Backend's Choice)

```typescript
// ✅ Backend CHỌN cách này
// 1 service "Phạt", CRUD là ServiceUsage với customPrice
{
  serviceId: 'penalty_service_id',
  customPrice: 5000000,  // Any price
  note: 'Vỡ TV 55 inch'  // Any reason
}
```

**Advantages**:
- ✅ Hoàn toàn flexible (any price, any reason)
- ✅ Simple architecture (1 table, 1 flow)
- ✅ Unified billing (all charges in ServiceUsage)

---

## Frontend Implementation Strategy

### Services Page (`/services`)

**Purpose**: Manage regular services catalog

```typescript
// hooks/use-services.ts
const loadServices = async () => {
  // ⚠️ Filter to show ONLY regular services (exclude "Phạt" và "Phụ thu")
  const regularServices = await serviceAPI.getRegularServices();
  setServices(regularServices);
};
```

**Operations**:
- ✅ **CRUD Regular Services**: "Giặt ủi", "Bữa sáng", "Massage"
- ❌ **KHÔNG hiển thị**: "Phạt", "Phụ thu"

---

### Penalties Page (`/penalties`)

**Purpose**: Apply penalties to booking rooms (NOT manage catalog)

```typescript
// hooks/use-penalties.ts
const applyPenalty = async (data: {
  bookingRoomId: string;
  customPrice: number;  // ⚠️ Custom price per case
  note: string;         // ⚠️ Reason for penalty
}) => {
  // Backend: POST /employee/service/penalty
  await penaltyAPI.applyPenalty(data);
};
```

**Operations**:
- ✅ **Display Penalty Service** (READ-ONLY): Show "Phạt" service info
- ✅ **CRUD ServiceUsage**: Apply/Update/Delete penalty records
- ❌ **KHÔNG CRUD Service**: Cannot create/update/delete "Phạt" service

**UI Flow**:
1. Select booking room
2. Enter custom price (50K, 200K, 5M, ...)
3. Enter reason ("Vỡ cốc", "Mất chìa khóa", ...)
4. Click "Apply Penalty" → Creates ServiceUsage record

---

### Surcharges Page (`/surcharges`)

**Purpose**: Apply surcharges to booking rooms (NOT manage catalog)

```typescript
// hooks/use-surcharges.ts
const applySurcharge = async (data: {
  bookingRoomId: string;
  customPrice: number;  // ⚠️ Custom price per case
  note: string;         // ⚠️ Reason for surcharge
}) => {
  // Backend: POST /employee/service/surcharge
  await surchargeAPI.applySurcharge(data);
};
```

**Operations**:
- ✅ **Display Surcharge Service** (READ-ONLY): Show "Phụ thu" service info
- ✅ **CRUD ServiceUsage**: Apply/Update/Delete surcharge records
- ❌ **KHÔNG CRUD Service**: Cannot create/update/delete "Phụ thu" service

**UI Flow**:
1. Select booking room
2. Enter custom price (100K, 500K, 1M, ...)
3. Enter reason ("Check-in sớm", "Thêm giường", "Thú cưng", ...)
4. Click "Apply Surcharge" → Creates ServiceUsage record

---

## Data Flow Examples

### Example 1: Apply Penalty "Vỡ TV"

**Request**:
```typescript
POST /employee/service/penalty
{
  bookingRoomId: "br_12345",
  customPrice: 5000000,
  note: "Vỡ TV 55 inch trong phòng 302"
}
```

**Backend Processing**:
1. Get penalty_service_id from App Settings
2. Create ServiceUsage:
   ```typescript
   {
     id: "su_67890",
     serviceId: "penalty_service_id",  // Points to "Phạt"
     bookingRoomId: "br_12345",
     quantity: 1,
     unitPrice: 0,              // Original price (không dùng)
     customPrice: 5000000,      // ⚠️ Custom price
     totalPrice: 5000000,       // quantity * customPrice
     note: "Vỡ TV 55 inch...",  // ⚠️ Reason
     status: "PENDING"
   }
   ```

**Frontend Display** (PenaltyDisplay):
```typescript
{
  id: "su_67890",
  penaltyName: "Vỡ TV 55 inch trong phòng 302",  // From note
  amount: 5000000,                                // From customPrice
  status: "PENDING",
  appliedAt: "2024-01-15T10:30:00Z"
}
```

### Example 2: Apply Surcharge "Check-in sớm"

**Request**:
```typescript
POST /employee/service/surcharge
{
  bookingRoomId: "br_12345",
  customPrice: 500000,
  note: "Check-in sớm 6 giờ (14:00 → 08:00)"
}
```

**Backend Processing**:
1. Get surcharge_service_id from App Settings
2. Create ServiceUsage:
   ```typescript
   {
     id: "su_67891",
     serviceId: "surcharge_service_id",  // Points to "Phụ thu"
     bookingRoomId: "br_12345",
     quantity: 1,
     unitPrice: 0,
     customPrice: 500000,      // ⚠️ Custom price
     totalPrice: 500000,
     note: "Check-in sớm...",  // ⚠️ Reason
     status: "PENDING"
   }
   ```

**Frontend Display** (SurchargeDisplay):
```typescript
{
  id: "su_67891",
  surchargeName: "Check-in sớm 6 giờ",
  amount: 500000,
  status: "PENDING",
  appliedAt: "2024-01-15T08:00:00Z"
}
```

---

## API Comparison

### Regular Service Usage

```typescript
// Book a regular service (Massage)
POST /employee/service/service-usage
{
  serviceId: "svc_massage",   // ⚠️ Points to existing service in catalog
  bookingRoomId: "br_12345",
  quantity: 2                 // 2 hours
  // ❌ NO customPrice
  // ❌ NO note
}

// Backend calculates price from Service.price
// totalPrice = Service.price * quantity
```

### Penalty/Surcharge Usage

```typescript
// Apply penalty (dynamic)
POST /employee/service/penalty
{
  bookingRoomId: "br_12345",
  customPrice: 5000000,       // ⚠️ Custom price (required)
  note: "Vỡ TV 55 inch"       // ⚠️ Reason (required)
  // ❌ NO serviceId (Backend auto-fills from App Settings)
}

// Backend uses penalty_service_id from App Settings
// totalPrice = customPrice * 1
```

---

## Summary: 3 Màn hình, 3 Vai trò

| Page | Service Type | Service CRUD | ServiceUsage CRUD | Custom Price | Note/Reason |
|------|--------------|--------------|-------------------|--------------|-------------|
| `/services` | Regular | ✅ Create/Update/Delete | ✅ Book/Update/Cancel | ❌ Use catalog price | ❌ Optional |
| `/penalties` | Penalty | ❌ READ-ONLY | ✅ Apply/Update/Delete | ✅ Required | ✅ Required |
| `/surcharges` | Surcharge | ❌ READ-ONLY | ✅ Apply/Update/Delete | ✅ Required | ✅ Required |

---

## Kết luận

**Phạt và Phụ thu KHÔNG CRUD được vì**:

1. ❌ Chúng không phải services cần quản lý catalog
2. ✅ Chúng là placeholder services để tracking dynamic charges
3. ✅ CRUD là ServiceUsage records với customPrice + note
4. ✅ Design này flexible hơn, đơn giản hơn

**Frontend Implementation**:

- **Services Page**: CRUD regular services (exclude "Phạt", "Phụ thu")
- **Penalties Page**: Apply penalties (ServiceUsage with customPrice + note)
- **Surcharges Page**: Apply surcharges (ServiceUsage with customPrice + note)

---

## Files Created

```
✅ lib/types/service-unified.ts        (Unified types)
✅ lib/services/service-unified.service.ts  (API layer)
✅ hooks/use-penalties.ts              (Penalty operations)
✅ hooks/use-surcharges.ts             (Surcharge operations)
✅ hooks/use-services.ts               (Updated: filter regular services)
✅ WHY_NO_CRUD_PENALTIES_SURCHARGES.md (This document)
```

---

**References**:

- Backend Analysis: [SERVICE_PENALTY_SURCHARGE_ANALYSIS.md](./SERVICE_PENALTY_SURCHARGE_ANALYSIS.md)
- Backend Schema: `roommaster-be/prisma/schema.prisma`
- Backend Seeds: `roommaster-be/prisma/seeds/service.seed.ts`
- Backend Service: `roommaster-be/src/services/usage-service.service.ts`
