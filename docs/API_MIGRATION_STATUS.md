# API Migration Status Report

**Generated:** ${new Date().toISOString()}  
**Project:** Hotel Management System Frontend  
**Backend API:** Roommaster API (swagger.yml)

## Overview

This document tracks the migration of the frontend from mock data to real API integration based on the swagger.yml specification.

## Migration Summary

### ✅ Completed Migrations (4/4 Core Entities)

#### 1. Authentication (`use-auth.ts`)
- **Status:** ✅ Complete
- **Service:** `authService` from `@/lib/services/auth.service.ts`
- **API Endpoints:**
  - `POST /employee/auth/login` - Login with username/password
  - `POST /employee/auth/logout` - Logout
  - `POST /employee/auth/refresh-tokens` - Refresh JWT tokens
  - `GET /employee/profile` - Get current employee profile
  - `PATCH /employee/profile` - Update profile
  - `POST /employee/profile/change-password` - Change password
  - `POST /employee/auth/forgot-password` - Request password reset
  - `POST /employee/auth/reset-password` - Reset password with token
- **Breaking Changes:**
  - Changed from email-based login to username-based login
  - Updated `app/(auth)/login/page.tsx` to use username field
- **Files Modified:**
  - `lib/services/auth.service.ts`
  - `hooks/use-auth.ts`
  - `app/(auth)/login/page.tsx`

#### 2. Customer Management (`use-customers.ts`)
- **Status:** ✅ Complete
- **Service:** `customerService` from `@/lib/services/customer.service.ts`
- **API Endpoints:**
  - `GET /employee/customers` - Get all customers (paginated)
  - `GET /employee/customers/{customerId}` - Get customer by ID
  - `POST /employee/customers` - Create new customer
  - `PUT /employee/customers/{customerId}` - Update customer
  - `DELETE /employee/customers/{customerId}` - Delete customer
- **Features:**
  - Pagination support (page, limit, sortBy, sortOrder)
  - Search by name, phone, email, CCCD
  - Filter by active status
  - Type mapping: API `Customer` ↔ Local `CustomerRecord`
- **Files Modified:**
  - `hooks/use-customers.ts`
- **Mapper Functions:**
  - `mapCustomerToRecord(apiCustomer)` - Converts API Customer to local CustomerRecord format

#### 3. Employee/Staff Management (`use-staff.ts`)
- **Status:** ✅ Complete
- **Service:** `employeeService` from `@/lib/services/employee.service.ts`
- **API Endpoints:**
  - `GET /employee/employees` - Get all employees (paginated)
  - `GET /employee/employees/{employeeId}` - Get employee by ID
  - `POST /employee/employees` - Create new employee
  - `PUT /employee/employees/{employeeId}` - Update employee
  - `DELETE /employee/employees/{employeeId}` - Delete employee
- **Features:**
  - Pagination support
  - Search by name, CCCD, phone, email
  - Filter by role and active status
  - Type mapping: API `Employee` ↔ Local `Employee`
  - Vietnamese role names mapped to API format:
    - "Admin" → `ADMIN`
    - "Lễ tân" → `RECEPTIONIST`
    - "Quản lý" → `MANAGER`
- **Files Modified:**
  - `hooks/use-staff.ts`
- **Mapper Functions:**
  - `mapRoleToApi(viRole)` - Converts Vietnamese role to API format
  - `mapApiToEmployee(apiEmployee)` - Converts API Employee to local format

#### 4. Room Type Management (`use-room-types.ts`)
- **Status:** ✅ Complete
- **Service:** `roomService` from `@/lib/services/room.service.ts`
- **API Endpoints:**
  - `GET /employee/room-types` - Get all room types (paginated)
  - `GET /employee/room-types/{roomTypeId}` - Get room type by ID
  - `POST /employee/room-types` - Create new room type
  - `PUT /employee/room-types/{roomTypeId}` - Update room type
  - `DELETE /employee/room-types/{roomTypeId}` - Delete room type
  - `GET /employee/rooms` - Get all rooms (for usage check)
- **Features:**
  - Pagination support
  - Search and filters (price range, capacity)
  - Room usage validation before deletion
  - Type mapping: API `RoomType` ↔ Local `RoomType`
  - Amenities conversion: API `Record<string, boolean>` ↔ Local `string[]`
- **Files Modified:**
  - `hooks/use-room-types.ts`
- **Mapper Functions:**
  - `mapApiToRoomType(apiType)` - Converts API RoomType to local format
  - `convertAmenitiesToApi(amenities)` - Converts amenities array to object

#### 5. Service Management (`use-services.ts`)
- **Status:** ✅ Complete (partial - categories remain mock)
- **Service:** `serviceManagementService` from `@/lib/services/service.service.ts`
- **API Endpoints:**
  - `GET /employee/services` - Get all services (paginated)
  - `GET /employee/services/{serviceId}` - Get service by ID
  - `POST /employee/services` - Create new service
  - `PUT /employee/services/{serviceId}` - Update service
  - `DELETE /employee/services/{serviceId}` - Delete service
- **Features:**
  - Pagination support
  - Search by name
  - Filter by active status and price range
  - Type mapping: API `Service` ↔ Local `ServiceItem`
- **Limitations:**
  - **Categories are NOT supported by API** - kept as mock data from `@/lib/mock-services`
  - Service categories remain client-side only
- **Files Modified:**
  - `hooks/use-services.ts`
- **Mapper Functions:**
  - `mapApiToServiceItem(apiService, categories)` - Converts API Service to local ServiceItem

---

### 🔄 Partial Migrations (Needs Review)

#### 6. Dashboard (`use-dashboard-page.ts`)
- **Status:** 🔄 Partial - still using mock auth
- **Current:** Uses `getCurrentUser()` and `mockLogout()` from `@/lib/mock-auth`
- **Recommended:** Use `authService.getCurrentUser()` from `@/lib/services/auth.service.ts`
- **API Endpoint:** `GET /employee/profile`
- **Files to Modify:**
  - `hooks/use-dashboard-page.ts`

---

### ❌ No API Support (Keep Mock Data)

These features do not have corresponding endpoints in swagger.yml and should continue using mock data until the backend API is expanded:

#### 7. Penalty Management (`use-penalty-page.ts`)
- **Status:** ❌ No API available
- **Current:** Uses `mockPenaltyItems` from `@/lib/mock-penalties`
- **Missing Endpoints:** No `/employee/penalties` endpoints in swagger.yml
- **Action:** Keep mock data until backend implements penalty API

#### 8. Surcharge Management (`use-surcharge-page.ts`)
- **Status:** ❌ No API available
- **Current:** Uses `mockSurchargeItems` from `@/lib/mock-surcharges`
- **Missing Endpoints:** No `/employee/surcharges` endpoints in swagger.yml
- **Action:** Keep mock data until backend implements surcharge API

#### 9. Payment Management (`use-payments.ts`)
- **Status:** ❌ No dedicated API available
- **Current:** Uses `getRecentInvoices()` from `@/lib/mock-payments`
- **Missing Endpoints:** No `/employee/payments` or `/employee/invoices` endpoints
- **Note:** Transactions are created via `/employee/bookings/{bookingId}/transactions` but no dedicated payment management endpoints exist
- **Action:** Keep mock data until backend implements payment/invoice API

#### 10. Check-in/Check-out (`use-checkin.ts`, `use-checkout.ts`)
- **Status:** ❌ Complex - needs detailed analysis
- **Current:** Uses `searchReservations()` from `@/lib/mock-checkin-checkout`
- **Possible API Endpoints:**
  - `GET /customer/bookings` - Get customer bookings
  - `GET /employee/bookings/{bookingId}` - Get booking details
  - `PATCH /employee/bookings/{bookingId}/check-in` - Check-in
  - `POST /employee/bookings/{bookingId}/transactions` - Create transaction (for checkout)
- **Complexity:** Booking structure may differ from current Reservation model
- **Action:** Requires detailed analysis and comparison of Booking API vs Reservation types

#### 11. Invoice Printing (`use-invoice-print.ts`)
- **Status:** ❌ No dedicated API
- **Current:** Uses `getCheckoutSummary()` from `@/lib/mock-checkin-checkout`
- **Missing Endpoints:** No invoice generation endpoints
- **Action:** Keep mock data until backend implements invoice API

---

## API Client Architecture

### Type Definitions (`lib/types/api.ts`)
Complete TypeScript definitions generated from swagger.yml:

- **Auth Types:** `EmployeeAuthResponse`, `AuthTokens`, `LoginRequest`, `ChangePasswordRequest`
- **Employee Types:** `Employee`, `CreateEmployeeRequest`, `UpdateEmployeeRequest`
- **Customer Types:** `Customer`, `CreateCustomerRequest`, `UpdateCustomerRequest`
- **Room Types:** `Room`, `RoomType`, `CreateRoomRequest`, `UpdateRoomRequest`
- **Service Types:** `Service`, `CreateServiceRequest`, `UpdateServiceRequest`
- **Booking Types:** `CheckInRequest`, `CreateTransactionRequest`
- **Response Wrappers:** `ApiResponse<T>`, `PaginatedResponse<T>`
- **Query Parameters:** `GetCustomersParams`, `GetEmployeesParams`, `GetRoomsParams`, etc.

### Service Modules (`lib/services/`)

All service modules follow a consistent pattern:

1. **Import API client:** `import { api } from "./api";`
2. **Import types:** `import type { ... } from "@/lib/types/api";`
3. **Export service object** with methods matching API endpoints
4. **Response unwrapping:** All methods unwrap `response.data` before returning
5. **Bearer auth:** All methods use `requiresAuth: true` for automatic JWT token inclusion

**Available Services:**
- `authService` - `lib/services/auth.service.ts`
- `customerService` - `lib/services/customer.service.ts`
- `employeeService` - `lib/services/employee.service.ts`
- `roomService` - `lib/services/room.service.ts` (includes room types)
- `serviceManagementService` - `lib/services/service.service.ts`
- `bookingService` - `lib/services/booking.service.ts`

**Central Export:** All services exported from `lib/services/index.ts`

### API Client (`lib/services/api.ts`)

**Features:**
- Custom fetch wrapper with bearer token authentication
- Automatic token injection from localStorage
- Request/response interceptors
- Error handling with `ApiError` class
- HTTP method shortcuts: `get()`, `post()`, `put()`, `patch()`, `delete()`
- TypeScript generic support for type-safe responses

**Base URL:** `process.env.NEXT_PUBLIC_API_URL` or `http://localhost:3000/v1`

**Error Handling:**
```typescript
try {
  const result = await customerService.getCustomers({ page: 1, limit: 10 });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.statusCode}: ${error.message}`);
  }
}
```

---

## Migration Patterns

### Standard Migration Pattern

1. **Import service and types:**
```typescript
import { customerService } from "@/lib/services";
import type { Customer } from "@/lib/types/api";
import { ApiError } from "@/lib/services/api";
```

2. **Add error state:**
```typescript
const [error, setError] = useState<string | null>(null);
```

3. **Create mapper functions** (if local types differ from API types):
```typescript
function mapApiToLocal(apiData: ApiType): LocalType {
  return {
    // Map fields
  };
}
```

4. **Update data fetching:**
```typescript
const loadData = async () => {
  try {
    setLoading(true);
    const result = await service.getData({ page: 1, limit: 100 });
    setData(result.data.map(mapApiToLocal));
    setError(null);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Error loading data";
    setError(message);
  } finally {
    setLoading(false);
  }
};
```

5. **Update CRUD operations:**
```typescript
const createItem = async (data: FormData) => {
  try {
    const created = await service.create(data);
    setItems(prev => [...prev, mapApiToLocal(created)]);
    return created;
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Error creating item";
    setError(message);
    throw err;
  }
};
```

6. **Return error in hook:**
```typescript
return {
  data,
  loading,
  error, // Add this
  // ... other methods
};
```

---

## Testing

### Test File: `lib/__tests__/api.test.ts`

Comprehensive integration tests covering:
- Authentication (login, logout, refresh tokens)
- Customer CRUD operations
- Room CRUD operations
- Error handling scenarios

**Status:** ⚠️ Tests written but have compilation errors (vitest module not found)

**To Fix:**
```bash
pnpm add -D vitest
```

Then fix 'any' types in tests by using `unknown` or specific types.

---

## Known Issues & Limitations

### 1. Type Mismatches
- **Amenities:** Local `RoomType.amenities: string[]` vs API `RoomType.amenities: Record<string, unknown>`
  - **Solution:** Implemented conversion functions in `use-room-types.ts`

### 2. Missing API Features
- **Service Categories:** Not supported by API - kept as mock data
- **Penalties:** No API endpoints
- **Surcharges:** No API endpoints
- **Invoices:** No dedicated invoice endpoints
- **Payment Management:** No dedicated payment endpoints

### 3. Authentication
- **Breaking Change:** Email login → Username login
- Affects all authentication flows
- Must update any hardcoded email references

### 4. Test Compilation Errors
- vitest module not installed
- 'any' types used in test mocks (needs `unknown` or proper types)
- booking.service.ts has 'any' return types (needs specific Booking types)

---

## Environment Variables

Ensure `.env.local` contains:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
```

Tokens are stored in:
- `localStorage.getItem('accessToken')` - JWT access token
- `localStorage.getItem('refreshToken')` - JWT refresh token
- Cookies are also used for token storage

---

## Documentation

- **Integration Guide:** `docs/API_INTEGRATION.md`
- **Quick Reference:** `docs/API_QUICK_REFERENCE.md`
- **PR Description:** `PR_DESCRIPTION.md` (root)
- **Migration Status:** `docs/API_MIGRATION_STATUS.md` (this file)

---

## Next Steps

### Immediate (Priority: High)

1. ✅ **Complete Core Entity Migrations** - DONE
   - ✅ Customers
   - ✅ Employees
   - ✅ Room Types
   - ✅ Services

2. 🔄 **Update Dashboard Hook**
   - Replace `getCurrentUser()` with `authService.getCurrentUser()`
   - Replace `mockLogout()` with `authService.logout()`

3. ⚠️ **Fix Test Compilation Errors**
   - Install vitest: `pnpm add -D vitest`
   - Replace 'any' types with proper types
   - Fix booking.service.ts return types

### Medium Priority

4. **Analyze Booking/Reservation Migration**
   - Compare Booking API structure with local Reservation type
   - Determine if direct migration is feasible
   - Consider creating adapter layer if structures differ significantly

5. **Update Components Using Migrated Hooks**
   - Verify all components handle new error states
   - Test pagination in UI
   - Verify Vietnamese error messages display correctly

### Future (Depends on Backend)

6. **Backend API Expansion Required:**
   - Penalty management endpoints
   - Surcharge management endpoints
   - Invoice generation endpoints
   - Payment management endpoints
   - Report generation endpoints

---

## Success Metrics

- ✅ **4/4 core entities migrated** (Customers, Employees, Room Types, Services)
- ✅ **Authentication updated** to match swagger.yml (username-based)
- ✅ **Type safety maintained** with complete TypeScript definitions
- ✅ **Error handling implemented** with ApiError for all migrated hooks
- ✅ **Documentation created** (integration guide, quick reference, migration status)
- ⚠️ **Tests written** but need dependency installation (vitest)

---

## Contributors

Migration performed by AI assistant following project guidelines:
- Design system adherence (color palette, typography, spacing)
- Vietnamese UI language
- TypeScript strict mode
- Next.js 14+ App Router conventions
- React 19 hooks pattern

---

**Last Updated:** ${new Date().toLocaleDateString('vi-VN')}
