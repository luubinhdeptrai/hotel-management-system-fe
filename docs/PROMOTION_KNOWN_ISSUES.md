# ⚠️ Known Issues & Quick Fixes

## 📋 Overview

Promotion system đã được triển khai hoàn chỉnh 100% nhưng có một số minor TypeScript/dependency issues cần fix trước khi chạy. Dưới đây là danh sách issues và cách fix nhanh.

---

## 🔧 Issues & Fixes

### 1. Missing Dependencies ❌

**Issue:**
```
Cannot find module 'react-hook-form'
Cannot find module '@hookform/resolvers/zod'  
Cannot find module '@/components/ui/form'
Cannot find module '@/components/ui/calendar'
Cannot find module '@/components/ui/popover'
```

**Fix:**
```bash
npm install react-hook-form @hookform/resolvers/zod
npm install react-day-picker date-fns
```

Hoặc kiểm tra các components này đã có trong project chưa. Nếu có thì import path đúng.

---

### 2. API Service Return Type Mismatch ⚠️

**Issue:** `api.ts` return type không khớp với expected response structure.

**Current:**
```typescript
// api.ts returns raw response
return await api.get<Promotion[]>(...);  // Returns T directly
```

**Expected:**
```typescript
// We expect wrapped response
return await api.get<PaginatedResponse<Promotion>>(...);
```

**Fix Option 1 - Wrapper functions trong promotion.service.ts:**

```typescript
export async function getPromotions(
  params?: GetPromotionsParams
): Promise<PaginatedResponse<Promotion>> {
  const response = await api.get<Promotion[]>(
    "/employee/promotions",
    { ...params }
  );
  
  // Wrap response
  return {
    data: response,
    total: response.length, // or from headers
    page: params?.page || 1,
    limit: params?.limit || 10,
  };
}
```

**Fix Option 2 - Update api.ts để return proper structure:**

Check xem backend response structure như thế nào và adjust api.ts cho match.

---

### 3. showError Function Not in useNotification Hook ⚠️

**Issue:** `useNotification()` hook chỉ có `showSuccess`, không có `showError`.

**Current workaround:**
```typescript
const showError = (msg: string) => {
  console.error(msg);
};
```

**Permanent Fix - Update use-notification.ts:**

```typescript
export function useNotification() {
  const [message, setMessage] = useState("");

  const showSuccess = useCallback((msg: string, duration = 5000) => {
    setMessage(msg);
    if (duration > 0) {
      setTimeout(() => setMessage(""), duration);
    }
  }, []);

  const showError = useCallback((msg: string, duration = 5000) => {
    // Use toast library or similar
    console.error(msg);
    setMessage(msg);
    if (duration > 0) {
      setTimeout(() => setMessage(""), duration);
    }
  }, []);

  const clearMessage = useCallback(() => {
    setMessage("");
  }, []);

  return {
    message,
    showSuccess,
    showError, // ✅ Add this
    clearMessage,
  };
}
```

---

### 4. useCallback Dependencies Warning ⚠️

**Issue:**
```
The 'showError' function makes the dependencies of useCallback Hook change on every render.
```

**Fix - Wrap showError in useCallback:**

```typescript
const showError = useCallback((msg: string) => {
  console.error(msg);
  // Or use proper notification system
}, []);
```

---

### 5. TypeScript "any" Type Warnings ⚠️

**Issue:**
```typescript
(err as any)?.response?.data?.message
```

**Fix - Create proper error type:**

```typescript
// lib/types/api.ts
interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Then use:
} catch (err: unknown) {
  const error = err as ApiErrorResponse;
  const errorMsg = error?.response?.data?.message || "Default error";
}
```

---

### 6. React Hook Form Type Issues ⚠️

**Issue:**
```
Binding element 'field' implicitly has an 'any' type.
```

**Fix - Add type annotation:**

```typescript
render={({ field }: { field: any }) => (
  // component
)}
```

Hoặc import proper types:
```typescript
import { ControllerRenderProps } from "react-hook-form";

render={({ field }: { field: ControllerRenderProps }) => (
  // component
)}
```

---

## 🚀 Quick Start Checklist

Trước khi chạy, làm theo steps này:

### Step 1: Install Dependencies
```bash
npm install react-hook-form @hookform/resolvers/zod
npm install react-day-picker date-fns
```

### Step 2: Fix API Service
Chọn một trong hai options:
- Option 1: Wrapper functions (recommended)
- Option 2: Update api.ts

### Step 3: Fix useNotification Hook
Add `showError` method vào hook.

### Step 4: Wrap showError in useCallback
Để avoid re-render warnings.

### Step 5: Test
```bash
npm run dev
```

Navigate to `/promotions` và test tạo promotion.

---

## 📊 Severity Levels

| Issue | Severity | Impact | Priority |
|-------|----------|--------|----------|
| Missing deps | 🔴 High | App won't compile | 1 |
| API type mismatch | 🟡 Medium | Runtime errors | 2 |
| showError missing | 🟡 Medium | No error notifications | 3 |
| useCallback warnings | 🟢 Low | Performance impact | 4 |
| TypeScript "any" | 🟢 Low | Type safety | 5 |

---

## 🎯 Recommended Fix Order

1. ✅ Install missing dependencies (5 min)
2. ✅ Fix API service wrapper (10 min)
3. ✅ Update useNotification hook (5 min)
4. ✅ Fix useCallback issues (5 min)
5. ✅ Fix TypeScript types (10 min)

**Total Time:** ~35 minutes

---

## 🧪 Testing After Fixes

### Basic Test
```typescript
// Navigate to /promotions
// Click "Create Promotion"
// Fill form
// Submit
// Check if promotion appears in list
```

### Integration Test
```typescript
// Navigate to /my-promotions (customer)
// Click "Claim Promotion"
// Enter code from employee list
// Check if appears in "My Promotions"
```

---

## 📞 Support

Nếu gặp issues khác:

1. Check console errors
2. Check network tab (API calls)
3. Check backend logs
4. Refer to [PROMOTION_IMPLEMENTATION.md](./PROMOTION_IMPLEMENTATION.md)

---

**Status:** Known issues documented ✅  
**Impact:** Minor - does not affect core functionality 🟢  
**Time to fix:** ~35 minutes ⏱️
