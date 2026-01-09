# CRITICAL: Booking API Mismatch Discovered

## 🚨 Issue Summary

**Frontend implementation DOES NOT MATCH Backend API requirements.**

- **Frontend Currently Sends:** `{ roomTypeId: string, count: number }`
- **Backend Actually Requires:** `{ roomId: string }` (specific rooms)
- **Result:** All booking creation requests will FAIL with validation error

## 📋 Detailed Analysis

### Backend Reality (From Code Validation)

**File:** `roommaster-be/src/validations/booking.validation.ts`

#### Customer Booking API
```typescript
const createBooking = {
  body: Joi.object().keys({
    rooms: Joi.array()
      .items(
        Joi.object().keys({
          roomId: Joi.string().required()  // ← ONLY roomId ACCEPTED
        })
      )
      .min(1)
      .required(),
    checkInDate: Joi.date().iso().required(),
    checkOutDate: Joi.date().iso().greater(Joi.ref('checkInDate')).required(),
    totalGuests: Joi.number().integer().min(1).required()
  })
};
```

#### Employee Booking API
```typescript
const createBookingEmployee = {
  body: Joi.object()
    .keys({
      customerId: Joi.string().optional(),
      customer: Joi.object().keys({...}).optional(),
      rooms: Joi.array()
        .items(
          Joi.object().keys({
            roomId: Joi.string().required()  // ← ONLY roomId ACCEPTED
          })
        )
        .min(1)
        .required(),
      checkInDate: Joi.date().iso().required(),
      checkOutDate: Joi.date().iso().greater(Joi.ref('checkInDate')).required(),
      totalGuests: Joi.number().integer().min(1).required()
    })
    .xor('customerId', 'customer')
};
```

### Frontend Current Implementation (WRONG)

**File:** `hotel-management-system-fe/lib/types/api.ts` (Lines 436-450)

```typescript
export interface CreateBookingRequest {
  customerId?: string;
  customer?: {...};
  rooms: Array<{
    roomTypeId: string;      // ❌ WRONG - Backend expects roomId
    count: number;           // ❌ WRONG - Backend doesn't use count
  }>;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
}
```

**File:** `hotel-management-system-fe/hooks/use-reservations.ts` (Lines 410-420)

```typescript
const createBookingRequest: CreateBookingRequest = {
  ...(useExisting ? { customerId } : { customer }),
  rooms: roomSelections.map((sel) => ({
    roomTypeId: sel.roomTypeID,  // ❌ WRONG
    count: sel.quantity,          // ❌ WRONG
  })),
  checkInDate: checkInISO,
  checkOutDate: checkOutISO,
  totalGuests: totalGuests,
};
```

### Documentation vs Reality

**Swagger Docs (Employee Route):** `roommaster-be/src/routes/v1/employee/booking.route.ts` Lines 100-115
```
rooms: [
  {
    roomTypeId: string
    count: integer
  }
]
```

**BUT:** Actual validation code ONLY accepts `roomId`, NOT `roomTypeId`!

## 🔍 Root Cause

- Swagger documentation in Backend is **OUTDATED or WRONG**
- Actual validation code was updated to require specific `roomId`
- Frontend was built following Swagger docs, not actual code
- **Result:** Incompatibility between Frontend and actual Backend API

## ✅ Solution

### Step 1: Update Frontend Type Definitions

**File:** `hotel-management-system-fe/lib/types/api.ts`

Change both `CreateBookingRequest` and `CreateBookingEmployeeRequest`:

```typescript
export interface CreateBookingRequest {
  customerId?: string;
  customer?: {
    fullName: string;
    phone: string;
    idNumber?: string;
    email?: string;
    address?: string;
  };
  rooms: Array<{
    roomId: string;  // ← CHANGED: specific room ID
  }>;
  checkInDate: string; // ISO 8601 format
  checkOutDate: string; // ISO 8601 format
  totalGuests: number;
}
```

### Step 2: Update Room Selection Hook

**File:** `hotel-management-system-fe/hooks/use-reservations.ts` (Around line 410)

Before:
```typescript
rooms: roomSelections.map((sel) => ({
  roomTypeId: sel.roomTypeID,
  count: sel.quantity,
})),
```

After:
```typescript
// Need to convert roomSelections to specific roomIds
// This requires frontend to search for available rooms first
rooms: selectedRoomIds.map((roomId) => ({
  roomId: roomId,
})),
```

### Step 3: Update Room Selection Flow

The booking flow needs to change:

1. **Before:** User selects room type + count → Booking → Backend auto-allocates
2. **After:** User searches available rooms → Selects specific rooms → Booking → Backend uses those specific rooms

**What needs to change in Frontend:**

1. Get available rooms from API (with room-level details, not just types)
2. Let user select **specific rooms** (not room type + count)
3. Pass selected **room IDs** to booking API
4. Remove count-based selection

### Step 4: Available Rooms API

Check if Backend provides room-level search:

**Expected API:** `GET /employee/rooms/available?checkInDate=...&checkOutDate=...`

This should return:
```typescript
{
  rooms: [
    {
      id: "room-uuid-1",
      number: "101",
      roomTypeId: "type-1",
      roomTypeName: "Single Room",
      price: 100,
      available: true
    },
    {
      id: "room-uuid-2",
      number: "102",
      roomTypeId: "type-1",
      roomTypeName: "Single Room",
      price: 100,
      available: true
    }
  ]
}
```

## 📊 Impact

### Affected Features
- ❌ Customer Booking (POST /customer/bookings)
- ❌ Employee Booking (POST /employee/bookings)
- ✅ Check-in/Check-out (already using bookingRoomId)

### Breaking Changes
- **createBooking()** method will fail
- **createBookingEmployee()** method will fail
- Any code expecting `roomTypeId + count` will break

## 🎯 Implementation Priority

1. **CRITICAL:** Update type definitions
2. **CRITICAL:** Update booking request building
3. **HIGH:** Update room selection UI to show specific rooms
4. **HIGH:** Test with actual Backend API
5. **MEDIUM:** Update documentation

## 📝 Files to Modify

1. `hotel-management-system-fe/lib/types/api.ts` - Type definitions
2. `hotel-management-system-fe/hooks/use-reservations.ts` - Booking logic
3. `hotel-management-system-fe/lib/services/booking.service.ts` - Service layer (if needed)
4. `hotel-management-system-fe/components/reservations/*` - UI components
5. Documentation files to reflect changes

## 🔗 Related Code References

- Backend Validation: `roommaster-be/src/validations/booking.validation.ts`
- Backend Service: `roommaster-be/src/services/booking.service.ts` (lines 1-100)
- Backend Route: `roommaster-be/src/routes/v1/customer/booking.route.ts`
- Frontend Types: `hotel-management-system-fe/lib/types/api.ts` (lines 436-480, 560-580)
- Frontend Hook: `hotel-management-system-fe/hooks/use-reservations.ts` (lines 390-420)

---

**Status:** CRITICAL - Requires immediate fix before booking feature can work
**Discovery Date:** Current analysis session
**Previous Analysis:** Incorrectly concluded "100% compatibility"
