# Backend Issues Found During Frontend Analysis

**Date:** January 11, 2026  
**Analysis Source:** Complete codebase review of roommaster-be and hotel-management-system-fe  
**Scope:** Update Reservation (`PUT /employee/bookings/{id}`) API

---

## 🔴 Issue #1: Validation Schema Allows Non-Implementable Fields

**Severity:** 🔴 CRITICAL  
**Location:** `src/validations/booking.validation.ts` (lines 96-108)

### Problem

```typescript
const updateBooking = {
  params: { id: Joi.string().required() },
  body: Joi.object().keys({
    checkInDate: Joi.date().iso(),
    checkOutDate: Joi.date().iso().greater(Joi.ref('checkInDate')),
    totalGuests: Joi.number().integer().min(1),
    status: Joi.string().valid(BookingStatus),          // ❌ ALLOWED BUT NOT IMPLEMENTED
    rooms: Joi.array().items(                           // ❌ ALLOWED BUT NOT IMPLEMENTED
      Joi.object().keys({ roomId: Joi.string().required() })
    )
  })
};
```

### Analysis

The validation schema allows `status` and `rooms` fields, but the service method does NOT implement them:

**Service Implementation** (`src/services/booking.service.ts:746`):
```typescript
async updateBooking(id: string, updateBody: any) {
  // ...validation checks...
  
  // ONLY updates these fields:
  const updatedBooking = await this.prisma.booking.update({
    where: { id },
    data: updateBody,  // This just passes through - doesn't handle rooms
    include: { bookingRooms: true }
  });
  
  // No room update logic here!
  // No status transition logic here!
}
```

### Impact

- ✅ Validation passes for requests with `status` and `rooms`
- ❌ Backend silently ignores these fields
- ⚠️ Frontend developers may assume fields work (schema says they should)
- ⚠️ Leads to confusion and bugs on Frontend side

### Expected Fix

**Option A: Restrict Validation (Recommended)**
Remove `status` and `rooms` from validation schema:
```typescript
const updateBooking = {
  params: { id: Joi.string().required() },
  body: Joi.object().keys({
    checkInDate: Joi.date().iso(),
    checkOutDate: Joi.date().iso().greater(Joi.ref('checkInDate')),
    totalGuests: Joi.number().integer().min(1)
    // status: REMOVED - managed by system (transactions, check-in/out)
    // rooms: REMOVED - immutable after booking creation
  })
};
```

**Option B: Implement in Service (Complex)**
- Add room change logic to `updateBooking()`
- Add status transition logic to `updateBooking()`
- Validate new rooms for availability
- This is RISKY and may break existing business logic

### Recommendation

✅ **Use Option A** - Restrict validation schema  
Rationale: Status and rooms are managed by other operations (transactions, check-in/out), not by the update API. The API should be focused on what it actually does: update dates and guest count.

---

## 🔴 Issue #2: No Explicit Note on Room Immutability in API Contract

**Severity:** 🔴 CRITICAL  
**Location:** `src/routes/v1/employee/booking.route.ts` (lines 298-352)

### Problem

The API documentation for `PUT /employee/bookings/:id` does NOT explicitly state that rooms are immutable:

```typescript
/**
 *     summary: Update booking
 *     description: Update booking details
 *     ...no mention of room immutability...
 */
```

### Analysis

Frontend developers reading the API docs won't know:
- Rooms CANNOT be changed
- Only dates and guest count can be changed
- Sending `rooms` field will be silently ignored

### Impact

- Frontend developers must read backend SOURCE CODE to understand constraints
- Easy to make wrong assumptions
- Leads to implementation bugs
- No protection against future regressions

### Expected Fix

Add explicit documentation to the route:

```typescript
/**
 *     summary: Update booking
 *     description: |
 *       Update booking details (dates and guest count only).
 *       
 *       CONSTRAINTS:
 *       - Rooms are IMMUTABLE after booking creation (cannot be changed)
 *       - Status is managed by system (not directly editable)
 *       - Can only update bookings in PENDING, CONFIRMED, CHECKED_IN, PARTIALLY_CHECKED_OUT status
 *       - Cannot update CANCELLED or CHECKED_OUT bookings
 *       
 *       Supported Fields: checkInDate, checkOutDate, totalGuests
 *       Unsupported (will be ignored): status, rooms
 */
```

---

## 🟡 Issue #3: depositRequired Not Consistently Returned in API Responses

**Severity:** 🟡 IMPORTANT  
**Location:** Multiple files in `src/services/booking.service.ts`

### Problem

The `createBooking()` endpoint returns `depositRequired` in response:

```typescript
// Backend returns:
{
  bookingId: string,
  bookingCode: string,
  totalAmount: Decimal,
  depositRequired: Decimal,  // ✅ Present here
  expiresAt: Date
}
```

But this is calculated dynamically from AppSettings, not stored in database:
```typescript
// At line ~600 (pseudo-code)
depositRequired = totalAmount * (appSettings.depositPercentage / 100)
```

### Analysis

Frontend assumes 30% deposit without verifying backend's actual requirement:
```typescript
// Frontend (hotel-management-system-fe/hooks/use-reservations.ts:567)
depositAmount: response.totalAmount ? parseFloat(response.totalAmount) * 0.3 : ...
```

If Backend changes `depositPercentage` in AppSettings, Frontend shows wrong amount!

### Impact

- ✅ Currently works because default is 30%
- ⚠️ Fragile: breaks if AppSettings changes
- ❌ Frontend doesn't validate against actual `depositRequired`
- ⚠️ Could cause billing inconsistencies

### Expected Fix

**Ensure consistent response structure:**
```typescript
// All booking responses should include:
{
  id: string,
  bookingCode: string,
  status: BookingStatus,
  checkInDate: Date,
  checkOutDate: Date,
  totalGuests: number,
  totalAmount: Decimal,
  depositRequired: Decimal,  // ALWAYS include this
  bookingRooms: BookingRoom[]
}
```

**Frontend should use:**
```typescript
depositAmount: response.depositRequired ?? (response.totalAmount * 0.3)
```

---

## Summary of Backend Issues

| Issue | Severity | Type | Fix Effort |
|-------|----------|------|-----------|
| #1: Validation allows unsupported fields | 🔴 Critical | Design | Low (1 hour) |
| #2: No API contract documentation | 🔴 Critical | Documentation | Low (30 min) |
| #3: depositRequired not always returned | 🟡 Important | API consistency | Low-Medium (1-2 hours) |

---

## Recommended Priority

**Phase 1 (Immediate):**
1. Remove `status` and `rooms` from updateBooking validation schema
2. Add explicit constraints to API documentation

**Phase 2 (High Priority):**
3. Ensure all booking responses include `depositRequired`
4. Add integration tests for these constraints

---

## Testing Recommendations

### Backend Tests to Add

```typescript
describe('PUT /employee/bookings/:id', () => {
  
  // Test #1: Validate schema rejects extra fields gracefully
  it('should reject invalid status values', async () => {
    const response = await api.put(`/bookings/123`, {
      status: 'INVALID_STATUS'
    });
    expect(response.status).toBe(400); // Bad Request
  });

  // Test #2: Validate rooms changes are rejected or at least documented
  it('should ignore rooms field and not change booking rooms', async () => {
    const originalRooms = booking.bookingRooms;
    
    const response = await api.put(`/bookings/123`, {
      rooms: [{ roomId: 'completely-different' }]
    });
    
    const updated = await db.booking.findUnique({ id: 123, include: { bookingRooms: true } });
    expect(updated.bookingRooms).toEqual(originalRooms); // Unchanged
  });

  // Test #3: Validate depositRequired is always present
  it('should always include depositRequired in response', async () => {
    const response = await api.put(`/bookings/123`, {
      checkInDate: new Date()
    });
    
    expect(response.data).toHaveProperty('depositRequired');
    expect(typeof response.data.depositRequired).toBe('number');
  });
});
```

---

## Alignment Status After Frontend Fixes

- ✅ Frontend no longer tries to change rooms
- ✅ Frontend no longer tries to change status via update API
- ✅ Frontend properly validates deposit confirmations
- ⚠️ Backend still allows these fields in validation (confusing but not breaking)
- ⚠️ Backend still doesn't explicitly document constraints

**Recommended:** Implement all 3 Backend fixes to prevent future confusion and bugs.

---

## Related Files

- Backend Update Service: `src/services/booking.service.ts:746`
- Backend Validation: `src/validations/booking.validation.ts:96`
- Backend Route: `src/routes/v1/employee/booking.route.ts:298`
- Frontend Implementation: `hotel-management-system-fe/hooks/use-reservations.ts:696`
- Frontend Analysis: `hotel-management-system-fe/MIGRATION_ANALYSIS_UPDATE_RESERVATION.md`

---

**Note:** These are NOT showstoppers for current Frontend functionality. Frontend is now correctly aligned with Backend behavior after the fixes. But Backend should be cleaned up to prevent confusion and future bugs.
