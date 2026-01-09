# Transaction & Service Compatibility Analysis

## 📋 Executive Summary

This document analyzes the compatibility between backend (`roommaster-be`) and frontend (`hotel-management-system-fe`) implementations for **Transaction**, **TransactionDetail**, and **Service** modules.

### Critical Findings
- **15 Compatibility Issues Identified**
- **6 Critical** (blocking functionality)
- **5 High** (degraded functionality)
- **4 Medium** (type safety/maintenance)

---

## 🎯 Backend Source of Truth

### 1. Data Models (Prisma Schema)

#### Transaction Model
```prisma
model Transaction {
  id             String              @id @default(cuid())
  bookingId      String?             // Nullable for refunds/adjustments
  type           TransactionType     // 5 values
  baseAmount     Decimal             @db.Decimal(10, 2)
  discountAmount Decimal             @db.Decimal(10, 2)
  amount         Decimal             @db.Decimal(10, 2)  // Final amount after discount
  method         PaymentMethod?      // Nullable for non-payment transactions
  status         TransactionStatus   @default(PENDING)
  processedById  String?
  details        TransactionDetail[] // One-to-many
  occurredAt     DateTime            @default(now())
  description    String?
  createdAt      DateTime            @default(now())
  updatedAt      DateTime            @updatedAt
}
```

**Key Insights:**
- `baseAmount` = Original amount before discounts
- `discountAmount` = Total discounts applied
- `amount` = Final payable amount (baseAmount - discountAmount)
- `bookingId` is nullable (for guest service payments)
- `method` is nullable (for non-payment transactions like adjustments)

#### TransactionDetail Model
```prisma
model TransactionDetail {
  id             String          @id @default(cuid())
  transactionId  String?         // NULLABLE - for guest service payments
  baseAmount     Decimal         @db.Decimal(10, 2)
  discountAmount Decimal         @db.Decimal(10, 2)
  amount         Decimal         @db.Decimal(10, 2)
  bookingRoomId  String?         // XOR with serviceUsageId
  serviceUsageId String?         // XOR with bookingRoomId
  // One of these two MUST be set
}
```

**Key Insights:**
- **Can exist standalone** (transactionId = null) for guest service payments (Scenario 4)
- **One of bookingRoomId OR serviceUsageId** must be set (business rule)
- Same amount tracking pattern as Transaction (base, discount, final)

#### Service Model
```prisma
model Service {
  id            String         @id @default(cuid())
  name          String
  price         Decimal        @db.Decimal(10, 2)  // Note: Decimal type
  unit          String         @default("lần")
  isActive      Boolean        @default(true)
  serviceUsages ServiceUsage[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}
```

**Key Insights:**
- Simple catalog entity
- `price` is Decimal type (10,2 precision)
- `unit` defaults to "lần" (times/occurrences)

#### ServiceUsage Model
```prisma
model ServiceUsage {
  id            String              @id @default(cuid())
  bookingId     String?             // Nullable for guest services
  bookingRoomId String?             // Nullable for guest services
  employeeId    String              // Required (who processed)
  serviceId     String              // Required
  quantity      Int                 @default(1)
  unitPrice     Decimal             @db.Decimal(10, 2)
  totalPrice    Decimal             @db.Decimal(10, 2)  // quantity × unitPrice
  totalPaid     Decimal             @default(0) @db.Decimal(10, 2)
  status        ServiceUsageStatus  @default(PENDING)
  // Relationships...
}
```

**Calculated Field (Not Stored):**
```typescript
balance = totalPrice - totalPaid
```

**Key Insights:**
- Tracks both booking-related and guest services
- `bookingId` and `bookingRoomId` both nullable (for walk-in guest services)
- `totalPaid` accumulates as partial payments are made
- Balance is calculated on-the-fly

### 2. Enums

#### TransactionType (Backend)
```typescript
enum TransactionType {
  DEPOSIT          // Partial payment before check-in
  ROOM_CHARGE      // Room-specific charges
  SERVICE_CHARGE   // Service-specific charges
  REFUND           // Money returned to customer
  ADJUSTMENT       // Manual corrections
}
```

#### PaymentMethod (Backend)
```typescript
enum PaymentMethod {
  CASH           // Tiền mặt
  CREDIT_CARD    // Thẻ tín dụng
  BANK_TRANSFER  // Chuyển khoản
  E_WALLET       // Ví điện tử
}
```

#### TransactionStatus (Backend)
```typescript
enum TransactionStatus {
  PENDING    // Awaiting processing
  COMPLETED  // Successfully processed
  FAILED     // Processing failed
  REFUNDED   // Money returned
}
```

#### ServiceUsageStatus (Backend)
```typescript
enum ServiceUsageStatus {
  PENDING      // Service requested
  TRANSFERRED  // Moved to billing
  COMPLETED    // Service delivered & paid
  CANCELLED    // Service cancelled
}
```

### 3. API Endpoints

#### Transaction APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/employee-api/v1/transactions` | Create transaction (4 scenarios) |
| GET    | `/employee-api/v1/transactions` | List transactions (with filters) |
| GET    | `/employee-api/v1/transactions/:id` | Get transaction details |
| GET    | `/employee-api/v1/transaction-details` | List transaction details |

#### Service APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/employee-api/v1/services` | Create service catalog item |
| GET    | `/employee-api/v1/services` | List services (with filters) |
| GET    | `/employee-api/v1/services/:id` | Get service details |
| PATCH  | `/employee-api/v1/services/:id` | Update service |
| DELETE | `/employee-api/v1/services/:id` | Delete service |

#### ServiceUsage APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/employee-api/v1/service/service-usage` | Create service usage |
| GET    | `/employee-api/v1/service/service-usage` | List service usages |
| PATCH  | `/employee-api/v1/service/service-usage/:id` | Update service usage |
| DELETE | `/employee-api/v1/service/service-usage/:id` | Delete service usage |

### 4. Transaction Creation - 4 Scenarios

#### Scenario 1: Full Booking Payment
**When:** Customer pays entire booking balance (all rooms + services)

**Request:**
```typescript
{
  bookingId: string;
  paymentMethod: PaymentMethod;
  transactionType: TransactionType;
  description?: string;
  employeeId: string;
  promotionApplications?: Array<{
    customerPromotionId: string;
    bookingRoomId?: string;       // For room-specific promotions
    serviceUsageId?: string;      // For service-specific promotions
  }>;
}
```

**Business Logic:**
1. Fetch booking with all rooms and services
2. Calculate balance for each room: `subtotalRoom - totalPaid`
3. Calculate balance for each service: `totalPrice - totalPaid`
4. Create TransactionDetails for ALL items with balance > 0
5. Apply promotions (if any)
6. Create Transaction entity linking all details
7. Update `totalPaid` for each room/service
8. Update booking totals: `totalDeposit`, `totalPaid`, `balance`
9. If fully paid: Update booking status to `CHECKED_OUT`

**Response:**
```typescript
{
  transaction: {
    id: string;
    bookingId: string;
    type: TransactionType;
    baseAmount: number;
    discountAmount: number;
    amount: number;
    method: PaymentMethod;
    status: TransactionStatus;
    details: TransactionDetail[];
  }
}
```

#### Scenario 2: Split Room Payment
**When:** Customer pays specific rooms only (not full booking)

**Request:**
```typescript
{
  bookingId: string;
  bookingRoomIds: string[];      // REQUIRED for this scenario
  paymentMethod: PaymentMethod;
  transactionType: TransactionType;
  description?: string;
  employeeId: string;
  promotionApplications?: Array<{...}>;
}
```

**Business Logic:**
1. Fetch booking and validate room IDs belong to booking
2. Calculate balance ONLY for selected rooms
3. **Services are NOT included** (must be paid separately via Scenario 3)
4. Create TransactionDetails for selected rooms only
5. Apply promotions
6. Create Transaction entity
7. Update `totalPaid` for selected rooms only
8. Update booking totals (may NOT reach fully paid)

**Key Difference from Scenario 1:**
- Only selected rooms are paid
- Services attached to these rooms are excluded
- Booking may remain partially paid

#### Scenario 3: Booking Service Payment
**When:** Customer pays a specific service within a booking

**Request:**
```typescript
{
  bookingId: string;
  serviceUsageId: string;        // REQUIRED for this scenario
  paymentMethod: PaymentMethod;
  transactionType: TransactionType.SERVICE_CHARGE;
  description?: string;
  employeeId: string;
  promotionApplications?: Array<{...}>;
}
```

**Business Logic:**
1. Fetch service usage and validate it belongs to booking
2. Calculate service balance: `totalPrice - totalPaid`
3. Create single TransactionDetail for service
4. Apply promotions (if any)
5. Create Transaction entity
6. Update service `totalPaid`
7. If service fully paid: Update status to `COMPLETED`

**Key Difference:**
- Single service payment
- Creates Transaction entity (unlike Scenario 4)
- Supports promotions

#### Scenario 4: Guest Service Payment
**When:** Walk-in guest pays for service (no booking)

**Request:**
```typescript
{
  serviceUsageId: string;        // REQUIRED
  paymentMethod: PaymentMethod;
  transactionType: TransactionType.SERVICE_CHARGE;
  employeeId: string;
  // No bookingId
  // No promotionApplications (guest services don't support promotions)
}
```

**Business Logic:**
1. Fetch service usage and validate NO bookingRoomId (must be guest service)
2. Calculate service balance
3. **Create TransactionDetail ONLY** (NO Transaction entity)
4. Update service `totalPaid`
5. If fully paid: Update status to `COMPLETED`
6. Create activity log

**Key Differences:**
- **No Transaction entity created** (transactionId = null)
- No promotion support
- No booking association
- Standalone payment record

### 5. Promotion Application

**Data Structure:**
```typescript
interface PromotionApplication {
  customerPromotionId: string;   // Required
  bookingRoomId?: string;        // For room-specific discounts
  serviceUsageId?: string;       // For service-specific discounts
}
```

**Business Rules:**
1. If both `bookingRoomId` and `serviceUsageId` are omitted → Transaction-level discount (distributed proportionally)
2. If `bookingRoomId` provided → Discount applies ONLY to that room
3. If `serviceUsageId` provided → Discount applies ONLY to that service
4. Validation: CustomerPromotion must exist and be active
5. Validation: Usage count must not exceed `maxUsagePerCustomer`
6. Calculation: Discount based on promotion type (PERCENTAGE or FIXED_AMOUNT)

**Discount Calculation Flow:**
```
1. Build TransactionDetails with baseAmount
2. Validate all promotions (exist, active, not exceeded)
3. Calculate discount for each promotion
4. Apply discounts to matching details
5. Update detail.discountAmount and detail.amount
6. Aggregate total: baseAmount, discountAmount, amount
7. Persist Transaction + TransactionDetails
8. Create UsedPromotion records
9. Increment CustomerPromotion.usageCount
```

---

## 🖥️ Frontend Current Implementation

### 1. Type Definitions

#### api.ts - Transaction Types
```typescript
// ✅ CORRECT - Matches backend
export type TransactionType =
  | "DEPOSIT"
  | "ROOM_CHARGE"
  | "SERVICE_CHARGE"
  | "REFUND"
  | "ADJUSTMENT";

// ✅ CORRECT - Matches backend
export type PaymentMethod =
  | "CASH"
  | "CREDIT_CARD"
  | "BANK_TRANSFER"
  | "E_WALLET";

export interface CreateTransactionRequest {
  bookingId: string;
  paymentMethod: PaymentMethod;
  transactionType: TransactionType;
  bookingRoomIds?: string[];
  promotionApplications?: Array<{
    customerPromotionId: string;
    bookingRoomId: string;        // ⚠️ Missing: serviceUsageId
  }>;
  // ❌ MISSING: serviceUsageId
  // ❌ MISSING: description
  // ❌ MISSING: employeeId
}
```

#### folio.ts - Folio Types
```typescript
// ❌ WRONG - Has 8 values instead of 5
export type TransactionType =
  | "ROOM_CHARGE"
  | "SERVICE"              // ❌ Should be "SERVICE_CHARGE"
  | "PAYMENT"              // ❌ Not in backend
  | "SURCHARGE"            // ❌ Not in backend
  | "PENALTY"              // ❌ Not in backend
  | "DEPOSIT"
  | "REFUND"
  | "ADJUSTMENT";

export interface FolioTransaction {
  transactionID: string;
  folioID: string;
  date: string;
  time: string;
  type: TransactionType;   // ⚠️ Using wrong enum
  description: string;
  debit: number;
  credit: number;
  createdBy: string;
  isVoided?: boolean;
  voidedBy?: string;
}
```

#### service.ts - Service Types
```typescript
// These are for UI-specific service management
// NOT for ServiceUsage entities
export interface ServiceCategory {
  categoryID: string;
  categoryName: string;
  icon?: string;
  serviceCount?: number;
  isActive?: boolean;
}

export interface ServiceItem {
  serviceID: string;
  serviceName: string;
  categoryID: string;
  categoryName?: string;
  defaultPrice: string;      // ⚠️ Should be number
  unit: string;
  isActive: boolean;
}
```

#### checkin-checkout.ts - Service Types
```typescript
export interface Service {
  id: string;
  name: string;
  price: string;             // ⚠️ Should be number
  unit: string;
}

export interface ServiceDetail {
  id: string;
  serviceName: string;
  quantity: number;
  unitPrice: string;         // ⚠️ Should be number
  totalPrice: string;        // ⚠️ Should be number
  status: string;
  // ❌ MISSING: totalPaid
  // ❌ MISSING: balance
}

export interface ServiceUsageRequest {
  bookingId: string;
  bookingRoomId?: string;
  serviceId: string;
  quantity: number;
  employeeId: string;
}

export interface ServiceUsageResponse {
  id: string;
  serviceId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
}
```

### 2. API Services

#### transaction.service.ts
```typescript
// ❌ WRONG - Endpoint missing /employee-api/v1
const API_BASE = "/employee/transactions";

export const createTransaction = async (
  data: CreateTransactionRequest
): Promise<Transaction> => {
  // ⚠️ Missing fields: serviceUsageId, description, employeeId
  const response = await api.post(API_BASE, data);
  return response.data;
};

export const getBill = async (bookingId: string) => {
  // ❌ WRONG - Endpoint not documented in backend
  const response = await api.get(`/employee/bookings/${bookingId}/bill`);
  return response.data;
};

export const processRefund = async (data: any) => {
  // ❌ WRONG - Endpoint not documented in backend
  const response = await api.post(`${API_BASE}/refund`, data);
  return response.data;
};
```

#### booking.service.ts
```typescript
// ❌ DUPLICATE - Different endpoint than transaction.service.ts
export const createTransaction = async (
  bookingId: string,
  data: CreateTransactionRequest
): Promise<any> => {
  const response = await api.post(
    `/employee/bookings/${bookingId}/transaction`,  // ❌ WRONG endpoint
    data
  );
  return response.data;
};

// ❌ WRONG - Service deletion should use ServiceUsage ID, not service ID
export const removeService = async (
  bookingId: string,
  serviceId: string
): Promise<void> => {
  await api.delete(`/employee/bookings/${bookingId}/services/${serviceId}`);
};
```

### 3. UI Components

#### payment-modal.tsx
**Current Implementation:**
- Simple payment method selection (Tiền mặt, Thẻ tín dụng, Chuyển khoản)
- Displays customer name and total amount
- Calls `onConfirm(method: PaymentMethod)` callback
- **Does NOT:**
  - Support split room payment (no room selection)
  - Support service-specific payment
  - Apply promotions
  - Show breakdown of charges
  - Handle scenarios 2, 3, 4

**Issues:**
- Only supports Scenario 1 (full booking payment)
- No promotion UI
- No service/room breakdown
- Vietnamese payment method names don't match backend enums

#### transaction-table.tsx
**Current Implementation:**
- Displays folio transaction history
- Shows: date, time, type, description, debit, credit, createdBy
- Supports void transaction action
- Uses `FolioTransaction` type with 8 TransactionTypes

**Issues:**
- Uses wrong `TransactionType` enum from folio.ts
- "Debit/Credit" accounting terminology (not matching backend's "amount")
- No link to TransactionDetails
- Cannot show room/service allocation
- Missing balance tracking

#### services/page.tsx
**Current Implementation:**
- Tabs for Services and Service Categories
- Service grid with create/edit/delete
- Category management
- Uses `ServiceItem` and `ServiceCategory` types

**Issues:**
- No integration with ServiceUsage
- No payment tracking
- No booking association
- Pure catalog management (missing usage tracking)

#### payments/page.tsx
**Current Implementation:**
- Shows recent invoices summary
- Stats: total invoices, total revenue, average per invoice
- Uses `useRecentInvoices()` hook
- Table of past invoices with reprint option

**Issues:**
- No transaction creation UI
- No folio integration
- Only displays historical data
- No action buttons for payment processing

---

## ❌ Compatibility Issues

### 🔴 Critical Issues (Blocking Functionality)

#### Issue #1: TransactionType Enum Mismatch in folio.ts
**Severity:** 🔴 Critical

**Description:**  
Frontend `folio.ts` defines `TransactionType` with 8 values, while backend has 5.

**Backend (Correct):**
```typescript
"DEPOSIT" | "ROOM_CHARGE" | "SERVICE_CHARGE" | "REFUND" | "ADJUSTMENT"
```

**Frontend folio.ts (Wrong):**
```typescript
"ROOM_CHARGE" | "SERVICE" | "PAYMENT" | "SURCHARGE" | "PENALTY" | "DEPOSIT" | "REFUND" | "ADJUSTMENT"
```

**Problems:**
1. `"SERVICE"` should be `"SERVICE_CHARGE"`
2. `"PAYMENT"`, `"SURCHARGE"`, `"PENALTY"` don't exist in backend
3. API requests with wrong types will fail validation
4. Transaction history displays wrong labels

**Impact:**
- Transaction creation fails with unknown type
- Folio display shows incorrect transaction types
- Filter/search by type doesn't work

**Fix:**
```typescript
// folio.ts
export type TransactionType =
  | "DEPOSIT"
  | "ROOM_CHARGE"
  | "SERVICE_CHARGE"  // Changed from "SERVICE"
  | "REFUND"
  | "ADJUSTMENT";
// Removed: "PAYMENT", "SURCHARGE", "PENALTY"

// Update labels
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  DEPOSIT: "Đặt cọc",
  ROOM_CHARGE: "Tiền phòng",
  SERVICE_CHARGE: "Tiền dịch vụ",  // Changed from SERVICE
  REFUND: "Hoàn tiền",
  ADJUSTMENT: "Điều chỉnh",
};
```

---

#### Issue #2: API Endpoint Path Inconsistency
**Severity:** 🔴 Critical

**Description:**  
Frontend uses wrong API endpoints that don't match backend routing.

**Backend (Correct):**
```
POST /employee-api/v1/transactions
```

**Frontend transaction.service.ts (Wrong):**
```typescript
const API_BASE = "/employee/transactions";  // Missing /employee-api/v1
```

**Frontend booking.service.ts (Also Wrong):**
```typescript
POST /employee/bookings/${bookingId}/transaction  // Completely different!
```

**Problems:**
1. All transaction API calls return 404 Not Found
2. Two competing implementations in different files
3. Missing `/employee-api/v1` path prefix
4. `booking.service.ts` uses non-existent endpoint

**Impact:**
- Transaction creation completely broken
- Payment processing fails silently
- Duplicate/conflicting code

**Fix:**
```typescript
// transaction.service.ts
const API_BASE = "/employee-api/v1/transactions";  // ✅ Correct path

// booking.service.ts
// ❌ REMOVE createTransaction method entirely (use transaction.service.ts instead)
// ❌ REMOVE removeService method (incorrect implementation)
```

---

#### Issue #3: CreateTransactionRequest Missing Fields
**Severity:** 🔴 Critical

**Description:**  
Frontend's `CreateTransactionRequest` interface is missing 3 critical fields required by backend.

**Backend Expects:**
```typescript
interface CreateTransactionPayload {
  bookingId?: string;
  bookingRoomIds?: string[];
  serviceUsageId?: string;     // ❌ MISSING in frontend
  paymentMethod: PaymentMethod;
  transactionType: TransactionType;
  description?: string;        // ❌ MISSING in frontend
  employeeId: string;          // ❌ MISSING in frontend
  promotionApplications?: Array<{
    customerPromotionId: string;
    bookingRoomId?: string;
    serviceUsageId?: string;   // ❌ MISSING in frontend
  }>;
}
```

**Frontend (Incomplete):**
```typescript
interface CreateTransactionRequest {
  bookingId: string;
  paymentMethod: PaymentMethod;
  transactionType: TransactionType;
  bookingRoomIds?: string[];
  promotionApplications?: Array<{
    customerPromotionId: string;
    bookingRoomId: string;
  }>;
}
```

**Problems:**
1. **No `serviceUsageId`** → Cannot use Scenario 3 (booking service payment) or Scenario 4 (guest service payment)
2. **No `description`** → Cannot add transaction notes/explanations
3. **No `employeeId`** → Backend cannot track who processed payment
4. **Promotion missing `serviceUsageId`** → Cannot apply promotions to services

**Impact:**
- Service payment scenarios (3 & 4) completely unusable
- No audit trail for who processed payments
- Service promotions cannot be applied
- Missing transaction descriptions

**Fix:**
```typescript
// lib/types/api.ts
export interface CreateTransactionRequest {
  bookingId?: string;              // Make optional (not needed for Scenario 4)
  bookingRoomIds?: string[];
  serviceUsageId?: string;         // ✅ ADD for Scenarios 3 & 4
  paymentMethod: PaymentMethod;
  transactionType: TransactionType;
  description?: string;            // ✅ ADD for transaction notes
  employeeId: string;              // ✅ ADD for audit trail
  promotionApplications?: Array<{
    customerPromotionId: string;
    bookingRoomId?: string;
    serviceUsageId?: string;       // ✅ ADD for service promotions
  }>;
}
```

---

#### Issue #4: PaymentModal Does Not Support Split Payment
**Severity:** 🔴 Critical

**Description:**  
`payment-modal.tsx` only supports full booking payment (Scenario 1). Cannot select specific rooms (Scenario 2) or services (Scenario 3).

**Current Implementation:**
- Single payment method dropdown
- No room selection UI
- No service selection UI
- Calls `onConfirm(method)` with no additional parameters

**Problems:**
1. Cannot pay for individual rooms
2. Cannot pay for specific services
3. No promotion application UI
4. No charge breakdown display

**Impact:**
- Scenario 2 (split room payment) impossible
- Scenario 3 (service payment) impossible
- Guests cannot partially pay bookings
- No flexibility in payment processing

**Fix Required:**
```typescript
interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary?: CheckoutSummary | null;
  onConfirm: (data: PaymentData) => void;  // ✅ Change parameter type
}

interface PaymentData {
  method: PaymentMethod;
  scenario: 1 | 2 | 3;                     // ✅ Payment scenario
  bookingRoomIds?: string[];               // ✅ For Scenario 2
  serviceUsageId?: string;                 // ✅ For Scenario 3
  promotions?: PromotionApplication[];     // ✅ Promotion support
  description?: string;                    // ✅ Transaction notes
}
```

**UI Changes Needed:**
1. Add radio buttons: "Full Payment" / "Split Rooms" / "Specific Service"
2. Show room checklist when "Split Rooms" selected
3. Show service dropdown when "Specific Service" selected
4. Add promotion selector
5. Add description textarea
6. Show calculated breakdown (base amount, discount, final amount)

---

#### Issue #5: ServiceUsage Types Missing Payment Tracking
**Severity:** 🔴 Critical

**Description:**  
Frontend `ServiceDetail` and `ServiceUsageResponse` types are missing critical payment tracking fields.

**Backend ServiceUsage:**
```typescript
{
  id: string;
  serviceId: string;
  quantity: number;
  unitPrice: Decimal;
  totalPrice: Decimal;   // quantity × unitPrice
  totalPaid: Decimal;    // ✅ Amount paid so far
  status: ServiceUsageStatus;
  // Calculated: balance = totalPrice - totalPaid
}
```

**Frontend ServiceDetail (Missing Fields):**
```typescript
interface ServiceDetail {
  id: string;
  serviceName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  status: string;
  // ❌ MISSING: totalPaid
  // ❌ MISSING: balance
}
```

**Problems:**
1. Cannot display service balance
2. Cannot determine if service is partially paid
3. Cannot show payment progress
4. Partial payments not tracked in UI

**Impact:**
- Service payment UI broken (no balance display)
- Cannot show "Paid: 50,000 / Total: 100,000"
- Users don't know how much service balance remains
- Scenario 3 payment amount calculation wrong

**Fix:**
```typescript
// lib/types/checkin-checkout.ts
export interface ServiceDetail {
  id: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;           // ✅ Change from string to number
  totalPrice: number;          // ✅ Change from string to number
  totalPaid: number;           // ✅ ADD
  balance: number;             // ✅ ADD (calculated: totalPrice - totalPaid)
  status: ServiceUsageStatus;  // ✅ Use proper enum
}

export interface ServiceUsageResponse {
  id: string;
  serviceId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  totalPaid: number;           // ✅ ADD
  status: ServiceUsageStatus;  // ✅ Use proper enum
}
```

---

#### Issue #6: Transaction History Does Not Link to Details
**Severity:** 🔴 Critical

**Description:**  
`FolioTransaction` type and `transaction-table.tsx` do not display TransactionDetails breakdown.

**Backend Structure:**
```
Transaction (header)
  ├── TransactionDetail (room 1)
  ├── TransactionDetail (room 2)
  └── TransactionDetail (service 1)
```

**Frontend FolioTransaction (Flat):**
```typescript
interface FolioTransaction {
  transactionID: string;
  // ... other fields
  // ❌ MISSING: details: TransactionDetail[]
}
```

**Problems:**
1. Cannot see room/service allocation
2. Cannot trace which room/service was paid
3. No drill-down capability
4. Debit/credit columns don't match backend's amount tracking

**Impact:**
- Cannot answer "Which rooms were paid in this transaction?"
- Accounting reconciliation difficult
- No transparency on charge allocation
- Folio report incomplete

**Fix:**
```typescript
// lib/types/folio.ts
export interface TransactionDetail {
  id: string;
  transactionId: string | null;  // Nullable for guest services
  bookingRoomId: string | null;
  serviceUsageId: string | null;
  baseAmount: number;
  discountAmount: number;
  amount: number;
  roomNumber?: string;           // For display
  serviceName?: string;          // For display
}

export interface FolioTransaction {
  transactionID: string;
  folioID: string;
  date: string;
  time: string;
  type: TransactionType;
  description: string;
  baseAmount: number;            // ✅ ADD
  discountAmount: number;        // ✅ ADD
  amount: number;                // ✅ Change from debit/credit
  method: PaymentMethod;         // ✅ ADD
  status: TransactionStatus;     // ✅ ADD
  createdBy: string;
  isVoided?: boolean;
  voidedBy?: string;
  details: TransactionDetail[];  // ✅ ADD
}
```

---

### 🟠 High Priority Issues

#### Issue #7: Service Price Type Mismatch
**Severity:** 🟠 High

**Description:**  
Frontend uses `string` for service prices, backend uses `Decimal` (returned as string in JSON but should be treated as number).

**Backend:**
```prisma
price Decimal @db.Decimal(10, 2)
```

**Frontend:**
```typescript
interface Service {
  price: string;  // ⚠️ Should be number for calculations
}
```

**Problems:**
1. Type inconsistency across codebase
2. Requires string → number conversion for calculations
3. Risk of precision errors
4. Confusing for developers

**Impact:**
- Math operations require parsing
- Potential floating-point errors
- Code maintenance difficulty
- Type safety compromised

**Fix:**
```typescript
// lib/types/api.ts
export interface Service {
  id: string;
  name: string;
  price: number;      // ✅ Change to number (JSON deserializes Decimal as string, parse it)
  unit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// When fetching from API:
const parseService = (raw: any): Service => ({
  ...raw,
  price: parseFloat(raw.price),  // ✅ Parse Decimal string to number
});
```

---

#### Issue #8: Promotion Application Incomplete
**Severity:** 🟠 High

**Description:**  
Frontend promotion structure only supports room-level discounts, not service-level.

**Backend:**
```typescript
interface PromotionApplication {
  customerPromotionId: string;
  bookingRoomId?: string;        // ✅ For room discounts
  serviceUsageId?: string;       // ❌ MISSING in frontend
}
```

**Frontend:**
```typescript
promotionApplications?: Array<{
  customerPromotionId: string;
  bookingRoomId: string;         // ⚠️ Not optional
  // ❌ MISSING: serviceUsageId
}>;
```

**Problems:**
1. Cannot apply promotions to services
2. Frontend assumes all promotions are room-specific
3. `bookingRoomId` not optional (blocks transaction-level discounts)

**Impact:**
- Service discounts impossible
- Transaction-level promotions (applied to total) don't work
- Business loses flexibility in promotional campaigns

**Fix:**
```typescript
// lib/types/api.ts
export interface PromotionApplication {
  customerPromotionId: string;
  bookingRoomId?: string;        // ✅ Make optional
  serviceUsageId?: string;       // ✅ ADD for service promotions
}

export interface CreateTransactionRequest {
  // ...
  promotionApplications?: PromotionApplication[];
}
```

---

#### Issue #9: No UI for Scenario 3 & 4 (Service Payments)
**Severity:** 🟠 High

**Description:**  
No UI components to create service-specific payments.

**Current State:**
- `payment-modal.tsx` only handles full booking payment
- No service payment dialog
- No guest service payment flow

**Missing Scenarios:**
1. **Scenario 3:** Pay specific service within booking
2. **Scenario 4:** Pay guest service (walk-in)

**Impact:**
- 50% of payment scenarios unusable
- Staff cannot process service payments
- Manual workarounds required

**Fix Required:**
Create new component `service-payment-modal.tsx`:

```typescript
interface ServicePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceUsage: ServiceUsage;    // Service to pay
  bookingId?: string;            // For Scenario 3 (omit for Scenario 4)
  onConfirm: (data: ServicePaymentData) => void;
}

interface ServicePaymentData {
  serviceUsageId: string;
  paymentMethod: PaymentMethod;
  amount: number;                // Can be partial payment
  description?: string;
  promotions?: PromotionApplication[];  // Only for Scenario 3
}
```

---

#### Issue #10: ServiceUsage Creation Missing employeeId
**Severity:** 🟠 High

**Description:**  
`ServiceUsageRequest` interface doesn't include `employeeId`, which is required by backend.

**Backend:**
```typescript
interface CreateServiceUsageDTO {
  bookingId?: string;
  bookingRoomId?: string;
  serviceId: string;
  quantity: number;
  employeeId: string;  // ✅ REQUIRED
}
```

**Frontend:**
```typescript
interface ServiceUsageRequest {
  bookingId: string;
  bookingRoomId?: string;
  serviceId: string;
  quantity: number;
  // ❌ MISSING: employeeId
}
```

**Problems:**
1. Backend validation fails (required field missing)
2. Cannot track who added service
3. Audit trail incomplete

**Impact:**
- Service creation API calls fail
- No accountability for service additions
- Activity logs incomplete

**Fix:**
```typescript
// lib/types/checkin-checkout.ts
export interface ServiceUsageRequest {
  bookingId?: string;           // ✅ Make optional (not needed for guest services)
  bookingRoomId?: string;
  serviceId: string;
  quantity: number;
  employeeId: string;           // ✅ ADD
}
```

---

#### Issue #11: Multiple Conflicting Transaction Service Files
**Severity:** 🟠 High

**Description:**  
`transaction.service.ts` and `booking.service.ts` both have `createTransaction` methods with different implementations.

**File 1: transaction.service.ts**
```typescript
POST /employee/transactions
```

**File 2: booking.service.ts**
```typescript
POST /employee/bookings/${bookingId}/transaction
```

**Problems:**
1. Code duplication
2. Different endpoints (both wrong)
3. Developers confused which to use
4. Future bugs from inconsistency

**Impact:**
- Maintenance nightmare
- Inconsistent behavior
- One will fail while other might work
- Hard to debug issues

**Fix:**
```typescript
// ❌ DELETE from booking.service.ts:
// - createTransaction method
// - removeService method

// ✅ KEEP ONLY transaction.service.ts with correct endpoint:
const API_BASE = "/employee-api/v1/transactions";
```

---

### 🟡 Medium Priority Issues

#### Issue #12: No Validation for bookingRoomId XOR serviceUsageId
**Severity:** 🟡 Medium

**Description:**  
Frontend doesn't enforce business rule: **exactly one** of `bookingRoomId` or `serviceUsageId` must be set in TransactionDetail.

**Backend Validation:**
```typescript
// One and only one must be set
if (!bookingRoomId && !serviceUsageId) {
  throw new Error('Either bookingRoomId or serviceUsageId required');
}
if (bookingRoomId && serviceUsageId) {
  throw new Error('Cannot set both bookingRoomId and serviceUsageId');
}
```

**Frontend:**
- No validation in types
- No runtime checks

**Impact:**
- Invalid API requests possible
- Confusing error messages from backend
- Developer mistakes

**Fix:**
```typescript
// Add validation function
export const validateTransactionDetailInput = (
  input: Partial<TransactionDetail>
): void => {
  const hasRoom = Boolean(input.bookingRoomId);
  const hasService = Boolean(input.serviceUsageId);
  
  if (!hasRoom && !hasService) {
    throw new Error('TransactionDetail must have either bookingRoomId or serviceUsageId');
  }
  
  if (hasRoom && hasService) {
    throw new Error('TransactionDetail cannot have both bookingRoomId and serviceUsageId');
  }
};
```

---

#### Issue #13: ServiceUsageStatus Enum Not Defined
**Severity:** 🟡 Medium

**Description:**  
Frontend uses `string` for service status instead of proper enum.

**Backend:**
```typescript
enum ServiceUsageStatus {
  PENDING
  TRANSFERRED
  COMPLETED
  CANCELLED
}
```

**Frontend:**
```typescript
status: string;  // ⚠️ No type safety
```

**Impact:**
- Typos in status values
- No autocomplete
- Harder to refactor
- Status comparisons error-prone

**Fix:**
```typescript
// lib/types/api.ts
export enum ServiceUsageStatus {
  PENDING = "PENDING",
  TRANSFERRED = "TRANSFERRED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const SERVICE_STATUS_LABELS: Record<ServiceUsageStatus, string> = {
  PENDING: "Chờ xử lý",
  TRANSFERRED: "Đã chuyển",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};
```

---

#### Issue #14: TransactionStatus Enum Missing
**Severity:** 🟡 Medium

**Description:**  
Frontend has no `TransactionStatus` enum.

**Backend:**
```typescript
enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}
```

**Frontend:**
- Not defined

**Impact:**
- Cannot display transaction status
- Cannot filter by status
- No status-based UI logic

**Fix:**
```typescript
// lib/types/api.ts
export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  PENDING: "Chờ xử lý",
  COMPLETED: "Hoàn thành",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền",
};

export const TRANSACTION_STATUS_COLORS: Record<TransactionStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-blue-100 text-blue-800",
};
```

---

#### Issue #15: PaymentMethod Enum Values Don't Match UI Labels
**Severity:** 🟡 Medium

**Description:**  
Backend uses English enum values, but UI shows Vietnamese labels directly in dropdown.

**Backend:**
```typescript
enum PaymentMethod {
  CASH
  CREDIT_CARD
  BANK_TRANSFER
  E_WALLET
}
```

**Frontend payment-modal.tsx:**
```tsx
<SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
<SelectItem value="Thẻ tín dụng">Thẻ tín dụng</SelectItem>
<SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
```

**Problems:**
1. **Enum values are Vietnamese** → Backend expects English
2. API calls will fail validation
3. No type safety

**Impact:**
- Payment method validation fails
- Backend rejects all payments
- Critical blocker for payment flow

**Fix:**
```tsx
// payment-modal.tsx
<Select value={method} onValueChange={(v: PaymentMethod) => setMethod(v)}>
  <SelectTrigger className="h-10">
    <SelectValue placeholder="Chọn phương thức" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="CASH">Tiền mặt</SelectItem>
    <SelectItem value="CREDIT_CARD">Thẻ tín dụng</SelectItem>
    <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
    <SelectItem value="E_WALLET">Ví điện tử</SelectItem>
  </SelectContent>
</Select>

// Add labels constant
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Tiền mặt",
  CREDIT_CARD: "Thẻ tín dụng",
  BANK_TRANSFER: "Chuyển khoản",
  E_WALLET: "Ví điện tử",
};
```

---

## 📝 Implementation Roadmap

### Phase 1: Critical Type Fixes (Priority: IMMEDIATE)
**Estimated Time:** 2 hours

1. **Fix TransactionType enum in folio.ts** (Issue #1)
   - File: `lib/types/folio.ts`
   - Change "SERVICE" → "SERVICE_CHARGE"
   - Remove "PAYMENT", "SURCHARGE", "PENALTY"
   - Update `TRANSACTION_TYPE_LABELS` constant

2. **Fix API endpoints** (Issue #2)
   - File: `lib/services/transaction.service.ts`
   - Change API_BASE to "/employee-api/v1/transactions"
   - File: `lib/services/booking.service.ts`
   - Remove `createTransaction` method
   - Remove `removeService` method (incorrect implementation)

3. **Add missing fields to CreateTransactionRequest** (Issue #3)
   - File: `lib/types/api.ts`
   - Add `serviceUsageId?: string`
   - Add `description?: string`
   - Add `employeeId: string`
   - Update `PromotionApplication` to include `serviceUsageId?`

4. **Fix PaymentMethod enum values** (Issue #15)
   - File: `components/payments/payment-modal.tsx`
   - Change dropdown values to English enums
   - Add `PAYMENT_METHOD_LABELS` constant

5. **Add missing enums** (Issues #13, #14)
   - File: `lib/types/api.ts`
   - Add `ServiceUsageStatus` enum
   - Add `TransactionStatus` enum
   - Add label constants for both

---

### Phase 2: Service Payment Tracking (Priority: HIGH)
**Estimated Time:** 3 hours

6. **Update ServiceUsage types** (Issues #5, #10)
   - File: `lib/types/checkin-checkout.ts`
   - Add `totalPaid: number` to `ServiceDetail`
   - Add `balance: number` to `ServiceDetail` (calculated)
   - Change price fields from `string` to `number`
   - Add `employeeId` to `ServiceUsageRequest`

7. **Fix Service price type** (Issue #7)
   - File: `lib/types/api.ts`
   - Change `price: string` to `price: number`
   - File: `lib/types/service.ts`
   - Change `defaultPrice: string` to `defaultPrice: number`
   - Add parsing logic in API service layer

8. **Update TransactionDetail types** (Issue #6)
   - File: `lib/types/folio.ts`
   - Create `TransactionDetail` interface
   - Add `details: TransactionDetail[]` to `FolioTransaction`
   - Add `baseAmount`, `discountAmount`, `amount` fields
   - Remove `debit`, `credit` fields

---

### Phase 3: Payment UI Enhancement (Priority: HIGH)
**Estimated Time:** 8 hours

9. **Enhance PaymentModal for split payments** (Issue #4)
   - File: `components/payments/payment-modal.tsx`
   - Add scenario selection: Full / Split Rooms / Service
   - Add room selection checkboxes
   - Add service dropdown
   - Add promotion selector
   - Add description textarea
   - Add amount breakdown display (base, discount, final)
   - Update `onConfirm` callback signature

10. **Create ServicePaymentModal** (Issue #9)
    - New file: `components/payments/service-payment-modal.tsx`
    - Support Scenario 3 (booking service payment)
    - Support Scenario 4 (guest service payment)
    - Show service details: name, quantity, unitPrice, totalPrice, totalPaid, balance
    - Allow partial payment input
    - Payment method selector
    - Promotion selector (only for Scenario 3)

11. **Update TransactionTable** (Issue #6)
    - File: `components/folio/transaction-table.tsx`
    - Add expandable rows to show TransactionDetails
    - Display room/service allocation
    - Show base amount, discount, final amount
    - Add status badge
    - Add payment method badge

---

### Phase 4: Service Management Integration (Priority: MEDIUM)
**Estimated Time:** 4 hours

12. **Update Service components** (Issue #11)
    - File: `components/services/*.tsx`
    - Change all price fields to number type
    - Add price formatting functions
    - Update forms to accept numeric input

13. **Add ServiceUsage display in CheckIn/CheckOut** (Issue #5)
    - File: `components/checkin-checkout/*.tsx`
    - Show service balance: "Paid: X / Total: Y"
    - Add "Pay Service" button → Opens ServicePaymentModal
    - Update service status display (use enum labels)
    - Show payment progress bar

14. **Add validation helpers** (Issue #12)
    - New file: `lib/utils/transaction-validators.ts`
    - Add `validateTransactionDetailInput` function
    - Add `validatePromotionApplication` function
    - Use in forms before API calls

---

### Phase 5: Testing & Documentation (Priority: MEDIUM)
**Estimated Time:** 3 hours

15. **Update API service calls**
    - File: `lib/services/transaction.service.ts`
    - Update `createTransaction` to send all required fields
    - Add `employeeId` from auth context
    - Add error handling for scenarios 2, 3, 4

16. **Add TypeScript strict checks**
    - Enable strict null checks for transaction types
    - Fix any `any` types in transaction/service code
    - Add JSDoc comments for complex interfaces

17. **Create test cases**
    - Test Scenario 1: Full booking payment
    - Test Scenario 2: Split room payment
    - Test Scenario 3: Booking service payment
    - Test Scenario 4: Guest service payment
    - Test promotion application (room & service)

---

## 🧪 Testing Checklist

### Scenario 1: Full Booking Payment
- [ ] Create booking with 2 rooms and 2 services
- [ ] Open payment modal
- [ ] Select payment method
- [ ] Verify all rooms and services are included
- [ ] Apply promotion (transaction-level)
- [ ] Verify discount calculation
- [ ] Complete payment
- [ ] Verify booking status → CHECKED_OUT
- [ ] Verify all balances → 0

### Scenario 2: Split Room Payment
- [ ] Create booking with 3 rooms
- [ ] Open payment modal
- [ ] Select "Split Rooms"
- [ ] Check 2 out of 3 rooms
- [ ] Apply promotion (room-specific)
- [ ] Complete payment
- [ ] Verify only selected rooms paid
- [ ] Verify booking still has balance
- [ ] Verify booking status NOT checked out yet

### Scenario 3: Booking Service Payment
- [ ] Create booking with service
- [ ] Click "Pay Service" on service row
- [ ] Select payment method
- [ ] Apply service-specific promotion
- [ ] Complete payment
- [ ] Verify service totalPaid updated
- [ ] Verify service status → COMPLETED
- [ ] Verify TransactionDetail links to serviceUsageId

### Scenario 4: Guest Service Payment
- [ ] Create service usage WITHOUT booking
- [ ] Open guest service payment modal
- [ ] Select payment method
- [ ] Complete payment (no promotions available)
- [ ] Verify TransactionDetail created WITHOUT transactionId
- [ ] Verify service status → COMPLETED

### General Transaction Tests
- [ ] Display transaction history in folio
- [ ] Expand transaction to see details
- [ ] Verify room/service allocation displayed
- [ ] Filter by transaction type
- [ ] Filter by date range
- [ ] Void transaction (if allowed)
- [ ] Print receipt

---

## 📚 API Usage Examples

### Example 1: Full Booking Payment (Scenario 1)
```typescript
import { createTransaction } from "@/lib/services/transaction.service";

const response = await createTransaction({
  bookingId: "booking_abc123",
  paymentMethod: "CASH",
  transactionType: "ROOM_CHARGE",
  description: "Full payment for booking #BK001",
  employeeId: "emp_xyz789",  // From auth context
  promotionApplications: [
    {
      customerPromotionId: "promo_123",
      // No bookingRoomId/serviceUsageId → Transaction-level discount
    },
  ],
});

console.log(response.transaction.amount);  // Final amount after discount
console.log(response.transaction.details);  // All rooms + services
```

### Example 2: Split Room Payment (Scenario 2)
```typescript
const response = await createTransaction({
  bookingId: "booking_abc123",
  bookingRoomIds: ["room_001", "room_002"],  // Pay these 2 rooms only
  paymentMethod: "CREDIT_CARD",
  transactionType: "ROOM_CHARGE",
  description: "Partial payment for 2 rooms",
  employeeId: "emp_xyz789",
  promotionApplications: [
    {
      customerPromotionId: "promo_456",
      bookingRoomId: "room_001",  // Discount applies only to room_001
    },
  ],
});
```

### Example 3: Booking Service Payment (Scenario 3)
```typescript
const response = await createTransaction({
  bookingId: "booking_abc123",
  serviceUsageId: "service_usage_789",  // Pay this specific service
  paymentMethod: "BANK_TRANSFER",
  transactionType: "SERVICE_CHARGE",
  description: "Payment for Spa service",
  employeeId: "emp_xyz789",
  promotionApplications: [
    {
      customerPromotionId: "promo_spa50",
      serviceUsageId: "service_usage_789",  // Service-specific discount
    },
  ],
});
```

### Example 4: Guest Service Payment (Scenario 4)
```typescript
const response = await createTransaction({
  // No bookingId for guest service
  serviceUsageId: "service_usage_999",
  paymentMethod: "CASH",
  transactionType: "SERVICE_CHARGE",
  description: "Guest laundry service",
  employeeId: "emp_xyz789",
  // No promotions for guest services
});

// Note: Response will have transactionDetail but NO transaction entity
console.log(response.transactionDetail.transactionId);  // null
```

---

## 🔗 Related Documentation

- **Backend API:** `roommaster-be/docs/TRANSACTION_API.md`
- **Prisma Schema:** `roommaster-be/prisma/schema.prisma`
- **Backend Service:** `roommaster-be/src/services/transaction/transaction.service.ts`
- **Frontend Types:** `hotel-management-system-fe/lib/types/api.ts`
- **Check-in Analysis:** `hotel-management-system-fe/BACKEND_FRONTEND_ANALYSIS.md`

---

## ✅ Summary

### What Works
- ✅ Basic transaction type enum in api.ts
- ✅ PaymentMethod enum in api.ts
- ✅ Service catalog management UI
- ✅ Transaction history display (basic)

### What's Broken
- ❌ Wrong TransactionType enum in folio.ts (8 values vs 5)
- ❌ Wrong API endpoints (/employee vs /employee-api/v1)
- ❌ Missing fields in CreateTransactionRequest (serviceUsageId, description, employeeId)
- ❌ No support for Scenarios 2, 3, 4 (only Scenario 1 works partially)
- ❌ Service payment tracking incomplete (missing totalPaid, balance)
- ❌ No TransactionDetail display
- ❌ Promotion application incomplete (no service support)

### Priority Actions
1. **Fix API endpoints** → Unblocks all transaction API calls
2. **Fix TransactionType enum** → Prevents validation errors
3. **Add missing request fields** → Enables all 4 scenarios
4. **Update PaymentModal** → Enables split payments
5. **Add ServicePaymentModal** → Enables service payments

**Estimated Total Implementation Time:** 20 hours  
**Recommended Team Size:** 1 developer  
**Testing Time:** 4 hours  
**Documentation Update:** 2 hours

---

**Document Version:** 1.0  
**Last Updated:** 2025-06-01  
**Next Review:** After Phase 1 implementation
