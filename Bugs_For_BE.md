
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

## Issue 4: BookingCustomer Relationship Not Managed During Create/Update

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
