# 🔌 API Integration: Connect Frontend to Backend via swagger.yml

## Summary

Integrates the Next.js TypeScript frontend with the backend API defined in `swagger.yml`. Provides fully-typed API client with comprehensive service modules, proper error handling, authentication support, and focused tests.

## 🎯 Key Changes

### ✨ New Service Modules (6 files)
- **`lib/services/customer.service.ts`** - Customer CRUD operations
- **`lib/services/employee.service.ts`** - Employee management
- **`lib/services/room.service.ts`** - Room & room type management  
- **`lib/services/service.service.ts`** - Hotel service management
- **`lib/services/booking.service.ts`** - Booking operations
- **`lib/services/index.ts`** - Centralized service exports

### 📦 New Type Definitions
- **`lib/types/api.ts`** - Complete TypeScript types from swagger.yml
  - Generic API wrappers (`ApiResponse<T>`, `PaginatedResponse<T>`)
  - Auth types (login, tokens, password flows)
  - Employee, Customer, Room, Service, Booking types
  - All request/response interfaces

### 🧪 Tests
- **`lib/__tests__/api.test.ts`** - API integration tests
  - Auth flows (login, logout, refresh)
  - CRUD operations  
  - Error handling (401, 404, 400, network)

### 🔧 Modified Files

#### **`lib/services/auth.service.ts`** ⚠️ BREAKING CHANGES
- Changed from `email` to `username` for employee login (matches swagger spec)
- Updated endpoints: `/employee/auth/*` and `/employee/profile/*`
- Added methods: `updateProfile()`, `forgotPassword()`, `resetPassword()`
- Proper response unwrapping (`data` wrapper)

#### **`hooks/use-auth.ts`**
- Updated login signature: `(email, password)` → `(username, password)`
- Updated error messages (Vietnamese)

#### **`app/(auth)/login/page.tsx`**
- Changed form field from email to username
- Updated labels/placeholders to Vietnamese

## 📚 Documentation

- **`docs/API_INTEGRATION.md`** - Complete integration guide with examples
- **`docs/API_QUICK_REFERENCE.md`** - Developer quick reference

## 🚀 Usage Examples

### Authentication
```typescript
import { authService } from '@/lib/services';

// Login with username (not email!)
const { employee, tokens } = await authService.login(username, password);
```

### CRUD Operations
```typescript
import { customerService } from '@/lib/services';

// Get paginated customers
const result = await customerService.getCustomers({
  search: "Nguyễn",
  page: 1,
  limit: 10
});

// Create customer
const customer = await customerService.createCustomer({
  fullName: "Nguyễn Văn A",
  phone: "0901234567",
  password: "password123"
});
```

### Error Handling
```typescript
try {
  await customerService.getCustomerById(id);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.statusCode === 401) {
      // Redirect to login
    } else if (error.statusCode === 404) {
      // Show not found message
    }
  }
}
```

## ⚠️ Breaking Changes

### Authentication System Changed
**Before:** Email-based login  
**After:** Username-based login

**Migration Required:**
1. Update login forms to use username field
2. Update test data
3. Clear localStorage on deployment

## 🔍 Technical Details

### Alignment with swagger.yml
✅ All endpoints match swagger paths exactly  
✅ Correct HTTP methods (GET, POST, PATCH, PUT, DELETE)  
✅ All required/optional parameters handled  
✅ Pagination & filtering support  
✅ Proper error response structure  

### Response Structure
```typescript
// Success
{ data: { /* actual data */ } }

// Paginated
{ 
  data: {
    data: [...],
    total: 50,
    page: 1,
    limit: 10
  }
}

// Error
{
  code: 400,
  message: "Error message",
  errors: [{ field: "...", message: "..." }]
}
```

## 📋 Files Changed

### New Files (9)
```
lib/types/api.ts
lib/services/customer.service.ts
lib/services/employee.service.ts
lib/services/room.service.ts
lib/services/service.service.ts
lib/services/booking.service.ts
lib/services/index.ts
lib/__tests__/api.test.ts
docs/API_INTEGRATION.md
docs/API_QUICK_REFERENCE.md
```

### Modified Files (3)
```
lib/services/auth.service.ts       (major refactor)
hooks/use-auth.ts                  (breaking change)
app/(auth)/login/page.tsx          (UI update)
```

## 🧪 Testing

```bash
npm test lib/__tests__/api.test.ts
```

Tests cover:
- ✅ Employee login/logout
- ✅ Token refresh
- ✅ Customer CRUD
- ✅ Room operations
- ✅ Error scenarios

## ⚙️ Configuration

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
```

## 📖 Next Steps

1. Migrate remaining hooks from mock data to real API:
   - `use-reservations.ts`
   - `use-services.ts`
   - `use-payments.ts`
   - `use-reports.ts`

2. Add optimistic updates with React 19's `useOptimistic`

3. Consider adding React Query or SWR for caching

4. Implement retry logic for transient failures

## ✅ Review Checklist

- [x] All types match swagger.yml exactly
- [x] Service methods handle all status codes
- [x] Tests pass and cover critical flows
- [x] Login works with username (not email)
- [x] Error messages in Vietnamese
- [x] No security issues (tokens not logged)
- [x] API base URL configurable via env
- [x] TypeScript strict mode compliant
- [x] Follows project conventions

## 🎉 Benefits

1. **Type Safety** - All API calls fully typed
2. **Single Source of Truth** - swagger.yml drives everything
3. **Maintainability** - Clear service separation
4. **Testability** - Comprehensive test coverage
5. **Developer Experience** - Autocomplete for all APIs
6. **Error Handling** - Consistent patterns
7. **Standards Compliance** - REST best practices

---

**Ready for Review** ✅

This provides a solid foundation for all future API integrations. Use these service modules instead of mock data going forward.
