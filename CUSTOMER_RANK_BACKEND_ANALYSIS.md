# 📊 PHÂN TÍCH CUSTOMER RANK: Backend vs Frontend

**Ngày phân tích:** 2024-01-XX  
**Yêu cầu:** Đọc và phân tích toàn bộ codebase về Customer Rank, đảm bảo Frontend không tự tính rank

---

## 🎯 TÓM TẮT PHÁT HIỆN

### ✅ ĐÚNG: Customer Rank Management
- **Trang `/customer-ranks`** triển khai hoàn chỉnh và chính xác
- Sử dụng data từ Backend API (không tự tính)
- CRUD operations hoạt động đúng
- Statistics từ Backend endpoint

### ⚠️ VẤN ĐỀ NGHIÊM TRỌNG: Customer Display
- **Frontend đang TỰ TÍNH rank** trong `vip-info-tab.tsx`
- Sử dụng hardcoded thresholds thay vì dùng Backend data
- Hiển thị `vipTier` (DEPRECATED) thay vì `customer.rank`
- **Vi phạm business logic từ Backend**

---

## 📋 BACKEND BUSINESS LOGIC (Source of Truth)

### 1️⃣ Database Schema

```prisma
model Customer {
  id         String  @id @default(cuid())
  fullName   String
  phone      String  @unique
  
  // VIP Rank System (Backend-managed)
  rankId     String?
  rank       CustomerRank? @relation(fields: [rankId], references: [id])
  totalSpent Decimal @default(0) @db.Decimal(10, 2) // CACHED from transactions
  
  bookings   Booking[]
  // ...
  
  @@index([rankId])
}

model CustomerRank {
  id          String   @id @default(cuid())
  name        String   @unique          // "VIP1", "VIP2"
  displayName String                    // "Thành viên Vàng"
  description String?
  minSpending Decimal  @db.Decimal(10, 2)
  maxSpending Decimal? @db.Decimal(10, 2) // null = no upper limit
  benefits    String?  @db.Text         // JSON string
  color       String?                    // Hex code
  
  customers   Customer[]
  
  @@index([minSpending])
}
```

**Key Points:**
- `Customer.totalSpent` là **CACHED** (không tính on-demand)
- `Customer.rankId` được **tự động cập nhật** bởi Backend
- `CustomerRank` thresholds **KHÔNG hardcoded** - dynamic từ database

---

### 2️⃣ Backend Business Rules

**File:** `roommaster-be/src/services/customer-rank.service.ts`

#### A. Tính toán totalSpent

```typescript
async calculateCustomerSpending(customerId: string): Promise<number> {
  const result = await this.prisma.booking.aggregate({
    _sum: { totalPrice: true },
    where: {
      customerId: customerId,
      status: BookingStatus.COMPLETED  // Chỉ tính booking COMPLETED
    }
  });
  
  return result._sum.totalPrice?.toNumber() || 0;
}
```

**Rules:**
- ✅ Chỉ tính booking có status = `COMPLETED`
- ✅ Tổng hợp từ `Booking.totalPrice`
- ✅ Return 0 nếu chưa có booking

---

#### B. Xác định Rank

```typescript
async determineRank(totalSpent: number): Promise<CustomerRank | null> {
  return await this.prisma.customerRank.findFirst({
    where: {
      minSpending: { lte: totalSpent },
      OR: [
        { maxSpending: { gte: totalSpent } },
        { maxSpending: null }  // No upper limit
      ]
    },
    orderBy: { minSpending: 'desc' }  // Get highest matching tier
  });
}
```

**Rules:**
- ✅ Dynamic query dựa trên database thresholds
- ✅ `maxSpending = null` = không giới hạn trên
- ✅ Trả về rank cao nhất thỏa mãn điều kiện

---

#### C. Tự động cập nhật Rank

```typescript
async updateCustomerRank(customerId: string): Promise<boolean> {
  const totalSpent = await this.calculateCustomerSpending(customerId);
  const newRank = await this.determineRank(totalSpent);
  
  const customer = await this.prisma.customer.findUnique({
    where: { id: customerId },
    select: { rankId: true }
  });
  
  // Only update if rank changed
  if (customer?.rankId !== newRank?.id) {
    await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        totalSpent: totalSpent,
        rankId: newRank?.id || null
      }
    });
    return true; // Rank changed
  }
  
  // Update totalSpent even if rank unchanged
  await this.prisma.customer.update({
    where: { id: customerId },
    data: { totalSpent: totalSpent }
  });
  
  return false; // Rank unchanged
}
```

**Rules:**
- ✅ Gọi khi booking complete
- ✅ Cập nhật `totalSpent` (cache)
- ✅ Cập nhật `rankId` nếu thay đổi
- ✅ Return true nếu rank thay đổi (để log activity)

---

### 3️⃣ API Endpoints

**Customer Endpoints (Public):**
```
GET  /v1/customer/ranks           - List all ranks (public info)
GET  /v1/customer/ranks/:id       - Get rank details
```

**Employee Endpoints (Admin):**
```
GET  /v1/employee/ranks           - List all ranks
POST /v1/employee/ranks           - Create rank
PUT  /v1/employee/ranks/:id       - Update rank
DELETE /v1/employee/ranks/:id     - Delete rank
GET  /v1/employee/ranks/statistics - Get statistics
PUT  /v1/employee/customers/:customerId/rank - Manual rank override
```

**Customer List API:**
```typescript
// GET /v1/employee/customers?include=rank
{
  data: [
    {
      id: "customer-id",
      fullName: "Nguyễn Văn A",
      totalSpent: 15000000,  // ✅ From Backend
      rankId: "rank-id",
      rank: {                 // ✅ Populated via Prisma include
        id: "rank-id",
        displayName: "Thành viên Vàng",
        minSpending: 10000000,
        maxSpending: 50000000,
        color: "#FFD700",
        benefits: "{...}"
      }
    }
  ]
}
```

---

## 🖥️ FRONTEND IMPLEMENTATION

### ✅ ĐÚNG: Customer Rank Management Page

**File:** `app/(dashboard)/customer-ranks/page.tsx`

```typescript
// ✅ Fetch từ Backend API
const loadRanks = async () => {
  const data = await customerRankService.getRanks();
  setRanks(data);
};

const loadStatistics = async () => {
  const data = await customerRankService.getRankStatistics();
  setStatistics(data);
};
```

**Components:**
- ✅ `RankBadge` - Hiển thị rank badge từ data
- ✅ `RankForm` - CRUD form gửi đến Backend
- ✅ `RankStatistics` - Hiển thị statistics từ Backend

**Đánh giá:** Triển khai hoàn toàn đúng, không tự tính toán.

---

### ✅ ĐÚNG: Customer Table & Details

**File:** `components/customers/customer-table.tsx`

```tsx
// ✅ Hiển thị rank từ Backend data
<RankBadge rank={customer.rank} />
```

**File:** `components/customers/customer-details-modal.tsx`

```tsx
// ✅ Hiển thị rank từ Backend data
<RankBadge rank={customer.rank} />
```

**File:** `hooks/use-customers.ts`

```typescript
function mapCustomerToRecord(customer: Customer): CustomerRecord {
  return {
    // ...
    totalSpent: customer.totalSpent || 0,  // ✅ From Backend
    rank: customer.rank || null,           // ✅ From Backend
    rankId: customer.rankId || null,       // ✅ From Backend
    
    // DEPRECATED (hardcoded fallback)
    isVip: false,
    vipTier: "STANDARD",
  };
}
```

**Đánh giá:** Đúng, nhưng còn fields DEPRECATED cần cleanup.

---

### ❌ SAI: VIP Info Tab - TỰ TÍNH RANK Ở FRONTEND

**File:** `components/customers/vip-info-tab.tsx`

```tsx
// ❌ WRONG: Tự tính tier từ totalSpent
import { getNextTierProgress } from "@/lib/utils/vip-tier";

export function VIPInfoTab({ customer }: VIPInfoTabProps) {
  // ❌ WRONG: Calculate locally instead of using Backend data
  const tierProgress = getNextTierProgress(customer.totalSpent);
  
  return (
    <div>
      {/* ❌ WRONG: Use hardcoded vipTier instead of customer.rank */}
      <Badge className={VIP_TIER_COLORS[customer.vipTier]}>
        {VIP_TIER_LABELS[customer.vipTier]}
      </Badge>
      
      {/* ❌ WRONG: Show progress to hardcoded tier */}
      <Progress value={tierProgress.progressPercentage} />
      <p>Chi tiêu thêm {tierProgress.amountToNextTier} để lên hạng</p>
    </div>
  );
}
```

**File:** `lib/utils/vip-tier.ts`

```typescript
// ❌ WRONG: Hardcoded thresholds duplicate Backend logic
export const VIP_TIER_THRESHOLDS: Record<VIPTier, number> = {
  STANDARD: 0,
  VIP: 10000000,      // ❌ HARDCODED - should be from Backend
  PLATINUM: 50000000, // ❌ HARDCODED - should be from Backend
};

// ❌ WRONG: Calculate tier locally
export const calculateVIPTier = (totalSpent: number): VIPTier => {
  if (totalSpent >= VIP_TIER_THRESHOLDS.PLATINUM) {
    return "PLATINUM";
  } else if (totalSpent >= VIP_TIER_THRESHOLDS.VIP) {
    return "VIP";
  } else {
    return "STANDARD";
  }
};

// ❌ WRONG: Calculate progress using hardcoded thresholds
export const getNextTierProgress = (totalSpent: number) => {
  const currentTier = calculateVIPTier(totalSpent);
  // ... calculation logic
};
```

**File:** `lib/types/customer.ts`

```typescript
// ❌ DEPRECATED but still used
export type VIPTier = "STANDARD" | "VIP" | "PLATINUM";

export const VIP_TIER_THRESHOLDS: Record<VIPTier, number> = {
  STANDARD: 0,
  VIP: 10000000,
  PLATINUM: 50000000,
};
```

---

## 🚨 VẤN ĐỀ CẦN SỬA

### 1️⃣ Frontend tự tính rank vi phạm business logic

**Vấn đề:**
- `vip-tier.ts` tự tính rank với thresholds hardcoded
- Không sync với CustomerRank trong database
- Nếu admin thay đổi thresholds → Frontend vẫn dùng giá trị cũ
- Vi phạm nguyên tắc "Backend là source of truth"

**Ví dụ lỗi:**
```
Backend: "Vàng" tier = 15M - 30M
Frontend: "VIP" tier = 10M - 50M (hardcoded)

Customer có totalSpent = 20M:
- Backend hiển thị: "Thành viên Vàng"
- Frontend tính: "VIP"
→ KHÔNG KHỚP
```

---

### 2️⃣ Dùng deprecated `vipTier` thay vì `customer.rank`

**Vấn đề:**
- `vip-info-tab.tsx` dùng `customer.vipTier` (hardcoded 3 tiers)
- Không hiển thị `customer.rank` từ Backend (dynamic unlimited tiers)
- Thiếu thông tin: benefits, color, description

---

### 3️⃣ Không hiển thị benefits từ rank

**Vấn đề:**
- Backend có field `benefits` (JSON) cho mỗi rank
- Frontend không hiển thị benefits trong VIP Info Tab
- User không biết quyền lợi của rank hiện tại

---

## ✅ GIẢI PHÁP ĐỀ XUẤT

### 1️⃣ Xóa bỏ tính toán rank ở Frontend

**Delete files:**
```bash
lib/utils/vip-tier.ts  # ❌ DELETE ENTIRE FILE
```

**Cleanup types:**
```typescript
// lib/types/customer.ts
// ❌ REMOVE:
export type VIPTier = "STANDARD" | "VIP" | "PLATINUM";
export const VIP_TIER_LABELS: Record<VIPTier, string> = { ... };
export const VIP_TIER_COLORS: Record<VIPTier, string> = { ... };
export const VIP_TIER_THRESHOLDS: Record<VIPTier, number> = { ... };

// ❌ REMOVE from CustomerRecord:
isVip: boolean;
vipTier: VIPTier;
```

---

### 2️⃣ Refactor VIP Info Tab sử dụng Backend data

**File:** `components/customers/vip-info-tab.tsx` (NEW)

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RankBadge } from "@/components/customer-ranks/rank-badge";
import type { CustomerRecord } from "@/lib/types/customer";
import { formatSpending, parseBenefits } from "@/lib/types/customer-rank";

interface VIPInfoTabProps {
  customer: CustomerRecord;
  // NEW: Pass all ranks to calculate next tier
  allRanks: CustomerRank[];
}

export function VIPInfoTab({ customer, allRanks }: VIPInfoTabProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // ✅ NEW: Get next rank from Backend data
  const getNextRankInfo = () => {
    if (!customer.rank) {
      // No current rank - find first rank
      const firstRank = allRanks
        .sort((a, b) => Number(a.minSpending) - Number(b.minSpending))[0];
      return {
        nextRank: firstRank,
        amountToNext: firstRank ? Number(firstRank.minSpending) : 0,
        progress: 0
      };
    }

    // Find next higher rank
    const currentMin = Number(customer.rank.minSpending);
    const nextRank = allRanks
      .filter(r => Number(r.minSpending) > currentMin)
      .sort((a, b) => Number(a.minSpending) - Number(b.minSpending))[0];

    if (!nextRank) {
      // Already at highest tier
      return {
        nextRank: null,
        amountToNext: 0,
        progress: 100
      };
    }

    // Calculate progress
    const currentSpent = customer.totalSpent;
    const nextMin = Number(nextRank.minSpending);
    const currentMax = customer.rank.maxSpending 
      ? Number(customer.rank.maxSpending) 
      : nextMin;
    const range = nextMin - currentMin;
    const progress = range > 0 
      ? Math.min(((currentSpent - currentMin) / range) * 100, 100)
      : 0;
    const amountToNext = Math.max(nextMin - currentSpent, 0);

    return { nextRank, amountToNext, progress };
  };

  const { nextRank, amountToNext, progress } = getNextRankInfo();
  const benefits = customer.rank ? parseBenefits(customer.rank.benefits) : {};

  return (
    <div className="space-y-6">
      {/* Current Rank Card */}
      <Card className="bg-gradient-to-br from-amber-50 to-purple-50 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            Hạng thành viên
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Hạng hiện tại</p>
              {/* ✅ Use Backend rank data */}
              <RankBadge rank={customer.rank} size="lg" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Tổng chi tiêu</p>
              <p className="text-2xl font-bold text-primary-600">
                {formatCurrency(customer.totalSpent)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {customer.totalBookings} lần đặt phòng
              </p>
            </div>
          </div>

          {/* Progress to Next Rank */}
          {nextRank && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">
                  Tiến độ lên hạng {nextRank.displayName}
                </p>
                <p className="text-sm text-gray-600">
                  {progress.toFixed(0)}%
                </p>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-gray-500 mt-2">
                Chi tiêu thêm {formatCurrency(amountToNext)} để lên hạng
              </p>
            </div>
          )}

          {!nextRank && customer.rank && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-purple-700">
                <span className="text-xl">🏆</span>
                <p className="text-sm font-medium">
                  Bạn đã đạt hạng thành viên cao nhất!
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benefits Card - ✅ NEW: Show rank benefits */}
      {customer.rank && Object.keys(benefits).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">🎁</span>
              Quyền lợi thành viên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Object.entries(benefits).map(([key, value]) => (
                <li key={key} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-sm text-gray-700">
                    {value === true ? key : `${key}: ${value}`}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Spending Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            Chi tiết chi tiêu
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customer.rank && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ngưỡng tối thiểu:</span>
                <span className="font-medium">
                  {formatSpending(customer.rank.minSpending)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngưỡng tối đa:</span>
                <span className="font-medium">
                  {customer.rank.maxSpending 
                    ? formatSpending(customer.rank.maxSpending)
                    : "Không giới hạn"}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### 3️⃣ Update Customer Page để pass allRanks

**File:** `components/customers/customer-details-modal.tsx`

```tsx
import { useCustomerRanks } from "@/hooks/use-customer-ranks";

export function CustomerDetailsModal({ customer, onClose }: Props) {
  const { ranks } = useCustomerRanks(); // ✅ Fetch all ranks
  
  // Load ranks on mount
  useEffect(() => {
    loadRanks();
  }, []);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      {/* ... */}
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="vip">Hạng thành viên</TabsTrigger>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vip">
          {/* ✅ Pass allRanks */}
          <VIPInfoTab customer={customer} allRanks={ranks} />
        </TabsContent>
      </Tabs>
    </Dialog>
  );
}
```

---

### 4️⃣ Update Customer Filters (nếu cần)

**Hiện tại:**
```typescript
export interface CustomerFilters {
  searchQuery: string;
  typeFilter: CustomerType | "Tất cả";
  vipFilter: "Tất cả" | "VIP" | "Thường"; // ❌ Hardcoded
}
```

**Đề xuất:**
```typescript
export interface CustomerFilters {
  searchQuery: string;
  typeFilter: CustomerType | "Tất cả";
  rankFilter: string | "Tất cả"; // ✅ rankId or "Tất cả"
}
```

**UI:**
```tsx
<Select value={rankFilter} onValueChange={setRankFilter}>
  <SelectItem value="Tất cả">Tất cả hạng</SelectItem>
  {ranks.map(rank => (
    <SelectItem key={rank.id} value={rank.id}>
      {rank.displayName}
    </SelectItem>
  ))}
</Select>
```

---

## 📊 SO SÁNH TRƯỚC/SAU

### TRƯỚC (Hiện tại - SAI)

| Aspect | Implementation | Issue |
|--------|----------------|-------|
| Rank Calculation | `calculateVIPTier()` in Frontend | ❌ Duplicate logic |
| Thresholds | Hardcoded `VIP_TIER_THRESHOLDS` | ❌ Cannot change |
| Tiers | Fixed 3 tiers (STANDARD/VIP/PLATINUM) | ❌ Inflexible |
| Benefits | Not displayed | ❌ Missing feature |
| Next Rank | Calculated with hardcoded thresholds | ❌ Wrong data |

### SAU (Đề xuất - ĐÚNG)

| Aspect | Implementation | Benefit |
|--------|----------------|---------|
| Rank Calculation | Use `customer.rank` from Backend | ✅ Always correct |
| Thresholds | From `CustomerRank` table | ✅ Admin can change |
| Tiers | Unlimited dynamic tiers | ✅ Flexible |
| Benefits | Display from `rank.benefits` | ✅ Complete info |
| Next Rank | Calculated from all ranks | ✅ Accurate |

---

## 🎯 CHECKLIST TRIỂN KHAI

### Phase 1: Cleanup (Remove old code)
- [ ] Delete `lib/utils/vip-tier.ts`
- [ ] Remove `VIPTier` type from `lib/types/customer.ts`
- [ ] Remove `VIP_TIER_*` constants from `lib/types/customer.ts`
- [ ] Remove `isVip`, `vipTier` fields from `CustomerRecord`
- [ ] Update `mapCustomerToRecord()` to remove deprecated fields

### Phase 2: Refactor VIP Info Tab
- [ ] Update `VIPInfoTab` component to accept `allRanks` prop
- [ ] Replace hardcoded tier logic with Backend data
- [ ] Add benefits display section
- [ ] Add spending details section
- [ ] Calculate next rank from `allRanks` array

### Phase 3: Update Parent Components
- [ ] Update `CustomerDetailsModal` to fetch and pass ranks
- [ ] Update `CustomerPage` to fetch and pass ranks
- [ ] Ensure ranks loaded before showing VIP tab

### Phase 4: Testing
- [ ] Test với customer không có rank (null)
- [ ] Test với customer ở tier thấp nhất
- [ ] Test với customer ở tier cao nhất
- [ ] Test với customer ở tier giữa
- [ ] Test progress bar calculation
- [ ] Test benefits display

### Phase 5: Optional Enhancements
- [ ] Update customer filters to use dynamic ranks
- [ ] Add rank badge to customer cards
- [ ] Add rank distribution chart to dashboard
- [ ] Add notification when customer upgrades rank

---

## 📝 KẾT LUẬN

### ✅ Đã đúng
- Customer Rank Management page (CRUD, statistics)
- Customer table/details modal (hiển thị rank badge)
- Hooks và services (fetch từ Backend)

### ❌ Cần sửa ngay
- **VIP Info Tab**: Đang tự tính rank với hardcoded thresholds
- **vip-tier.ts**: File này vi phạm business logic, cần xóa
- **Customer types**: Còn fields DEPRECATED cần cleanup

### 🎯 Ưu tiên cao
1. Xóa `lib/utils/vip-tier.ts` và mọi hardcoded thresholds
2. Refactor `VIPInfoTab` sử dụng `customer.rank` từ Backend
3. Cleanup deprecated fields (`isVip`, `vipTier`)

### 💡 Best Practices
- **Backend là source of truth** - KHÔNG BAO GIỜ tính toán business logic ở Frontend
- **Dynamic over Hardcoded** - Luôn dùng data từ database thay vì hardcode
- **Flexible Design** - Thiết kế cho phép admin thay đổi rules mà không cần code

---

**Tài liệu tham chiếu:**
- Backend service: `roommaster-be/src/services/customer-rank.service.ts`
- Database schema: `roommaster-be/prisma/schema.prisma` (lines 130-160, 584-614)
- Frontend types: `hotel-management-system-fe/lib/types/customer-rank.ts`
