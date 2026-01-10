
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
