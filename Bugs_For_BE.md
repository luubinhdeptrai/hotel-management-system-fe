# Bugs For Backend (roommaster-be)

## Issue 1: Employee Service - Invalid `createdAt` field in orderBy

**Severity:** HIGH (API Error 500)

**Location:** `src/services/employee.service.ts` - Line 77

**Error:**
```
Invalid `this.prisma.employee.findMany()` invocation
Unknown arg `createdAt` in orderBy.createdAt for type EmployeeOrderByWithRelationInput
```

**Root Cause:**
The `getAllEmployees()` method defaults to sorting by `createdAt` field, but the Employee model in Prisma schema only has `updatedAt` field, not `createdAt`.

**Current Code:**
```typescript
const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
```

**Fix:**
Change `createdAt` to `updatedAt`:
```typescript
const { page = 1, limit = 10, sortBy = 'updatedAt', sortOrder = 'desc' } = options;
```

**Frontend Impact:**
Staff management page (`/staff`) returns 500 error and doesn't load employee list.

**Date Found:** 2025-01-08

---

## Issue 2: Booking Service - No Activity Logging on Booking Creation

**Severity:** HIGH (Feature Not Working)

**Location:** `src/services/booking.service.ts` - `createBooking()` method (Lines 47-241)

**Problem:**
When a booking is created, NO activity log is generated. The `createBooking()` method completes the entire booking creation process with database transaction but never calls `this.activityService.createActivity()`.

**Current Code:**
```typescript
async createBooking(input: CreateBookingPayload) {
  // ... room allocation logic ...
  
  // Create booking with transaction
  const booking = await this.prisma.$transaction(async (tx) => {
    const newBooking = await tx.booking.create({
      // ... booking creation ...
    });
    
    // Update room statuses to RESERVED
    await tx.room.updateMany({
      // ... room status update ...
    });
    
    return newBooking;
  });
  // NO ACTIVITY LOGGING HERE!
  return { ... };
}
```

**What Should Happen:**
After creating the booking, a `CREATE_BOOKING` activity should be logged:
```typescript
await this.activityService.createActivity({
  type: ActivityType.CREATE_BOOKING,
  description: `Booking created: ${booking.bookingCode}`,
  bookingId: booking.id,
  customerId: booking.primaryCustomerId,
  metadata: {
    bookingCode: booking.bookingCode,
    totalAmount: booking.totalAmount,
    totalGuests: booking.totalGuests
  }
});
```

**Frontend Impact:**
Activities page (`/hoạt-động`) doesn't show newly created bookings in the activity feed.

**Additional Context:**
- The `ActivityService.createActivity()` method exists and is properly implemented
- Check-in and check-out activities ARE being logged correctly via `this.activityService.createCheckInActivity()` and `createCheckOutActivity()`
- Service usage, transactions, and customer creation activities ARE logged
- Only booking creation is missing activity logging

**Date Found:** 2025-01-08

---

## Issue 3: Activity Service - Invalid `createdAt` field in orderBy (Similar to Issue 1)

**Severity:** HIGH (API Error 500)

**Location:** `src/services/activity.service.ts` - `getAllActivities()` method - Line 270

**Error:**
Same as Issue 1 but for Activity model:
```
Unknown arg `createdAt` in orderBy.createdAt for type ActivityOrderByWithRelationInput
```

**Current Code:**
```typescript
const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
```

**Root Cause:**
The Activity model DOES have `createdAt` field, so this sorting should work. However, there's also `updatedAt` field. The default is fine here, BUT the issue is in the FE's `use-activities.ts` hook which sends `sortBy: 'createdAt'` by default and the backend is using it.

**Workaround Status:**
Frontend already has workaround in place to map `createdAt` → `updatedAt` in employee service, but NOT for activities.

**Fix Needed:**
Either:
1. **Backend:** Ensure Activity model supports `createdAt` in orderBy (it should - check schema), OR
2. **Frontend:** Add similar workaround in activity service to map `createdAt` → `updatedAt` if needed

**Date Found:** 2025-01-08

---

## Issue 4: App Settings - Missing Deposit Percentage API Endpoints

**Severity:** MEDIUM (Feature Not Implemented)

**Location:** `src/controllers/employee/employee.app-setting.controller.ts` & `src/routes/v1/employee/app-setting.route.ts`

**Problem:**
The deposit percentage GET and PUT endpoints are NOT exposed in the Employee App Settings controller and routes, even though the service methods `getDepositPercentage()` and `updateDepositPercentage()` exist in `AppSettingService`.

**Current State:**
- ✅ Service has: `getDepositPercentage()` and `updateDepositPercentage()`
- ✅ Service properly validates percentage (0-100)
- ❌ Controller missing: `getDepositPercentage` and `updateDepositPercentage` handlers
- ❌ Routes missing: `/employee/app-settings/deposit-percentage` GET and PUT endpoints

**What Should Be Added:**

**Controller (`employee.app-setting.controller.ts`):**
```typescript
/**
 * Get deposit percentage configuration
 */
getDepositPercentage = catchAsync(async (req: Request, res: Response) => {
  const percentage = await this.appSettingService.getDepositPercentage();
  
  res.status(httpStatus.OK).json({
    success: true,
    data: { percentage }
  });
});

/**
 * Update deposit percentage configuration
 */
updateDepositPercentage = catchAsync(async (req: Request, res: Response) => {
  const { percentage } = req.body;
  
  await this.appSettingService.updateDepositPercentage(percentage);
  const updated = await this.appSettingService.getDepositPercentage();
  
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Deposit percentage updated successfully',
    data: { percentage: updated }
  });
});
```

**Routes (`app-setting.route.ts`):**
```typescript
router
  .route('/deposit-percentage')
  .get(authEmployee, employeeAppSettingController.getDepositPercentage)
  .put(
    authEmployee,
    validate(appSettingValidation.updateDepositPercentage), // Need validation
    employeeAppSettingController.updateDepositPercentage
  );
```

**Validation needed (`app-setting.validation.ts`):**
```typescript
updateDepositPercentage: {
  body: Joi.object({
    percentage: Joi.number().min(0).max(100).required()
  })
}
```

**Frontend Impact:**
- App Settings page (`/app-settings`) will show "Đang tải..." for deposit percentage section indefinitely
- Cannot update deposit percentage from frontend
- Frontend already has workaround to handle gracefully (no errors, just disabled functionality)

**Date Found:** 2025-01-08

---
