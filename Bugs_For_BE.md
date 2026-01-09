
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
