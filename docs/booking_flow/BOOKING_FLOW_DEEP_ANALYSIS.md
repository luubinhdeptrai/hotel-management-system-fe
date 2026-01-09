# BOOKING FLOW ANALYSIS - BE vs FE

## Backend Booking Requirements

### 1. API Endpoint
**POST /customer/bookings** (or `/employee/bookings`)

```typescript
// Required Format
{
  rooms: [
    { roomId: "specific-uuid-1" },  // ← SPECIFIC ROOM IDs REQUIRED
    { roomId: "specific-uuid-2" }
  ],
  checkInDate: "2025-01-15T14:00:00Z",  // ISO 8601
  checkOutDate: "2025-01-20T12:00:00Z", // ISO 8601
  totalGuests: 2,
  customerId?: "...",  // OR customer object for new customers
  customer?: { fullName, phone, email, ... }
}
```

### 2. Validation (booking.validation.ts)
- ✅ `rooms` array with `roomId` (string, required)
- ❌ NO support for `roomTypeId` or `count`
- ✅ ISO 8601 date format required
- ✅ `totalGuests` must be positive integer

### 3. Business Logic (booking.service.ts)
1. Extract `roomIds` from request
2. Query `prisma.room.findMany({ where: { id: { in: roomIds } } })`
3. Validate each room:
   - Status must be `AVAILABLE`
   - No overlapping bookings during selected dates
4. Create booking with allocated rooms
5. Generate booking code and expiration time (15 min)
6. Calculate total amount and deposit (from settings)
7. Create booking + bookingRooms records

### 4. Available Rooms API
**GET /customer/rooms** (or `/employee/rooms`)
- Query Params:
  - `checkInDate` - ISO format
  - `checkOutDate` - ISO format
  - `roomTypeId` - optional filter
- Returns: Array of available rooms with full details
  - `id` (room UUID)
  - `roomNumber` (display name)
  - `floor`
  - `roomType` (with price, capacity, name)
  - `status` (always AVAILABLE)

---

## Current Frontend Issues

### Problem 1: Form Only Allows Room Type Selection
**File:** [reservation-form-modal.tsx](components/reservations/reservation-form-modal.tsx)
```tsx
// Current: Room Type + Quantity
handleAddRoomType() {
  // Selects: roomTypeID + quantity + numberOfGuests
  // Stores in roomSelections array
  // Does NOT select specific rooms
}
```

### Problem 2: Auto-Selection is Hidden
**File:** [use-reservations.ts](hooks/use-reservations.ts)
```tsx
// Line 412-431: Auto-search happens, but...
// - Only searches when CREATING booking
// - Users don't SEE which rooms are selected
// - Auto-selects FIRST room only
// - No user control over room selection
```

### Problem 3: Users Can't Choose Specific Rooms
- No UI to display available rooms
- No way to select specific room
- Auto-selection picks first room (might not be preferred)

---

## Desired New Flow (A-Z)

### Step 1: User Opens Booking Modal
- Show: Room Type Filter + Check-in/Check-out dates
- Call: `getAvailableRooms()` with filters

### Step 2: Show Available Rooms
- Display: List/Grid of available rooms with:
  - Room number (101, 102, etc.)
  - Room type (Suite, Deluxe, etc.)
  - Price per night
  - Floor
  - Capacity
  - Availability status

### Step 3: User Selects Rooms
- Click room → Add to cart
- Show: "Selected Rooms" list
- Allow: Remove/change selections
- Display: Total price, total guests

### Step 4: Fill Customer Info
- Select existing customer OR add new
- Optional: Notes/Special requests

### Step 5: Review & Confirm
- Show: Summary of selected rooms
- Show: Total price, deposit amount
- Show: Check-in/out dates and times
- Confirm: Create booking

### Step 6: Backend Creates Booking
- Receives: Specific room IDs
- Validates: Room availability
- Creates: Booking record with allocated rooms

---

## Implementation Plan

### New Components Needed
1. **RoomSelector Component**
   - Display available rooms in grid/list
   - Filter by type, floor, price
   - Click to select/deselect
   - Show selected count and total price

2. **SelectedRoomsList Component**
   - Display selected rooms
   - Show room number, type, price
   - Allow remove/change

3. **BookingSummary Component**
   - Display final booking summary
   - Total price breakdown
   - Deposit amount
   - Check-in/out times

### Updated Components
1. **ReservationFormModal**
   - Replace room type selector with room selector
   - Show list of selected rooms
   - Better UX flow

2. **use-reservations Hook**
   - Remove auto-search logic from booking creation
   - Move to room selection phase
   - Users explicitly select rooms

### Updated Services
1. **bookingService**
   - Ensure `createBooking()` sends specific room IDs
   - Update error handling

---

## Current vs Desired UX

### BEFORE (Current - Room Type Based)
```
1. Select Room Type (Suite)
2. Select Quantity (2)
3. Auto-select first 2 Suites behind scenes
4. Create booking
❌ Users don't see which rooms, don't control selection
```

### AFTER (Desired - Room Selection Based)
```
1. Select Check-in/out dates
2. See all available rooms in list/grid
3. Click room → Add to selection
4. Repeat step 3 until done
5. Review selected rooms
6. Fill customer info
7. Confirm booking
✅ Users see exactly which rooms, full control
```

---

## Files to Modify

### Create (New Components)
- [ ] `components/reservations/room-selector.tsx`
- [ ] `components/reservations/selected-rooms-list.tsx`
- [ ] `components/reservations/booking-summary.tsx`

### Update (Existing Components)
- [ ] `components/reservations/reservation-form-modal.tsx` (Major refactor)
- [ ] `hooks/use-reservations.ts` (Refactor booking flow)
- [ ] `lib/services/booking.service.ts` (Ensure correct format)

### Update (Types)
- [ ] `lib/types/reservation.ts` (Update RoomTypeSelection)
- [ ] `lib/types/api.ts` (Already fixed)

---

## Key Changes Summary

| Aspect | Current | New |
|--------|---------|-----|
| Room Selection | Room Type + Count | Specific Rooms |
| User Control | Auto-selected | User selected |
| Visibility | Hidden | Shown in UI |
| Validation | At booking creation | At selection |
| Error Handling | After clicking create | During selection |

