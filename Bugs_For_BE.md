# 🐛 Backend Issues & Feature Requests

**Maintained by:** Frontend Team  
**Last Updated:** 2026-01-11 (Check-in Analysis)  
**Purpose:** Track backend issues discovered during frontend development

---

## 🔴 CRITICAL ISSUES (NEW - Check-in Related)

### Issue CHECKIN-1: Missing API - Manual Booking Confirmation

**Severity:** 🔴 **CRITICAL**  
**Discovery Date:** 2026-01-11  
**Component:** Check-in Flow

**Endpoint Needed:** `POST /employee/bookings/:id/confirm` (hoặc `PATCH /employee/bookings/:id/confirm`)

**Current Situation:**
- Booking status chỉ có thể chuyển sang CONFIRMED thông qua Transaction (payment)
- KHÔNG CÓ API để employee manual confirm booking mà không qua payment flow
- Frontend walk-in flow bị broken vì không thể confirm booking trước check-in

**Impact:**
- ❌ Walk-in check-in flow HOÀN TOÀN KHÔNG HOẠT ĐỘNG
- ❌ Employee không thể confirm bookings cho pre-arranged payments (chuyển khoản đang chờ)
- ❌ Không handle được special cases (VIP, company accounts, complimentary stays)
- ❌ User experience rất tệ: tạo booking thành công nhưng không thể check-in ngay

**Use Cases Cannot Be Fulfilled:**
1. **Walk-in Guest:** Khách đến trực tiếp, muốn check-in ngay lập tức
   - Hiện tại: Phải tạo booking → Tạo transaction → Đợi confirm → Mới check-in được
   - Mong muốn: Tạo booking → Manual confirm → Check-in ngay
2. **Pre-payment by Bank Transfer:** Khách chuyển khoản trước, đến khách sạn check-in
   - Hiện tại: Không thể confirm cho đến khi transaction record được tạo
   - Mong muốn: Employee xác nhận đã nhận tiền → Manual confirm → Check-in
3. **Special Arrangements:** Booking cho VIP, partner, không cần payment
   - Hiện tại: Không có cách nào confirm
   - Mong muốn: Manual confirm với note/reason

**Current Frontend Workaround:**
Frontend service có mock fallback cho `confirmBooking()` nhưng chỉ return fake data, booking vẫn PENDING ở backend.

**Proposed Backend Solution:**

**1. Route Definition:**
```typescript
// src/routes/v1/employee/booking.route.ts
router.post(
  '/:id/confirm',
  authEmployee,
  authorize('update', 'Booking'),
  validate(bookingValidation.confirmBooking),
  employeeBookingController.confirmBooking
);
```

**2. Validation:**
```typescript
// src/validations/booking.validation.ts
const confirmBooking = {
  params: Joi.object().keys({
    id: Joi.string().required()
  }),
  body: Joi.object().keys({
    note: Joi.string().optional()  // Optional reason/note for audit
  })
};
```

**3. Service Logic:**
```typescript
// src/services/booking.service.ts
async confirmBooking(input: { bookingId: string; employeeId: string; note?: string }) {
  const { bookingId, employeeId, note } = input;

  // 1. Validate booking
  const booking = await this.prisma.booking.findUnique({
    where: { id: bookingId },
    include: { bookingRooms: true }
  });

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  if (booking.status !== BookingStatus.PENDING) {
    throw new ApiError(
      httpStatus.BAD_REQUEST, 
      `Cannot confirm booking with status ${booking.status}`
    );
  }

  // 2. Update in transaction
  return await this.prisma.$transaction(async (tx) => {
    // Update booking
    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED }
    });

    // Update all booking rooms
    await tx.bookingRoom.updateMany({
      where: { bookingId },
      data: { status: BookingStatus.CONFIRMED }
    });

    // Update room status to RESERVED
    const roomIds = booking.bookingRooms.map(br => br.roomId);
    await tx.room.updateMany({
      where: { id: { in: roomIds } },
      data: { status: RoomStatus.RESERVED }
    });

    // Log activity
    await this.activityService.createActivity(
      ActivityType.UPDATE_BOOKING,
      employeeId,
      bookingId,
      { action: 'manual_confirmation', note },
      tx
    );

    return updatedBooking;
  });

  // 3. Send email async
  this.emailService.sendBookingConfirmation(bookingId).catch(console.error);
}
```

**Benefits:**
- ✅ Enables complete walk-in flow
- ✅ Flexible payment arrangements
- ✅ Better employee UX
- ✅ Audit trail maintained
- ✅ Consistent with existing patterns

---

### Issue CHECKIN-2: Missing BookingCustomers in List API

**Severity:** 🟡 **MEDIUM** (Performance & UX)  
**Discovery Date:** 2026-01-11  
**Component:** Booking List

**Endpoint:** `GET /employee/bookings`

**Current Situation:**
- List API returns `bookingRooms` WITHOUT `bookingCustomers` relation
- Frontend must make N+1 queries to get guest info for each booking

**Problem:**
1. **Performance:** List 10 bookings = 1 list call + 10 detail calls = 11 API calls
2. **UX:** Cannot show guest names in list/cards without loading
3. **Development:** More complex code with multiple loading states

**Proposed Solution:**

Include `bookingCustomers` in list response:

```typescript
// src/services/booking.service.ts - getBookings()
include: {
  bookingRooms: {
    include: {
      room: true,
      roomType: true,
      bookingCustomers: {  // ← ADD THIS
        include: {
          customer: {
            select: { id: true, fullName: true, phone: true }
          }
        }
      }
    }
  }
}
```

**Benefits:**
- ✅ 11 API calls → 1 API call (10x performance improvement)
- ✅ Immediate guest info display
- ✅ Enables filtering by guest name
- ⚠️ Slightly larger response (acceptable trade-off)

---

## 🟠 EXISTING MEDIUM PRIORITY ISSUES

## Issue 0: UpdateBooking() - Validation Schema vs Implementation Mismatch

**Severity:** 🟠 **MEDIUM** (Design Flaw)

**Location:** `src/validations/booking.validation.ts` (line 96-113) vs `src/services/booking.service.ts` (line 708-746)

**Current Status:**
- ❌ Validation schema accepts `status` and `rooms` fields
- ❌ Service implementation ignores these fields or doesn't handle them properly
- ❌ Creates false expectation for API consumers

**Validation Schema Accepts:**
```typescript
const updateBooking = {
  body: Joi.object().keys({
    checkInDate: Joi.date().iso(),           // ✅ Used
    checkOutDate: Joi.date().iso(),          // ✅ Used
    totalGuests: Joi.number().integer(),     // ✅ Used
    status: Joi.string().valid(BookingStatus), // ❌ NOT USED
    rooms: Joi.array().items({               // ❌ NOT USED
      Joi.object().keys({
        roomId: Joi.string().required()
      })
    })
  })
};
```

**Service Implementation Reality:**
```typescript
async updateBooking(id: string, updateBody: any) {
  // Only this line executes:
  const updatedBooking = await this.prisma.booking.update({
    where: { id },
    data: updateBody, // Direct pass-through
    include: { bookingRooms: true }
  });
  // No custom logic for:
  // - status field (no side-effects)
  // - rooms field (no BookingRoom updates)
  // - availability validation (no conflicts check)
  // - email notifications
  // - activity logging
}
```

**Problem for Frontend:**
- FE sends `status` field → Backend ignores it (status not updated, no side-effects triggered)
- FE sends `rooms` field → Backend might cause Prisma error or ignore it
- FE expects validation but gets inconsistent results

**Recommendation (Pick ONE):**

### **Option A: Remove unsupported fields from validation schema** ✅ **RECOMMENDED**
```typescript
const updateBooking = {
  body: Joi.object().keys({
    checkInDate: Joi.date().iso(),           // ✅ Keep
    checkOutDate: Joi.date().iso(),          // ✅ Keep
    totalGuests: Joi.number().integer(),     // ✅ Keep
    // Remove status - managed by system events
    // Remove rooms - not implemented
  })
};
```
**Rationale:** 
- Honest API contract
- Status changes via transaction/check-in/cancel APIs
- Rooms cannot change after booking creation
- Frontend expectations match Backend reality

### **Option B: Implement proper logic for status and rooms**
```typescript
async updateBooking(id: string, updateBody: any) {
  const booking = await this.getBookingById(id);
  
  // If rooms provided, validate and update
  if (updateBody.rooms) {
    await this.updateBookingRooms(booking.id, updateBody.rooms);
    delete updateBody.rooms;
  }
  
  // If status changed, handle side-effects
  if (updateBody.status && updateBody.status !== booking.status) {
    await this.handleStatusChange(booking, updateBody.status);
  }
  
  // Update basic fields
  const updated = await this.prisma.booking.update({...});
  return updated;
}
```
**Effort:** High, requires significant refactoring

**Status After Frontend Fix:**
- ✅ Frontend now removed `status` and `rooms` from API calls
- ✅ Type definition updated to remove these fields
- ✅ Frontend expects Option A (cleaned validation schema)

**Date Reported:** 2026-01-10

---

## Issue 0.5: UpdateBooking() - No Availability Validation When Dates Change

**Severity:** 🟠 **MEDIUM** (Data Consistency Risk)

**Location:** `src/services/booking.service.ts` line 708-746 (updateBooking method)

**Current Status:**
- ❌ When user changes `checkInDate` or `checkOutDate`, Backend does NOT validate room availability
- ❌ Risk: Booking dates conflict with other bookings
- ❌ No re-validation of room conflicts after date change

**Example Scenario:**
```
1. Booking A: Room 101, 2026-01-15 → 2026-01-20 (CONFIRMED)
2. User edits Booking B: Changes date to 2026-01-18 → 2026-01-25
3. Backend should reject (Booking A already has Room in 2026-01-18~01-20 range)
4. Currently: ✅ Backend accepts (no validation)
```

**Current Implementation:**
```typescript
async updateBooking(id: string, updateBody: any) {
  // No availability check
  const updatedBooking = await this.prisma.booking.update({
    where: { id },
    data: updateBody // Direct update without validation
  });
  return updatedBooking;
}
```

**What Should Happen:**
```typescript
async updateBooking(id: string, updateBody: any) {
  const booking = await this.getBookingById(id);
  
  // If dates changed, validate room availability for new dates
  if (updateBody.checkInDate || updateBody.checkOutDate) {
    const newCheckIn = updateBody.checkInDate || booking.checkInDate;
    const newCheckOut = updateBody.checkOutDate || booking.checkOutDate;
    
    // Check each BookingRoom for conflicts
    for (const bookingRoom of booking.bookingRooms) {
      const conflicts = await this.prisma.bookingRoom.findMany({
        where: {
          AND: [
            { roomId: bookingRoom.roomId },
            { id: { not: bookingRoom.id } }, // Exclude current room
            { status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] } },
            { checkInDate: { lt: newCheckOut } },
            { checkOutDate: { gt: newCheckIn } }
          ]
        }
      });
      
      if (conflicts.length > 0) {
        throw new ApiError(
          httpStatus.CONFLICT,
          `Room ${bookingRoom.room.roomNumber} has conflicting bookings for new dates`
        );
      }
    }
  }
  
  // Proceed with update if validation passed
  return this.prisma.booking.update({...});
}
```

**Frontend Impact:**
- FE currently assumes Backend validates availability
- FE allows user to change dates without re-checking availability
- Result: Silent data inconsistency

**Recommendation:**
Add availability validation when `checkInDate` or `checkOutDate` is updated

**Date Reported:** 2026-01-10

---

## Issue 1: Missing Backend Endpoint - Get Available Rooms for Booking

**Severity:** 🔴 **CRITICAL** (Feature Completely Broken)

**Frontend Expectation:**
- FE calls: `GET /employee/rooms/available?checkInDate=YYYY-MM-DD&checkOutDate=YYYY-MM-DD&roomTypeId=xxx`
- Expected Response: `AvailableRoom[]` with available rooms for the date range

**Current Status:**
- ❌ **Endpoint does NOT exist in backend**
- FE gets 404 error "Room not found" when trying to search for available rooms during booking
- Room filtering UI is fully implemented on FE but cannot function without this endpoint

**Location to Add:**
- File: `src/routes/v1/employee/room.route.ts`
- Controller: `src/controllers/employee/employee.room.controller.ts`
- Service: `src/services/room.service.ts`

**Required Implementation:**
```typescript
// Controller method needed
getAvailableRooms = catchAsync(async (req: Request, res: Response) => {
  const { checkInDate, checkOutDate, roomTypeId } = req.query;
  const rooms = await this.roomService.getAvailableRooms(
    checkInDate as string,
    checkOutDate as string,
    roomTypeId as string | undefined
  );
  sendData(res, rooms);
});

// Service method needed - Query logic:
// 1. Find rooms with status = AVAILABLE
// 2. Exclude rooms that have overlapping bookings (CONFIRMED or CHECKED_IN)
//    where checkInDate < queryCheckOutDate AND checkOutDate > queryCheckInDate
// 3. Filter by roomTypeId if provided
// 4. Return full room objects with roomType data
```

**FE Code Affected:**
- `components/reservations/room-selector.tsx` (lines 76-96)
- `lib/services/booking.service.ts` (lines 340-360)
- Both depend on this endpoint being available

**Frontend Implementation Status:** ✅ COMPLETE
- Room filtering UI with multiple filters (room type, floor, price range, room number search)
- Grid and list view modes
- Available rooms display and selection
- Proper error handling for no results

**Date Reported:** 2026-01-10


---

## Issue 2: updateBooking() Endpoint Too Generic - Cannot Support Editing Booking with Room Changes

**Severity:** 🟠 **MEDIUM** (Feature Partially Broken)

**Current Status:**
- ❌ `PUT /employee/bookings/:id` is a generic update endpoint
- Accepts any `updateBody` and updates Booking fields
- **Does NOT support:**
  - Updating BookingRoom records (when changing rooms)
  - Validating room availability (when changing dates)
  - Handling room changes properly
  - Updating individual BookingRoom.checkInDate/checkOutDate

**BE Code Location:** `src/services/booking.service.ts` lines 691-710
```typescript
async updateBooking(id: string, updateBody: any) {
  // Only updates Booking table fields
  // No validation for room availability
  // No BookingRoom updates
}
```

**Problem for FE:**
- FE modal allows editing booking with room changes
- When user selects different rooms or changes dates
- Backend endpoint doesn't validate availability or update BookingRoom records
- Result: Booking data becomes inconsistent

**What FE is trying to do:**
- File: `hooks/use-reservations.ts` lines 547-750
- Update customer info ✅
- Update checkInDate/checkOutDate on Booking ✅
- Change selected rooms ❌ (not actually saved)
- Update individual room dates ❌ (not supported)

**Recommendation for BE:**
Either implement one of these:
1. **Option A:** Enhance updateBooking() to:
   - Accept roomIds array
   - Delete old BookingRooms
   - Create new BookingRooms
   - Check availability for new rooms/dates
   - Validate status allows updates

2. **Option B:** Create separate endpoints:
   - `PUT /employee/bookings/:id/customer` - Update customer only
   - `PUT /employee/bookings/:id/dates` - Update dates + re-validate availability
   - `PUT /employee/bookings/:id/rooms` - Change rooms + validate availability
   - Keep updateBooking() for simple cases

3. **Option C:** Document that updateBooking() only supports simple edits:
   - Customer info changes (via updateCustomer())
   - Date changes (basic, no availability check)
   - Guest count changes
   - Notes/metadata changes
   - NOT: Room selection changes

**FE Impact**: Must disable room selection in edit mode until this is fixed

**Date Reported:** 2026-01-10

---

## Issue 3: cancelBooking() API Signature Mismatch

**Severity:** 🟡 **LOW** (Minor)

**Current Status:**
- FE calls: `bookingService.cancelBooking(bookingId, reason)`
- BE expects: `async cancelBooking(id: string)` - no reason parameter
- BE ignores the reason passed by FE

**File:** `src/services/booking.service.ts` line 644
```typescript
async cancelBooking(id: string) {
  // No reason parameter accepted
  // No activity logging for cancellation reason
}
```

**Impact:**
- FE can't pass cancel reason to BE
- No reason stored in database
- Activity log doesn't have cancellation reason

**Options:**
1. Add reason parameter to BE
2. Create cancellation activity with reason
3. Or remove reason from FE call if not needed

**Date Reported:** 2026-01-10

---

## Issue 4: updateBooking() Does NOT Update BookingRoom.checkInDate/checkOutDate

**Severity:** 🔴 **CRITICAL** (Data Inconsistency)

**Location:** `src/services/booking.service.ts` line 708-734 (updateBooking method)

### The Problem

Backend has separate `checkInDate`/`checkOutDate` for:
1. **Booking table** (applies to whole booking)
2. **BookingRoom table** (individual room can have different dates)

But `updateBooking()` only updates **Booking** table fields, NOT **BookingRoom** fields.

**Evidence from Data Model:**
```prisma
model Booking {
  checkInDate  DateTime   // ← Update here only
  checkOutDate DateTime   // ← Update here only
  bookingRooms BookingRoom[]
}

model BookingRoom {
  checkInDate    DateTime   // ← NOT updated by updateBooking()
  checkOutDate   DateTime   // ← NOT updated by updateBooking()
  bookingId      String
  booking        Booking @relation(...)
}
```

### Backend updateBooking() Implementation

**File:** `src/services/booking.service.ts` (line 708-734)

```typescript
async updateBooking(id: string, updateBody: any) {
  const booking = await this.getBookingById(id);
  const oldStatus = booking.status;

  // Validate status
  if (
    booking.status === BookingStatus.CANCELLED ||
    booking.status === BookingStatus.CHECKED_OUT
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update cancelled or checked-out booking');
  }

  // ❌ Only updates Booking table - NOT BookingRoom
  const updatedBooking = await this.prisma.booking.update({
    where: { id },
    data: updateBody,  // updateBody contains checkInDate, checkOutDate
    include: {
      bookingRooms: true
    }
  });

  return updatedBooking;
}
```

**What Actually Happens:**
- ✅ `Booking.checkInDate` updated to new value
- ✅ `Booking.checkOutDate` updated to new value
- ❌ `BookingRoom[0].checkInDate` NOT changed (still has OLD value)
- ❌ `BookingRoom[1].checkOutDate` NOT changed (still has OLD value)
- ❌ Data inconsistency: Parent dates ≠ child dates

### Concrete Example

```
Initial State:
  Booking.checkInDate = 2026-01-15
  Booking.checkOutDate = 2026-01-18
  BookingRoom[0].checkInDate = 2026-01-15
  BookingRoom[0].checkOutDate = 2026-01-18

User edits booking to:
  checkInDate = 2026-01-20
  checkOutDate = 2026-01-25

After updateBooking() call:
  ✅ Booking.checkInDate = 2026-01-20
  ✅ Booking.checkOutDate = 2026-01-25
  ❌ BookingRoom[0].checkInDate = 2026-01-15 (WRONG!)
  ❌ BookingRoom[0].checkOutDate = 2026-01-18 (WRONG!)

Result: Data inconsistency - booking dates don't match room dates
```

### Why This Is a Problem

1. **Check-in calculation broken:**
   - Staff checks in using `BookingRoom.checkInDate`
   - But that's now different from `Booking.checkInDate`
   - Which date is correct?

2. **Night count calculation wrong:**
   - System calculates nights from `Booking.checkOutDate - Booking.checkInDate`
   - But charges based on `BookingRoom.checkInDate - BookingRoom.checkOutDate`
   - Financial calculations inconsistent

3. **Availability validation broken:**
   - When other bookings check for conflicts, they query `BookingRoom` dates
   - If `BookingRoom` has old dates, conflicts won't be detected for new dates
   - Multiple bookings can be assigned to same room on overlapping dates

### Frontend Current Implementation

**File:** `hooks/use-reservations.ts` (line 680-695)

```typescript
// Frontend sends ONLY Booking-level dates
await bookingService.updateBooking(selectedReservation.reservationID, {
  checkInDate: checkInISO,        // Goes to Booking table
  checkOutDate: checkOutISO,      // Goes to Booking table
  totalGuests: totalGuests || undefined,
});

// ❌ Frontend has NO way to update BookingRoom.checkInDate/checkOutDate
// ❌ No separate API exists for updating per-room dates
```

Frontend correctly sends only what Backend supports, but Backend implementation is incomplete.

### Requirement to Fix

Backend needs to handle date changes properly in `updateBooking()`:

```typescript
async updateBooking(id: string, updateBody: any) {
  const booking = await this.getBookingById(id);
  
  // If dates changed, update BOTH Booking AND all BookingRooms
  if (updateBody.checkInDate || updateBody.checkOutDate) {
    const newCheckIn = updateBody.checkInDate || booking.checkInDate;
    const newCheckOut = updateBody.checkOutDate || booking.checkOutDate;
    
    // Update ALL BookingRooms with new dates
    await this.prisma.bookingRoom.updateMany({
      where: { bookingId: booking.id },
      data: {
        checkInDate: newCheckIn,
        checkOutDate: newCheckOut
      }
    });
  }
  
  // Then update Booking
  const updated = await this.prisma.booking.update({
    where: { id },
    data: updateBody,
    include: { bookingRooms: true }
  });
  
  return updated;
}
```

### Frontend Impact

- ✅ FE correctly sends only supported fields
- ❌ FE cannot know that BookingRoom dates are not being updated
- ❌ FE has no way to validate this
- ❌ Data inconsistency only discovered at check-in time

### Summary

| Aspect | Current | Required |
|--------|---------|----------|
| **Update Booking.checkInDate** | ✅ Done | ✅ OK |
| **Update Booking.checkOutDate** | ✅ Done | ✅ OK |
| **Update BookingRoom[].checkInDate** | ❌ Not done | ✅ Required |
| **Update BookingRoom[].checkOutDate** | ❌ Not done | ✅ Required |
| **Data consistency** | ❌ Broken | ✅ Needed |

This is a **Backend bug** - when Booking dates change, ALL BookingRooms must be updated too.

**Date Reported:** 2026-01-11

---

## Issue 5: BookingCustomer Relationship Not Managed During Create/Update

**Severity:** 🟡 **LOW** (Feature Gap)

**Current Status:**
- BE has `BookingCustomer` table to map customers to booking rooms
- FE doesn't create BookingCustomer records when creating/updating booking
- BookingCustomer.bookingRoomId shows which customer stays in which room

**Problem:**
- When check-in happens, system needs to know which customers are in which rooms
- Check-in API expects: `{ bookingRoomId, customerIds[] }`
- If BookingCustomer doesn't exist, check-in will fail or be incomplete

**BE Model:** `prisma/schema.prisma` lines 250-264
```prisma
model BookingCustomer {
  id: String @id @default(cuid())
  bookingId: String
  customerId: String
  bookingRoomId: String? // which room
  isPrimary: Boolean @default(false)
}
```

**Who should populate this?**
- During create: Create BookingCustomer with isPrimary=true for primary customer
- During check-in: Create/update BookingCustomer to assign additional customers to rooms
- During edit: Update BookingCustomer if customer assignment changes

**Current FE Implementation:**
- Creates booking with one customer (primaryCustomerId)
- Doesn't create BookingCustomer records
- During check-in flow, might not have customer associations

**Recommendation:**
- Either populate automatically during create (primary customer for all rooms)
- Or clarify that BookingCustomer is managed only during check-in flow
- Document the expected state at each booking stage

**Date Reported:** 2026-01-10

---

**Impact:** Users cannot search or select rooms when making a booking - complete blocker for booking flow

**Date Reported:** 2026-01-10

---
