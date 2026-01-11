# Service/Penalty/Surcharge Refactoring Summary

## Completion Status: ✅ DONE

**Date**: 2024-01-15  
**Build Status**: ✅ PASSED  
**Files Created**: 5 files  
**Files Modified**: 1 file

---

## 1. Tại sao Refactor?

### Problem

Frontend cũ sử dụng **3 types riêng biệt** (PenaltyItem, SurchargeItem, ServiceItem) với mock data, KHÔNG khớp với Backend architecture.

### Backend Architecture Reality

Backend sử dụng **1 bảng Service duy nhất** chứa:

1. **Regular Services** (CRUD-able): "Giặt ủi", "Bữa sáng", "Spa"
2. **Penalty Service** (READ-ONLY): name = "Phạt" (seeded, ID stored in App Settings)
3. **Surcharge Service** (READ-ONLY): name = "Phụ thu" (seeded, ID stored in App Settings)

**ServiceUsage** tracks all charges with:
- `serviceId`: Points to Service table
- `customPrice`: Custom price for penalty/surcharge (nullable)
- `note`: Reason/description (nullable)

➡️ **Penalties và Surcharges KHÔNG PHẢI services cần CRUD catalog**, chúng là dynamic charges with custom prices!

---

## 2. Files Created

### ✅ `lib/types/service-unified.ts` (280 lines)

**Purpose**: Unified type system matching Backend architecture

**Key Exports**:
```typescript
// Core interfaces
Service                      // Backend service model
ServiceCategory              // 'REGULAR' | 'PENALTY' | 'SURCHARGE'
ServiceUsage                 // Usage tracking with customPrice
ServiceWithCategory          // Service + category field

// Display types
PenaltyDisplay               // ServiceUsage → UI display
SurchargeDisplay             // ServiceUsage → UI display

// Request/Response types
CreateServiceRequest         // For regular services
CreateServiceUsageRequest    // For regular service usage
CreatePenaltySurchargeRequest // For penalties/surcharges

// Helper functions
categorizeService()          // Classify service by name
isRegularService()           // Check if not penalty/surcharge
isPenaltyService()           // Check if name === "Phạt"
isSurchargeService()         // Check if name === "Phụ thu"
toPenaltyDisplay()           // Convert ServiceUsage to display
toSurchargeDisplay()         // Convert ServiceUsage to display
formatCurrency()             // Format VND
formatServiceUsageStatus()   // Format status with color
```

**Key Design Decision**:
- Services "Phạt" and "Phụ thu" categorized by **name** (hard-coded check)
- No categoryID or serviceGroup field (Backend doesn't have it)

---

### ✅ `lib/services/service-unified.service.ts` (430 lines)

**Purpose**: API layer with 4 sub-APIs

**Exports**:

#### 1. `serviceAPI` (Regular Services)
```typescript
getAllServices()         // Get all services (including penalty/surcharge)
getServicesWithCategory() // Get services with category field
getRegularServices()     // Filter to regular services only
getPenaltyService()      // Get service with name "Phạt"
getSurchargeService()    // Get service with name "Phụ thu"
getServiceById(id)       // Get service by ID
createService(data)      // Create regular service
updateService(id, data)  // Update service
deleteService(id)        // Delete service
```

**Validation**: Cannot create services named "Phạt" or "Phụ thu"

#### 2. `serviceUsageAPI` (Service Usage)
```typescript
getServiceUsages(params) // Get usages with filters
createServiceUsage(data) // Book regular service
updateServiceUsage(id, data) // Update usage
deleteServiceUsage(id)   // Delete usage
```

#### 3. `penaltyAPI` (Penalties)
```typescript
getPenaltyServiceId()    // Get ID of "Phạt" service
getPenaltyUsages(filters) // Get penalty usages
applyPenalty(data)       // POST /employee/service/penalty
updatePenalty(id, data)  // Update penalty usage
deletePenalty(id)        // Delete penalty usage
```

**Note**: Uses `POST /employee/service/penalty` endpoint

#### 4. `surchargeAPI` (Surcharges)
```typescript
getSurchargeServiceId()   // Get ID of "Phụ thu" service
getSurchargeUsages(filters) // Get surcharge usages
applySurcharge(data)      // POST /employee/service/surcharge
updateSurcharge(id, data) // Update surcharge usage
deleteSurcharge(id)       // Delete surcharge usage
```

**Note**: Uses `POST /employee/service/surcharge` endpoint

---

### ✅ `hooks/use-penalties.ts` (120 lines)

**Purpose**: Penalties management hook

**Functions**:
```typescript
loadPenalties(filters)    // Load penalty usages
applyPenalty(data)        // Apply penalty with customPrice + note
updatePenalty(id, data)   // Update penalty usage
deletePenalty(id)         // Delete penalty usage
```

**State**:
```typescript
{
  penalties: PenaltyDisplay[],
  loading: boolean,
  loadPenalties,
  applyPenalty,
  updatePenalty,
  deletePenalty
}
```

**Toast Integration**: Shows success/error messages

---

### ✅ `hooks/use-surcharges.ts` (120 lines)

**Purpose**: Surcharges management hook

**Functions**:
```typescript
loadSurcharges(filters)    // Load surcharge usages
applySurcharge(data)       // Apply surcharge with customPrice + note
updateSurcharge(id, data)  // Update surcharge usage
deleteSurcharge(id)        // Delete surcharge usage
```

**State**:
```typescript
{
  surcharges: SurchargeDisplay[],
  loading: boolean,
  loadSurcharges,
  applySurcharge,
  updateSurcharge,
  deleteSurcharge
}
```

---

### ✅ `WHY_NO_CRUD_PENALTIES_SURCHARGES.md` (400+ lines)

**Purpose**: Comprehensive explanation document

**Content**:
1. Why penalties/surcharges don't CRUD
2. Backend architecture deep dive
3. Design philosophy explanation
4. Alternative approaches (not chosen)
5. Frontend implementation strategy
6. Data flow examples
7. API comparison table
8. Summary table

---

## 3. Files Modified

### ✅ `hooks/use-services.ts`

**Changes**:

#### Import Changes
```typescript
// OLD
import { serviceManagementService } from "@/lib/services";
import type { Service as ApiService } from "@/lib/types/api";

// NEW
import { serviceAPI } from "@/lib/services/service-unified.service";
import type { Service } from "@/lib/types/service-unified";
```

#### Function Changes
```typescript
// OLD
const loadServices = async () => {
  const result = await serviceManagementService.getServices({...});
  setServices(result.data.map(...));
};

// NEW
const loadServices = async () => {
  // ⚠️ IMPORTANT: Get REGULAR services only (exclude "Phạt" and "Phụ thu")
  const regularServices = await serviceAPI.getRegularServices();
  setServices(regularServices.map(...));
};
```

**Impact**: Services page now shows **only regular services**, excludes "Phạt" and "Phụ thu"

---

## 4. Architecture Summary

### Services Page (`/services`)

**Purpose**: Manage regular services catalog

**Operations**:
- ✅ CRUD Regular Services
- ❌ KHÔNG hiển thị "Phạt" và "Phụ thu"

**Hook**: `use-services.ts` → `serviceAPI.getRegularServices()`

---

### Penalties Page (`/penalties`)

**Purpose**: Apply penalties to booking rooms

**Operations**:
- ✅ Display Penalty Service (READ-ONLY)
- ✅ CRUD ServiceUsage records
- ❌ KHÔNG CRUD Service "Phạt"

**Hook**: `use-penalties.ts` → `penaltyAPI`

**UI Flow**:
1. Select booking room
2. Enter custom price (50K, 200K, 5M...)
3. Enter reason ("Vỡ cốc", "Mất chìa khóa"...)
4. Click "Apply Penalty" → Creates ServiceUsage with `customPrice` + `note`

---

### Surcharges Page (`/surcharges`)

**Purpose**: Apply surcharges to booking rooms

**Operations**:
- ✅ Display Surcharge Service (READ-ONLY)
- ✅ CRUD ServiceUsage records
- ❌ KHÔNG CRUD Service "Phụ thu"

**Hook**: `use-surcharges.ts` → `surchargeAPI`

**UI Flow**:
1. Select booking room
2. Enter custom price (100K, 500K, 1M...)
3. Enter reason ("Check-in sớm", "Thêm giường"...)
4. Click "Apply Surcharge" → Creates ServiceUsage with `customPrice` + `note`

---

## 5. Data Flow Examples

### Example 1: Apply Penalty

**Request**:
```typescript
POST /employee/service/penalty
{
  bookingRoomId: "br_12345",
  customPrice: 5000000,
  note: "Vỡ TV 55 inch trong phòng 302"
}
```

**Backend creates**:
```typescript
ServiceUsage {
  id: "su_67890",
  serviceId: "penalty_service_id",  // Points to "Phạt"
  bookingRoomId: "br_12345",
  quantity: 1,
  customPrice: 5000000,      // ⚠️ Custom price
  totalPrice: 5000000,
  note: "Vỡ TV 55 inch...",  // ⚠️ Reason
  status: "PENDING"
}
```

**Frontend displays**:
```typescript
PenaltyDisplay {
  id: "su_67890",
  penaltyName: "Vỡ TV 55 inch trong phòng 302",  // From note
  amount: 5000000,                                // From customPrice
  status: "PENDING"
}
```

### Example 2: Apply Surcharge

**Request**:
```typescript
POST /employee/service/surcharge
{
  bookingRoomId: "br_12345",
  customPrice: 500000,
  note: "Check-in sớm 6 giờ"
}
```

**Backend creates**:
```typescript
ServiceUsage {
  id: "su_67891",
  serviceId: "surcharge_service_id",  // Points to "Phụ thu"
  bookingRoomId: "br_12345",
  quantity: 1,
  customPrice: 500000,       // ⚠️ Custom price
  totalPrice: 500000,
  note: "Check-in sớm...",   // ⚠️ Reason
  status: "PENDING"
}
```

**Frontend displays**:
```typescript
SurchargeDisplay {
  id: "su_67891",
  surchargeName: "Check-in sớm 6 giờ",
  amount: 500000,
  status: "PENDING"
}
```

---

## 6. Key Design Decisions

### Decision 1: Name-based Categorization

**Why**: Backend uses hard-coded names "Phạt" and "Phụ thu"

**Implementation**:
```typescript
export function categorizeService(service: Service): ServiceWithCategory {
  let category: ServiceCategory = 'REGULAR';
  if (service.name === 'Phạt') category = 'PENALTY';
  else if (service.name === 'Phụ thu') category = 'SURCHARGE';
  return { ...service, category };
}
```

**Alternative**: Could use App Settings IDs, but name check is simpler

---

### Decision 2: Separate APIs for Penalties/Surcharges

**Why**: Backend has dedicated endpoints

**Implementation**:
- `penaltyAPI.applyPenalty()` → `POST /employee/service/penalty`
- `surchargeAPI.applySurcharge()` → `POST /employee/service/surcharge`

**Alternative**: Could use generic `serviceUsageAPI.createServiceUsage()`, but dedicated APIs match Backend pattern

---

### Decision 3: Custom Price + Note Required

**Why**: Penalties/surcharges are dynamic, no catalog

**Implementation**:
```typescript
export interface CreatePenaltySurchargeRequest {
  bookingRoomId: string;
  customPrice: number;  // ⚠️ Required
  note: string;         // ⚠️ Required (reason)
  quantity?: number;    // Optional (default: 1)
}
```

**Alternative**: Could allow optional note, but reason is important for auditing

---

## 7. API Comparison Table

| Endpoint | Method | Purpose | Custom Price | Note |
|----------|--------|---------|--------------|------|
| `/employee/services` | GET | List all services | - | - |
| `/employee/services` | POST | Create regular service | ❌ Use catalog price | ❌ Optional |
| `/employee/service/service-usage` | POST | Book regular service | ❌ Use catalog price | ❌ Optional |
| `/employee/service/penalty` | POST | Apply penalty | ✅ Required | ✅ Required |
| `/employee/service/surcharge` | POST | Apply surcharge | ✅ Required | ✅ Required |

---

## 8. Migration Path (Future)

### For Existing Pages

If you have existing penalty/surcharge pages, refactor to use new hooks:

#### OLD (Mock Data)
```typescript
// Old penalties page
const [penalties, setPenalties] = useState<PenaltyItem[]>(mockPenalties);

const addPenalty = (data) => {
  const newPenalty = { id: uuid(), ...data };
  setPenalties([...penalties, newPenalty]);
};
```

#### NEW (Real API)
```typescript
// New penalties page
import { usePenalties } from '@/hooks/use-penalties';

const { penalties, loading, applyPenalty } = usePenalties();

useEffect(() => {
  loadPenalties({ bookingId: '...' });
}, []);

const handleApplyPenalty = async () => {
  await applyPenalty({
    bookingRoomId: '...',
    customPrice: 5000000,
    note: 'Vỡ TV 55 inch'
  });
};
```

---

## 9. Testing Checklist

### ✅ Build Tests
- [x] TypeScript compilation passes
- [x] No type errors in service-unified.ts
- [x] No type errors in service-unified.service.ts
- [x] No type errors in use-penalties.ts
- [x] No type errors in use-surcharges.ts
- [x] No type errors in use-services.ts
- [x] Build completes successfully

### ⏳ Runtime Tests (TODO)

#### Services Page
- [ ] Should display only regular services
- [ ] Should NOT display "Phạt" service
- [ ] Should NOT display "Phụ thu" service
- [ ] Create service should work
- [ ] Update service should work
- [ ] Delete service should work

#### Penalties Page
- [ ] Should load penalty usages by bookingId
- [ ] Apply penalty should create ServiceUsage
- [ ] Update penalty should work
- [ ] Delete penalty should work
- [ ] Toast messages should show

#### Surcharges Page
- [ ] Should load surcharge usages by bookingId
- [ ] Apply surcharge should create ServiceUsage
- [ ] Update surcharge should work
- [ ] Delete surcharge should work
- [ ] Toast messages should show

---

## 10. Next Steps

### Immediate
1. ✅ **DONE**: Refactor hooks and API layer
2. ✅ **DONE**: Update use-services.ts to filter regular services
3. ⏳ **TODO**: Refactor penalties page to use `usePenalties` hook
4. ⏳ **TODO**: Refactor surcharges page to use `useSurcharges` hook

### Future Enhancements
1. Add penalty/surcharge templates (optional)
2. Add penalty/surcharge history tracking
3. Add audit trail for penalties/surcharges
4. Add permission checks (who can apply penalties)
5. Add amount limits (max penalty amount)

---

## 11. Troubleshooting

### Issue: "Cannot find module '@/lib/types/service-unified'"

**Solution**: Check TypeScript paths in tsconfig.json:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./"]
    }
  }
}
```

### Issue: "Property 'data' does not exist on type {}"

**Solution**: Add type assertion:
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data = (response as any)?.data?.data || (response as any)?.data || response;
```

### Issue: Services page shows "Phạt" and "Phụ thu"

**Solution**: Use `getRegularServices()` instead of `getAllServices()`:
```typescript
const regularServices = await serviceAPI.getRegularServices();
```

---

## 12. Documentation Links

- **Analysis**: [SERVICE_PENALTY_SURCHARGE_ANALYSIS.md](./SERVICE_PENALTY_SURCHARGE_ANALYSIS.md)
- **Why No CRUD**: [WHY_NO_CRUD_PENALTIES_SURCHARGES.md](./WHY_NO_CRUD_PENALTIES_SURCHARGES.md)
- **Backend Schema**: `roommaster-be/prisma/schema.prisma`
- **Backend Seeds**: `roommaster-be/prisma/seeds/service.seed.ts`
- **Backend Service**: `roommaster-be/src/services/usage-service.service.ts`

---

## 13. Contributors

**Developer**: GitHub Copilot  
**Reviewer**: Frontend Team  
**Date**: 2024-01-15

---

## Summary

✅ **Refactoring Complete**
- 5 files created
- 1 file modified
- Build passes
- Type-safe
- Backend-aligned
- Ready for UI integration

🎯 **Key Achievement**: Frontend now correctly models Backend's single-table architecture with hard-coded penalty/surcharge services.

📝 **Next**: Refactor penalties and surcharges pages to use new hooks.
