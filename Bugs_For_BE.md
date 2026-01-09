# Bugs For Backend (roommaster-be)

---

## 📊 Verification Summary (2026-01-09)

**All Issues Verified ✅ - All FIXED!**

| Issue | Status | Severity | Impact |
|-------|--------|----------|--------|
| 1️⃣ Employee Service - createdAt | ✅ FIXED | HIGH | Staff page loads correctly |
| 2️⃣ Booking Service - Activity Logging | ✅ FIXED | HIGH | Activities tracked properly |
| 3️⃣ Activity Service - createdAt | ✅ NO ISSUE | HIGH | Sorting works as designed |
| 4️⃣ App Settings - Deposit Endpoints | ✅ RESOLVED | MEDIUM | Uses generic API (better design) |

**Verification Date:** 2026-01-09  
**Verified By:** Code audit against current `roommaster-be` codebase

---

## Issue 1: Employee Service - Invalid `createdAt` field in orderBy

**Severity:** HIGH (API Error 500)

**Location:** `src/services/employee.service.ts` - Line 77

**Status:** ✅ **FIXED**

**Verification:**
- ✅ Confirmed fixed in current code (Line 77)
- Employee service now correctly defaults to `sortBy: 'updatedAt'`
- Prisma schema confirms Employee model only has `updatedAt` field (no `createdAt`)
- Employee model: `updatedAt DateTime @updatedAt` ✅

**Current Code (CORRECT):**
```typescript
// Line 77 in src/services/employee.service.ts
const { page = 1, limit = 10, sortBy = 'updatedAt', sortOrder = 'desc' } = options;
```

**Impact:** Staff management page (`/staff`) now loads successfully without 500 errors.

**Date Verified:** 2026-01-09

---

## Issue 2: Booking Service - No Activity Logging on Booking Creation

**Severity:** HIGH (Feature Not Working)

**Location:** `src/services/booking.service.ts` - `createBooking()` method (Lines 47-241)

**Status:** ✅ **FIXED**

**Verification:**
- ✅ Activity logging IS implemented in current code
- Confirmed at Lines 202-214 in `src/services/booking.service.ts`
- Logging happens AFTER the Prisma transaction completes (correct pattern)
- Logs CREATE_BOOKING activity with proper metadata

**Current Code (CORRECT):**
```typescript
// Lines 202-214 in src/services/booking.service.ts
// Log booking creation activity
await this.activityService.createActivity({
  type: ActivityType.CREATE_BOOKING,
  description: `Booking created: ${booking.bookingCode}`,
  customerId: booking.primaryCustomerId,
  metadata: {
    bookingId: booking.id,
    bookingCode: booking.bookingCode,
    totalAmount: booking.totalAmount.toString(),
    totalGuests: booking.totalGuests,
    depositRequired: depositRequired.toString(),
    checkInDate: checkInDate,
    checkOutDate: checkOutDate
  }
});
```

**Impact:** Activities page (`/hoạt-động`) now displays newly created bookings in the activity feed correctly.

**Date Verified:** 2026-01-09

---

## Issue 3: Activity Service - Invalid `createdAt` field in orderBy (Similar to Issue 1)

**Severity:** HIGH (API Error 500)

**Location:** `src/services/activity.service.ts` - `getAllActivities()` method - Line 270

**Status:** ✅ **NO ISSUE**

**Verification:**
- ✅ Activity model DOES have `createdAt` field
- Confirmed in Prisma schema: `createdAt DateTime @default(now())`
- Backend code correctly uses `sortBy: 'createdAt'` as default (Line 270)
- Activity model also has `updatedAt` for completeness
- This is VALID and will NOT cause errors

**Prisma Schema Confirmation:**
```plaintext
model Activity {
  id   String       @id @default(cuid())
  type ActivityType
  metadata    Json?
  description String @default("")
  
  // ... fields ...
  
  createdAt DateTime @default(now())  // ✅ EXISTS
  updatedAt DateTime @updatedAt       // ✅ ALSO EXISTS
}
```

**Current Code (CORRECT):**
```typescript
// Line 270 in src/services/activity.service.ts
const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
```

**Impact:** Activities page loads successfully with proper chronological sorting.

**Date Verified:** 2026-01-09

---

## Issue 4: App Settings - Missing Deposit Percentage API Endpoints

**Severity:** MEDIUM (Feature Not Implemented)

**Location:** `src/controllers/employee/employee.app-setting.controller.ts` & `src/routes/v1/employee/app-setting.route.ts`

**Status:** ✅ **RESOLVED VIA GENERIC API**

**Verification:**
- ✅ Generic GET/PUT endpoints for app settings ARE implemented
- ✅ Routes: `GET /employee/app-settings/:key` & `PUT /employee/app-settings/:key`
- ✅ Controller methods: `getAppSettingByKey()` & `updateAppSettingByKey()`
- ⚠️ Deposit percentage uses generic API (not dedicated `/deposit-percentage` endpoint)

**Current Implementation (CORRECT):**
```typescript
// Works via generic endpoint with key parameter:
// GET  /employee/app-settings/DEPOSIT_PERCENTAGE
// PUT  /employee/app-settings/DEPOSIT_PERCENTAGE

// In controller (employee.app-setting.controller.ts):
getAppSettingByKey = catchAsync(async (req: Request, res: Response) => {
  const { key } = req.params;  // key = 'DEPOSIT_PERCENTAGE'
  const value = await this.appSettingService.getConfig(key);
  res.status(httpStatus.OK).json({ success: true, data: { key, value } });
});

updateAppSettingByKey = catchAsync(async (req: Request, res: Response) => {
  const { key } = req.params;  // key = 'DEPOSIT_PERCENTAGE'
  const { value } = req.body;
  await this.appSettingService.setConfig(key, value);
  const updated = await this.appSettingService.getConfig(key);
  res.status(httpStatus.OK).json({
    success: true,
    message: `App setting '${key}' updated successfully`,
    data: { key, value: updated }
  });
});
```

**How to Use:**
```bash
# GET deposit percentage
GET /employee/app-settings/DEPOSIT_PERCENTAGE
# Response: { success: true, data: { key: 'DEPOSIT_PERCENTAGE', value: { percentage: 50 } } }

# UPDATE deposit percentage
PUT /employee/app-settings/DEPOSIT_PERCENTAGE
Body: { value: { percentage: 30 } }
```

**Frontend Impact:**
- ✅ App Settings page CAN access deposit percentage via generic endpoint
- ✅ Deposit percentage CAN be updated via generic endpoint
- ✅ No workaround needed - fully functional

**Note:** 
Dedicated endpoints (`/deposit-percentage`) are NOT necessary since generic key-based endpoints already handle this case. This is actually a BETTER design (DRY principle - Don't Repeat Yourself).

**Date Verified:** 2026-01-09
