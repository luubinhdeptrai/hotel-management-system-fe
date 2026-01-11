# 📊 PHÂN TÍCH: Service, Penalty, Surcharge Implementation

**Ngày phân tích:** 12/01/2026  
**Vấn đề:** Backend lưu Dịch vụ/Phạt/Phụ thu chung bảng `Service`, FE cần hiển thị 3 màn hình riêng  
**Team Backend:** "Hard code tên dịch vụ đối với Phụ Thu và Phạt (lúc seed)"

---

## 🎯 TÓM TẮT EXECUTIVE

### Backend Architecture (Source of Truth)

**1 bảng duy nhất:** `Service` table  
**Phân biệt bằng:** Tên service hard-coded (`'Phạt'`, `'Phụ thu'`) + App Settings lưu ID

```typescript
// Backend có 3 loại Service:
1. Service thông thường: "Giặt ủi", "Bữa sáng", "Spa"...
2. Service đặc biệt "Phạt": Dùng cho mọi penalty (với customPrice)
3. Service đặc biệt "Phụ thu": Dùng cho mọi surcharge (với customPrice)
```

**App Settings lưu 2 service IDs:**
- `penalty_service_id` → ID của service có tên "Phạt"
- `surcharge_service_id` → ID của service có tên "Phụ thu"

### Frontend Current Status

**3 màn hình riêng biệt (đã có):**
- ✅ `/services` - Dịch vụ thông thường
- ✅ `/penalties` - Phí phạt (MOCK DATA)
- ✅ `/surcharges` - Phụ thu (MOCK DATA)

**Vấn đề:** FE đang dùng mock data, chưa integrate với Backend đúng cách

---

## 🏗️ BACKEND ARCHITECTURE ANALYSIS

### 1. Database Schema

```prisma
// File: roommaster-be/prisma/schema.prisma

model Service {
  id       String  @id @default(cuid())
  name     String  // ⚠️ Key field: "Phạt", "Phụ thu", hoặc tên service thông thường
  price    Decimal @db.Decimal(10, 2)  // Giá mặc định (cho thông thường)
  unit     String  @default("lần")
  isActive Boolean @default(true)
  imageUrl String?

  serviceUsages ServiceUsage[]  // Relation to usage records

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ServiceUsage {
  id            String  @id @default(cuid())
  bookingId     String?
  bookingRoomId String?
  employeeId    String

  serviceId   String  // → Points to Service table
  quantity    Int
  unitPrice   Decimal  // Original service price
  customPrice Decimal? // ⚠️ CRITICAL: Custom price for Penalty/Surcharge
  totalPrice  Decimal  // = (customPrice ?? unitPrice) * quantity
  totalPaid   Decimal  @default(0)
  note        String?  // ⚠️ CRITICAL: Reason for Penalty/Surcharge
  status      ServiceUsageStatus

  // Relations
  service      Service       @relation(fields: [serviceId], references: [id])
  booking      Booking?      @relation(fields: [bookingId], references: [id])
  bookingRoom  BookingRoom?  @relation(fields: [bookingRoomId], references: [id])
  employee     Employee      @relation(fields: [employeeId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Key Points:**
1. **Không có bảng riêng** cho Penalty/Surcharge
2. **Phân biệt qua `customPrice`**: Nếu có `customPrice` → là Penalty/Surcharge
3. **`note` field**: Lưu lý do (reason) cho Penalty/Surcharge
4. **`serviceId`**: Trỏ về service "Phạt" hoặc "Phụ thu" (hard-coded)

---

### 2. Seed Data (Hard-coded Services)

```typescript
// File: roommaster-be/prisma/seeds/service.seed.ts

const services = [
  // ... Services thông thường (Giặt ủi, Bữa sáng, Spa...)
  
  {
    name: 'Phạt',        // ⚠️ HARD-CODED NAME
    price: 20000,        // Default price (không dùng)
    unit: 'kiện/ngày',
    isActive: true
  },
  {
    name: 'Phụ thu',     // ⚠️ HARD-CODED NAME
    price: 20000,        // Default price (không dùng)
    unit: 'lần',
    isActive: true
  }
];
```

```typescript
// File: roommaster-be/prisma/seeds/app-settings.seed.ts

// Tìm service "Phạt" và "Phụ thu"
const penaltyService = await prisma.service.findFirst({
  where: { name: 'Phạt' }  // ⚠️ Tìm theo tên hard-coded
});

const surchargeService = await prisma.service.findFirst({
  where: { name: 'Phụ thu' }  // ⚠️ Tìm theo tên hard-coded
});

// Lưu ID vào App Settings
const settings = [
  {
    key: 'penalty_service_id',
    value: { serviceId: penaltyService.id },
    description: 'Penalty service ID for custom penalty charges'
  },
  {
    key: 'surcharge_service_id',
    value: { serviceId: surchargeService.id },
    description: 'Surcharge service ID for custom surcharge fees'
  }
];
```

**Backend Strategy:**
1. Seed 2 services đặc biệt: tên "Phạt" và "Phụ thu"
2. Lưu ID của 2 services này vào `AppSetting`
3. Khi tạo Penalty/Surcharge → dùng ID này + `customPrice` + `note`

---

### 3. Backend Service Logic

```typescript
// File: roommaster-be/src/services/usage-service.service.ts

export interface CreatePenaltySurchargePayload {
  bookingId?: string;
  bookingRoomId?: string;
  customPrice: number;    // ⚠️ Required: Giá tùy chỉnh
  quantity: number;
  reason: string;         // ⚠️ Required: Lý do (lưu vào note)
  employeeId: string;
}

class UsageServiceService {
  /**
   * Create a penalty service usage with custom price
   * Penalty uses the hardcoded penalty service ID from app settings
   */
  async createPenalty(payload: CreatePenaltySurchargePayload) {
    const { bookingId, bookingRoomId, customPrice, quantity, reason, employeeId } = payload;
    
    // 1. Lấy penalty service ID từ App Settings
    const penaltyServiceId = await this.appSettingService.getPenaltyServiceId();
    
    if (!penaltyServiceId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Penalty service not configured');
    }
    
    // 2. Fetch service details
    const service = await this.prisma.service.findUnique({
      where: { id: penaltyServiceId }
    });
    
    // 3. Create ServiceUsage with customPrice
    const serviceUsage = await this.prisma.serviceUsage.create({
      data: {
        bookingId,
        bookingRoomId,
        serviceId: penaltyServiceId,
        quantity,
        unitPrice: service.price,      // Original service price (backup)
        customPrice: new Prisma.Decimal(customPrice), // ⚠️ Actual price used
        totalPrice: new Prisma.Decimal(customPrice).mul(quantity),
        totalPaid: 0,
        note: reason,  // ⚠️ Lưu lý do vào note
        status: ServiceUsageStatus.PENDING,
        employeeId
      }
    });
    
    // 4. Create activity log
    await this.activityService.createActivity({
      type: ActivityType.CREATE_SERVICE_USAGE,
      description: `Penalty applied: ${reason} (${customPrice} × ${quantity})`,
      serviceUsageId: serviceUsage.id
    });
    
    return serviceUsage;
  }
  
  /**
   * Create a surcharge service usage with custom price
   * Surcharge uses the hardcoded surcharge service ID from app settings
   */
  async createSurcharge(payload: CreatePenaltySurchargePayload) {
    // Logic tương tự createPenalty, nhưng dùng surchargeServiceId
    const surchargeServiceId = await this.appSettingService.getSurchargeServiceId();
    // ... (tương tự createPenalty)
  }
}
```

**Backend Constants:**
```typescript
// File: roommaster-be/src/constants/app-settings.constant.ts

export const APP_SETTING_KEYS = {
  CHECKIN_TIME: 'checkin_time',
  CHECKOUT_TIME: 'checkout_time',
  DEPOSIT_PERCENTAGE: 'deposit_percentage',
  PENALTY_SERVICE_ID: 'penalty_service_id',      // ⚠️
  SURCHARGE_SERVICE_ID: 'surcharge_service_id'   // ⚠️
} as const;
```

---

## 📱 FRONTEND CURRENT IMPLEMENTATION

### 1. Frontend Pages (3 màn hình riêng)

```
app/(dashboard)/
├── services/
│   └── page.tsx          ✅ Dịch vụ thông thường
├── penalties/
│   └── page.tsx          ⚠️ Phí phạt (MOCK DATA)
└── surcharges/
    └── page.tsx          ⚠️ Phụ thu (MOCK DATA)
```

### 2. Frontend Types (Hiện tại - INCORRECT)

```typescript
// File: hotel-management-system-fe/lib/types/penalty.ts
export interface PenaltyItem {
  penaltyID: string;
  penaltyName: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  isOpenPrice?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// File: hotel-management-system-fe/lib/types/surcharge.ts
export interface SurchargeItem {
  surchargeID: string;
  surchargeName: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  isOpenPrice?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Vấn đề:** FE định nghĩa types riêng biệt, KHÔNG khớp với Backend (chỉ có Service table)

### 3. Frontend Mock Data

```typescript
// File: hotel-management-system-fe/lib/mock-services.ts

export const mockPenalties: PenaltyItem[] = [
  {
    penaltyID: "PEN001",
    penaltyName: "Làm vỡ thiết bị",
    price: 500000,
    description: "Phí bồi thường thiết bị bị hỏng",
    isActive: true,
    isOpenPrice: true,  // Allow custom price
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // ...
];

export const mockSurcharges: SurchargeItem[] = [
  {
    surchargeID: "SC001",
    surchargeName: "Check-in sớm",
    price: 200000,
    description: "Phụ thu check-in trước 12:00",
    isActive: true,
    isOpenPrice: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // ...
];
```

**Vấn đề:** FE tạo mock data với cấu trúc riêng, không reflect Backend architecture

---

## 🔍 ROOT CAUSE ANALYSIS

### Backend Design Philosophy

**Tại sao Backend không tạo bảng riêng cho Penalty/Surcharge?**

1. **Simplicity**: 1 bảng Service thay vì 3 bảng
2. **Flexibility**: Penalty/Surcharge là "service đặc biệt" với `customPrice`
3. **Unified Billing**: ServiceUsage table xử lý tất cả charges (service + penalty + surcharge)
4. **Less Joins**: Không cần join nhiều bảng khi query billing

**Trade-off:**
- ✅ Pros: Đơn giản, linh hoạt, ít joins
- ❌ Cons: FE khó query riêng Penalty/Surcharge, phụ thuộc naming convention

### Frontend Design Issue

**Tại sao FE tạo 3 màn hình riêng?**

1. **UX Requirements**: User muốn quản lý riêng biệt:
   - Dịch vụ: Giặt ủi, Bữa sáng (catalog với giá fix)
   - Phạt: Vỡ đồ, Mất chìa khóa (custom price mỗi lần)
   - Phụ thu: Check-in sớm, Người thêm (rules-based pricing)

2. **Business Logic**: 3 loại có flows khác nhau:
   - Service: Catalog browsing → Select → Add to booking
   - Penalty: Incident → Assess damage → Apply charge
   - Surcharge: Check condition → Calculate fee → Apply

**Vấn đề hiện tại:**
- FE tạo types riêng (PenaltyItem, SurchargeItem) không match Backend
- FE dùng mock data thay vì query từ Backend
- FE không biết cách filter Service table để tách 3 loại

---

## ✅ RECOMMENDED FRONTEND IMPLEMENTATION

### Strategy 1: **Filter by Service Name** (Recommended)

Frontend query toàn bộ Services, sau đó filter client-side hoặc server-side:

```typescript
// File: hotel-management-system-fe/lib/services/service.service.ts

export const serviceService = {
  /**
   * Get all services
   */
  async getAllServices(): Promise<Service[]> {
    const response = await api.get('/employee/services');
    return response.data;
  },
  
  /**
   * Get regular services (exclude Penalty & Surcharge)
   */
  async getRegularServices(): Promise<Service[]> {
    const allServices = await this.getAllServices();
    return allServices.filter(s => 
      s.name !== 'Phạt' && 
      s.name !== 'Phụ thu' &&
      s.isActive
    );
  },
  
  /**
   * Get penalty service (for getting ID)
   */
  async getPenaltyService(): Promise<Service | null> {
    const allServices = await this.getAllServices();
    return allServices.find(s => s.name === 'Phạt') || null;
  },
  
  /**
   * Get surcharge service (for getting ID)
   */
  async getSurchargeService(): Promise<Service | null> {
    const allServices = await this.getAllServices();
    return allServices.find(s => s.name === 'Phụ thu') || null;
  }
};
```

### Strategy 2: **Use App Settings API**

Query App Settings để lấy `penalty_service_id` và `surcharge_service_id`:

```typescript
// File: hotel-management-system-fe/lib/services/app-setting.service.ts

export const appSettingService = {
  async getPenaltyServiceId(): Promise<string | null> {
    const response = await api.get('/employee/app-settings/penalty_service_id');
    return response.data.value?.serviceId || null;
  },
  
  async getSurchargeServiceId(): Promise<string | null> {
    const response = await api.get('/employee/app-settings/surcharge_service_id');
    return response.data.value?.serviceId || null;
  }
};
```

### Strategy 3: **Unified Type with Discriminator**

Thay vì 3 types riêng biệt, dùng 1 type với discriminator:

```typescript
// File: hotel-management-system-fe/lib/types/service.ts

export interface Service {
  id: string;
  name: string;
  price: number;        // Decimal from Backend
  unit: string;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper functions
export const isRegularService = (service: Service): boolean => {
  return service.name !== 'Phạt' && service.name !== 'Phụ thu';
};

export const isPenaltyService = (service: Service): boolean => {
  return service.name === 'Phạt';
};

export const isSurchargeService = (service: Service): boolean => {
  return service.name === 'Phụ thu';
};

// Service Usage với custom price
export interface ServiceUsage {
  id: string;
  bookingId?: string;
  bookingRoomId?: string;
  serviceId: string;
  quantity: number;
  unitPrice: number;      // Original service price
  customPrice?: number;   // ⚠️ For Penalty/Surcharge
  totalPrice: number;
  totalPaid: number;
  note?: string;          // ⚠️ Reason for Penalty/Surcharge
  status: 'PENDING' | 'TRANSFERRED' | 'COMPLETED' | 'CANCELLED';
  
  // Relations
  service?: Service;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🎨 FRONTEND IMPLEMENTATION PLAN

### Phase 1: Refactor Types & Services

**1.1 Unified Service Type**
```typescript
// Remove separate penalty.ts and surcharge.ts
// Use single service.ts with helper functions

// File: lib/types/service.ts
export type ServiceCategory = 'REGULAR' | 'PENALTY' | 'SURCHARGE';

export interface Service {
  id: string;
  name: string;
  price: number;
  unit: string;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceWithCategory extends Service {
  category: ServiceCategory;
}

export const categorizeService = (service: Service): ServiceWithCategory => {
  let category: ServiceCategory = 'REGULAR';
  if (service.name === 'Phạt') category = 'PENALTY';
  else if (service.name === 'Phụ thu') category = 'SURCHARGE';
  
  return { ...service, category };
};
```

**1.2 Service API Integration**
```typescript
// File: lib/services/service.service.ts

import { Service, ServiceWithCategory, categorizeService } from '@/lib/types/service';

export const serviceService = {
  /**
   * Get all services with category
   */
  async getServicesWithCategory(): Promise<ServiceWithCategory[]> {
    const response = await api.get('/employee/services');
    const services: Service[] = response.data;
    return services.map(categorizeService);
  },
  
  /**
   * Get services by category
   */
  async getServicesByCategory(category: ServiceCategory): Promise<Service[]> {
    const services = await this.getServicesWithCategory();
    return services.filter(s => s.category === category);
  },
  
  /**
   * Get regular services (for /services page)
   */
  async getRegularServices(): Promise<Service[]> {
    return this.getServicesByCategory('REGULAR');
  },
  
  /**
   * Get penalty service ID (for creating penalties)
   */
  async getPenaltyServiceId(): Promise<string> {
    const penalties = await this.getServicesByCategory('PENALTY');
    if (penalties.length === 0) {
      throw new Error('Penalty service not found');
    }
    return penalties[0].id;
  },
  
  /**
   * Get surcharge service ID (for creating surcharges)
   */
  async getSurchargeServiceId(): Promise<string> {
    const surcharges = await this.getServicesByCategory('SURCHARGE');
    if (surcharges.length === 0) {
      throw new Error('Surcharge service not found');
    }
    return surcharges[0].id;
  }
};
```

---

### Phase 2: Refactor Pages

**2.1 Services Page (Regular Services)**
```typescript
// File: app/(dashboard)/services/page.tsx

export default function ServicesPage() {
  const { 
    services,     // Only regular services
    loading,
    createService,
    updateService,
    deleteService
  } = useServices();  // Hook filters by category='REGULAR'
  
  return (
    <div>
      <h1>Quản lý Dịch vụ</h1>
      {/* CRUD for regular services */}
      <ServiceTable 
        services={services}
        onEdit={updateService}
        onDelete={deleteService}
      />
    </div>
  );
}
```

**2.2 Penalties Page (READ-ONLY for "Phạt" service)**
```typescript
// File: app/(dashboard)/penalties/page.tsx

export default function PenaltiesPage() {
  const { 
    penaltyServiceId,  // ID of "Phạt" service from Backend
    penaltyUsages,     // ServiceUsage records where serviceId = penaltyServiceId
    loading,
    applyPenalty,      // Create ServiceUsage with customPrice
    updatePenalty,     // Update ServiceUsage
    deletePenalty      // Delete ServiceUsage
  } = usePenalties();
  
  return (
    <div>
      <h1>Quản lý Phí Phạt</h1>
      <p>Service ID: {penaltyServiceId}</p>
      
      {/* Button to apply new penalty */}
      <Button onClick={handleApplyPenalty}>
        Áp dụng Phí Phạt
      </Button>
      
      {/* History of applied penalties (ServiceUsage records) */}
      <PenaltyUsageTable 
        usages={penaltyUsages}
        onUpdate={updatePenalty}
        onDelete={deletePenalty}
      />
      
      {/* Dialog for applying penalty */}
      <PenaltyDialog
        open={dialogOpen}
        onSubmit={async (data) => {
          await applyPenalty({
            bookingId: data.bookingId,
            bookingRoomId: data.bookingRoomId,
            customPrice: data.amount,  // ⚠️ Custom price
            quantity: 1,
            reason: data.reason,       // ⚠️ Required reason
            employeeId: currentEmployee.id
          });
        }}
      />
    </div>
  );
}
```

**2.3 Surcharges Page (READ-ONLY for "Phụ thu" service)**
```typescript
// File: app/(dashboard)/surcharges/page.tsx

export default function SurchargesPage() {
  const { 
    surchargeServiceId,  // ID of "Phụ thu" service from Backend
    surchargeUsages,     // ServiceUsage records where serviceId = surchargeServiceId
    loading,
    applySurcharge,      // Create ServiceUsage with customPrice
    updateSurcharge,     // Update ServiceUsage
    deleteSurcharge      // Delete ServiceUsage
  } = useSurcharges();
  
  return (
    <div>
      <h1>Quản lý Phụ Thu</h1>
      <p>Service ID: {surchargeServiceId}</p>
      
      {/* Button to apply new surcharge */}
      <Button onClick={handleApplySurcharge}>
        Áp dụng Phụ Thu
      </Button>
      
      {/* History of applied surcharges (ServiceUsage records) */}
      <SurchargeUsageTable 
        usages={surchargeUsages}
        onUpdate={updateSurcharge}
        onDelete={deleteSurcharge}
      />
      
      {/* Dialog for applying surcharge */}
      <SurchargeDialog
        open={dialogOpen}
        onSubmit={async (data) => {
          await applySurcharge({
            bookingId: data.bookingId,
            bookingRoomId: data.bookingRoomId,
            customPrice: data.amount,  // ⚠️ Custom price
            quantity: data.quantity,
            reason: data.reason,       // ⚠️ Required reason
            employeeId: currentEmployee.id
          });
        }}
      />
    </div>
  );
}
```

---

### Phase 3: Hooks Implementation

**3.1 useServices Hook (Regular Services)**
```typescript
// File: hooks/use-services.ts

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getRegularServices();
      setServices(data);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadServices();
  }, []);
  
  const createService = async (data: CreateServiceRequest) => {
    // Create regular service
    const newService = await serviceService.createService(data);
    setServices(prev => [...prev, newService]);
  };
  
  const updateService = async (id: string, data: UpdateServiceRequest) => {
    // Update service
    const updated = await serviceService.updateService(id, data);
    setServices(prev => prev.map(s => s.id === id ? updated : s));
  };
  
  const deleteService = async (id: string) => {
    // Delete service
    await serviceService.deleteService(id);
    setServices(prev => prev.filter(s => s.id !== id));
  };
  
  return {
    services,
    loading,
    createService,
    updateService,
    deleteService,
    refetch: loadServices
  };
}
```

**3.2 usePenalties Hook (Penalty ServiceUsage Management)**
```typescript
// File: hooks/use-penalties.ts

export function usePenalties() {
  const [penaltyServiceId, setPenaltyServiceId] = useState<string | null>(null);
  const [penaltyUsages, setPenaltyUsages] = useState<ServiceUsage[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load penalty service ID from Backend
  const loadPenaltyServiceId = async () => {
    try {
      const id = await serviceService.getPenaltyServiceId();
      setPenaltyServiceId(id);
    } catch (error) {
      console.error('Failed to load penalty service ID:', error);
    }
  };
  
  // Load penalty usages (ServiceUsage records for penalty service)
  const loadPenaltyUsages = async () => {
    if (!penaltyServiceId) return;
    
    try {
      setLoading(true);
      // Query ServiceUsage where serviceId = penaltyServiceId
      const response = await api.get('/employee/service/service-usage', {
        params: { serviceId: penaltyServiceId }
      });
      setPenaltyUsages(response.data);
    } catch (error) {
      console.error('Failed to load penalty usages:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadPenaltyServiceId();
  }, []);
  
  useEffect(() => {
    if (penaltyServiceId) {
      loadPenaltyUsages();
    }
  }, [penaltyServiceId]);
  
  const applyPenalty = async (data: {
    bookingId?: string;
    bookingRoomId?: string;
    customPrice: number;
    quantity: number;
    reason: string;
    employeeId: string;
  }) => {
    // Backend creates ServiceUsage with:
    // - serviceId = penaltyServiceId
    // - customPrice = data.customPrice
    // - note = data.reason
    const response = await api.post('/employee/service/penalty', data);
    setPenaltyUsages(prev => [...prev, response.data]);
  };
  
  const updatePenalty = async (id: string, data: {
    quantity?: number;
    customPrice?: number;
    reason?: string;
  }) => {
    const response = await api.patch(`/employee/service/service-usage/${id}`, data);
    setPenaltyUsages(prev => prev.map(p => p.id === id ? response.data : p));
  };
  
  const deletePenalty = async (id: string) => {
    await api.delete(`/employee/service/service-usage/${id}`);
    setPenaltyUsages(prev => prev.filter(p => p.id !== id));
  };
  
  return {
    penaltyServiceId,
    penaltyUsages,
    loading,
    applyPenalty,
    updatePenalty,
    deletePenalty,
    refetch: loadPenaltyUsages
  };
}
```

**3.3 useSurcharges Hook (Surcharge ServiceUsage Management)**
```typescript
// File: hooks/use-surcharges.ts

export function useSurcharges() {
  const [surchargeServiceId, setSurchargeServiceId] = useState<string | null>(null);
  const [surchargeUsages, setSurchargeUsages] = useState<ServiceUsage[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Similar to usePenalties, but for surcharge
  const loadSurchargeServiceId = async () => {
    try {
      const id = await serviceService.getSurchargeServiceId();
      setSurchargeServiceId(id);
    } catch (error) {
      console.error('Failed to load surcharge service ID:', error);
    }
  };
  
  const loadSurchargeUsages = async () => {
    if (!surchargeServiceId) return;
    
    try {
      setLoading(true);
      const response = await api.get('/employee/service/service-usage', {
        params: { serviceId: surchargeServiceId }
      });
      setSurchargeUsages(response.data);
    } catch (error) {
      console.error('Failed to load surcharge usages:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadSurchargeServiceId();
  }, []);
  
  useEffect(() => {
    if (surchargeServiceId) {
      loadSurchargeUsages();
    }
  }, [surchargeServiceId]);
  
  const applySurcharge = async (data: {
    bookingId?: string;
    bookingRoomId?: string;
    customPrice: number;
    quantity: number;
    reason: string;
    employeeId: string;
  }) => {
    const response = await api.post('/employee/service/surcharge', data);
    setSurchargeUsages(prev => [...prev, response.data]);
  };
  
  const updateSurcharge = async (id: string, data: {
    quantity?: number;
    customPrice?: number;
    reason?: string;
  }) => {
    const response = await api.patch(`/employee/service/service-usage/${id}`, data);
    setSurchargeUsages(prev => prev.map(s => s.id === id ? response.data : s));
  };
  
  const deleteSurcharge = async (id: string) => {
    await api.delete(`/employee/service/service-usage/${id}`);
    setSurchargeUsages(prev => prev.filter(s => s.id !== id));
  };
  
  return {
    surchargeServiceId,
    surchargeUsages,
    loading,
    applySurcharge,
    updateSurcharge,
    deleteSurcharge,
    refetch: loadSurchargeUsages
  };
}
```

---

## 📊 COMPARISON: Current vs Recommended

| Aspect | Current (Mock Data) | Recommended (Backend-aligned) |
|---|---|---|
| **Types** | 3 types riêng: `PenaltyItem`, `SurchargeItem`, `ServiceItem` | 1 type: `Service` + `ServiceUsage` |
| **Data Source** | Mock data in FE | Query from Backend `/employee/services` |
| **Penalty Page** | CRUD penalties như services | READ-ONLY "Phạt" service + CRUD ServiceUsage |
| **Surcharge Page** | CRUD surcharges như services | READ-ONLY "Phụ thu" service + CRUD ServiceUsage |
| **Service Page** | Services gộp chung | Only regular services (filter out Phạt/Phụ thu) |
| **API Calls** | Không có API | `/employee/services`, `/employee/service/penalty`, `/employee/service/surcharge` |
| **Custom Pricing** | Không có | `customPrice` field in ServiceUsage |
| **Reason Tracking** | Không có | `note` field in ServiceUsage |

---

## ⚡ MIGRATION STEPS

### Step 1: Update Types
```bash
# Remove old types
rm lib/types/penalty.ts
rm lib/types/surcharge.ts

# Update service.ts with unified types + helpers
```

### Step 2: Create/Update Service API
```bash
# Add category filtering logic
# Add getPenaltyServiceId() and getSurchargeServiceId()
```

### Step 3: Refactor Hooks
```bash
# Update use-services.ts to filter regular services
# Create use-penalties.ts for penalty management
# Create use-surcharges.ts for surcharge management
```

### Step 4: Refactor Pages
```bash
# Update app/(dashboard)/services/page.tsx
# Update app/(dashboard)/penalties/page.tsx
# Update app/(dashboard)/surcharges/page.tsx
```

### Step 5: Remove Mock Data
```bash
# Delete mock data from lib/mock-services.ts
# Remove mock imports from hooks
```

### Step 6: Test End-to-End
```bash
# Test regular service CRUD
# Test penalty application with custom price
# Test surcharge application with custom price
# Verify ServiceUsage records created correctly
```

---

## 🎯 KEY TAKEAWAYS

### Backend Strategy (DO NOT CHANGE)
1. ✅ **1 bảng Service** cho tất cả (services + penalty + surcharge)
2. ✅ **Hard-coded names**: "Phạt" và "Phụ thu" trong seed data
3. ✅ **App Settings** lưu IDs của 2 services đặc biệt
4. ✅ **ServiceUsage** với `customPrice` và `note` để track penalty/surcharge

### Frontend Strategy (TO IMPLEMENT)
1. ✅ **3 màn hình riêng** nhưng share chung Service type
2. ✅ **Filter by service name** để tách regular services
3. ✅ **Penalties page**: Không CRUD "Phạt" service, chỉ CRUD ServiceUsage records
4. ✅ **Surcharges page**: Không CRUD "Phụ thu" service, chỉ CRUD ServiceUsage records
5. ✅ **Services page**: Chỉ hiện regular services (filter out "Phạt" và "Phụ thu")

### API Pattern
```typescript
// Services (Regular)
GET    /employee/services               → Get all services
POST   /employee/services               → Create regular service
PATCH  /employee/services/:id           → Update service
DELETE /employee/services/:id           → Delete service

// Penalties (ServiceUsage with customPrice)
POST   /employee/service/penalty        → Apply penalty (create ServiceUsage)
GET    /employee/service/service-usage  → Get penalty usages (filter by serviceId)
PATCH  /employee/service/service-usage/:id → Update penalty usage
DELETE /employee/service/service-usage/:id → Delete penalty usage

// Surcharges (ServiceUsage with customPrice)
POST   /employee/service/surcharge      → Apply surcharge (create ServiceUsage)
GET    /employee/service/service-usage  → Get surcharge usages (filter by serviceId)
PATCH  /employee/service/service-usage/:id → Update surcharge usage
DELETE /employee/service/service-usage/:id → Delete surcharge usage
```

---

## 📝 NOTES

1. **Backend naming convention "Phạt" và "Phụ thu" là HARD REQUIREMENT**
   - Không được thay đổi tên này ở Backend
   - FE phải dựa vào tên này để filter

2. **customPrice vs unitPrice**
   - `unitPrice`: Giá gốc của service (từ Service table)
   - `customPrice`: Giá tùy chỉnh cho penalty/surcharge (từ ServiceUsage)
   - Billing dùng `customPrice` nếu có, fallback về `unitPrice`

3. **note field quan trọng**
   - Lưu lý do (reason) cho penalty/surcharge
   - Hiển thị trong invoice và báo cáo

4. **Service IDs trong App Settings**
   - `penalty_service_id`: ID của service có tên "Phạt"
   - `surcharge_service_id`: ID của service có tên "Phụ thu"
   - FE có thể query App Settings để lấy IDs thay vì filter by name

---

**Phân tích hoàn tất:** 12/01/2026  
**Backend:** KHÔNG THAY ĐỔI (source of truth)  
**Frontend:** CẦN REFACTOR để align với Backend architecture
