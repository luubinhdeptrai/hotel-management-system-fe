
## Executive Summary

The RoomMaster backend implements a comprehensive booking system with automatic room allocation, multi-status workflows, flexible payment scenarios, and service management. This document explains the core business logic, all booking scenarios, and required data for each scenario.

---

## 📋 Part 1: Core Booking Business Logic

### 1.1 Booking Creation Logic

**Purpose:** Create a new booking with automatic room allocation and initialize the booking workflow.

**Key Business Rules:**

1. **Date Validation**
   - `checkOutDate` must be **AFTER** `checkInDate`
   - Validation: `nights = checkOut.diff(checkIn, 'day')` where `nights > 0`
   - Uses dayjs for precise date/time calculations
   - ❌ Error: "Check-out date must be after check-in date"

2. **Room Availability Check**
   - For each requested room type with count `N`:
     - Find rooms where `status = AVAILABLE`
     - Exclude rooms with **overlapping active bookings**
     - Active booking = status in `[PENDING, CONFIRMED, CHECKED_IN]`
     - Overlap window: `[checkInDate, checkOutDate)`
     - If available rooms < requested count → ❌ Error 409 CONFLICT

3. **Automatic Room Allocation**
   - Backend automatically selects available rooms (no manual room selection)
   - Groups rooms by type
   - Allocates first N available rooms matching the requested type and count
   - Creates individual `BookingRoom` records for each allocated room

4. **Financial Calculation**
   - Calculate nights: `nights = checkOut.diff(checkIn, 'day')`
   - For each room: `roomSubtotal = pricePerNight × nights`
   - Total: `totalAmount = sum(roomSubtotal for all rooms)`
   - Deposit required: `depositRequired = totalAmount × (depositPercentage / 100)`
   - **Default deposit percentage: 30%** (configurable via AppSettings)
   - Balance: `balance = totalAmount`

5. **Booking Code Generation**
   - Unique format: `BK${timestamp}${random}`
   - Example: `BK1767625250009QUZ6D`

6. **Expiration Window**
   - Pending bookings expire in **15 minutes**
   - Calculated: `expiresAt = now + 15 minutes`
   - After expiration, booking can be auto-cancelled if payment not made

7. **Database Transaction**
   - Create `Booking` record with status `PENDING`
   - Create `BookingRoom` records (one per allocated room)
   - Update room statuses: `AVAILABLE` → `RESERVED`
   - All operations atomic (transaction rollback on any failure)

**Return Response:**
```typescript
{
  bookingId: string;           // Unique booking ID
  bookingCode: string;         // Readable booking code
  expiresAt: Date;             // 15 minutes from now
  totalAmount: number;         // Total booking amount
  booking: Booking;            // Full booking object with details
}
```

---

### 1.2 Booking Status Lifecycle

```
PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT
                ↓
            CANCELLED

CHECKED_IN can also transition to PARTIALLY_CHECKED_OUT
when some (but not all) rooms are checked out
```

**Status Definitions:**

| Status | Meaning | Can Transition To | What Can Happen |
|--------|---------|-------------------|-----------------|
| **PENDING** | Newly created, waiting for payment | CONFIRMED, CANCELLED | Make deposit payment |
| **CONFIRMED** | Deposit paid, ready for check-in | CHECKED_IN, CANCELLED | Check in guests |
| **CHECKED_IN** | At least one room occupied | PARTIALLY_CHECKED_OUT, CHECKED_OUT | Check out rooms |
| **PARTIALLY_CHECKED_OUT** | Some rooms checked out, others still occupied | CHECKED_OUT | Check out remaining rooms |
| **CHECKED_OUT** | All rooms returned, booking complete | None (Final) | Process final payment |
| **CANCELLED** | Booking cancelled | None (Final) | Process refunds |
| **EXPIRED** | Pending booking not paid within 15 min | None | None |

---

### 1.3 Check-in Logic

**Purpose:** Register guest arrival and mark rooms as occupied.

**Prerequisites:**
- Booking status must be `CONFIRMED` (deposit paid)
- All booking rooms must be `CONFIRMED`

**Business Rules:**

1. **Input Requirements:**
   ```typescript
   {
     checkInInfo: [
       {
         bookingRoomId: string;      // Which room
         customerIds: string[];      // Which guests in that room
       }
     ],
     employeeId: string;             // Staff performing check-in
   }
   ```

2. **For Each Room Being Checked In:**
   - Verify booking room exists and is `CONFIRMED`
   - Verify all customer IDs are valid existing customers
   - Record actual check-in timestamp: `actualCheckIn = now()`
   - Update booking room status: `CONFIRMED` → `CHECKED_IN`
   - Update room status: `RESERVED` → `OCCUPIED`
   - Create `BookingCustomer` records (map customers to this booking room)

3. **Check Booking Completion:**
   - After checking in all rooms for a booking:
   - If **all** booking rooms are now `CHECKED_IN`:
     - Update booking status: `CONFIRMED` → `CHECKED_IN`
   - Create audit activity log for each check-in

**Return Response:**
```typescript
{
  bookingRooms: Array<{
    id: string;
    room: { roomNumber, ... };
    roomType: { name, pricePerNight, ... };
    booking: Booking;
    bookingCustomers: Array<{
      customer: { id, fullName, phone, email };
    }>;
  }>;
}
```

---

### 1.4 Check-out Logic

**Purpose:** Process guest departure and mark rooms as available.

**Prerequisites:**
- Booking room status must be `CHECKED_IN`

**Business Rules:**

1. **Input Requirements:**
   ```typescript
   {
     bookingRoomIds: string[];    // Which rooms to check out
     employeeId: string;          // Staff performing check-out
   }
   ```

2. **For Each Room Being Checked Out:**
   - Verify booking room exists and is `CHECKED_IN`
   - Record actual check-out timestamp: `actualCheckOut = now()`
   - Update booking room status: `CHECKED_IN` → `CHECKED_OUT`
   - Update room status: `OCCUPIED` → `AVAILABLE` (ready for next guest)
   - Create audit activity log

3. **Check Booking Completion:**
   - After checking out rooms:
   - If **all** booking rooms are now `CHECKED_OUT`:
     - Update booking status: `CHECKED_IN` → `CHECKED_OUT`
   - If only **some** rooms are checked out:
     - Update booking status: `CHECKED_IN` → `PARTIALLY_CHECKED_OUT`

**Return Response:**
```typescript
{
  bookingRooms: Array<{
    id: string;
    room: { roomNumber, ... };
    roomType: { name, pricePerNight, ... };
    booking: Booking;
  }>;
}
```

---

### 1.5 Cancellation Logic

**Purpose:** Cancel a booking and release reserved/occupied rooms.

**Prerequisites:**
- Booking status must NOT be `CANCELLED` or `CHECKED_OUT`
- ❌ Cannot cancel: Already checked-out bookings

**Business Rules:**

1. **Update Statuses:**
   - Booking status: → `CANCELLED`
   - All booking rooms: → `CANCELLED`
   - All rooms: `RESERVED`/`OCCUPIED` → `AVAILABLE`

2. **Financial Processing:**
   - Process refunds based on payment policy
   - Calculate refund amount (may be partial based on cancellation time)

3. **Audit Trail:**
   - Create activity log for cancellation

---

### 1.6 Update Booking Logic

**Purpose:** Modify booking details after creation.

**Restrictions:**
- ❌ Cannot update: `CANCELLED` or `CHECKED_OUT` bookings
- Can update: `PENDING` and `CONFIRMED` bookings

**Allowed Updates:**
- Additional guest information
- Special requests
- Custom notes

---

## 📋 Part 2: Booking Scenarios & Required Data

### Scenario 1: Standard Web Booking (Customer Self-Service)

**When:** Customer books directly through mobile/web app

**Flow:**
1. Customer views available rooms
2. Selects room types and quantities
3. Chooses check-in/check-out dates and times
4. Confirms booking details
5. Makes deposit payment
6. Receives confirmation

**Endpoint:** `POST /customer-api/v1/bookings`

**Required Data:**

```typescript
{
  // Who is booking
  // (Customer ID is auto-filled from JWT auth)
  
  // What they want
  rooms: [
    {
      roomTypeId: string;     // UUID of room type
      count: number;          // How many rooms of this type (1-10)
    }
  ],
  
  // When they want it
  checkInDate: string;        // ISO 8601 format: "2026-01-09T14:00:00Z"
  checkOutDate: string;       // ISO 8601 format: "2026-01-10T12:00:00Z"
  
  // How many guests
  totalGuests: number;        // Total occupancy (1+)
}
```

**Example Request:**
```json
{
  "rooms": [
    { "roomTypeId": "room-type-123", "count": 2 },
    { "roomTypeId": "room-type-456", "count": 1 }
  ],
  "checkInDate": "2026-01-09T14:00:00.000Z",
  "checkOutDate": "2026-01-10T12:00:00.000Z",
  "totalGuests": 5
}
```

**Response:**
```json
{
  "bookingId": "clp1234567890abcdef",
  "bookingCode": "BK1767625250009QUZ6D",
  "expiresAt": "2026-01-09T15:15:00.000Z",
  "totalAmount": 1200000,
  "booking": {
    "id": "clp1234567890abcdef",
    "bookingCode": "BK1767625250009QUZ6D",
    "status": "PENDING",
    "totalAmount": 1200000,
    "depositRequired": 360000,
    "balance": 1200000,
    "bookingRooms": [ ... ]
  }
}
```

**Frontend Implementation Notes:**
- Use ISO 8601 datetime with timezone (Z = UTC)
- Standard check-in time: **14:00 UTC**
- Standard check-out time: **12:00 UTC** (next day)
- Deposit = 30% of total amount
- Provide booking code to customer for reference

---

### Scenario 2: Walk-in/Phone Booking (Employee Entry)

**When:** Guest arrives without reservation or calls to book

**Difference from Scenario 1:**
- Employee creates booking on behalf of customer
- Customer may be new (not pre-registered)
- Auto-creates customer if phone number is new
- Can manually assign customers to rooms during check-in

**Endpoint:** `POST /employee-api/v1/bookings`

**Required Data (Option A: Existing Customer):**

```typescript
{
  customerId: string;         // UUID of existing customer
  
  rooms: [
    { roomTypeId: string; count: number; }
  ],
  
  checkInDate: string;        // ISO 8601
  checkOutDate: string;       // ISO 8601
  totalGuests: number;
}
```

**Required Data (Option B: New Customer Walk-in):**

```typescript
{
  customerId: undefined,      // Not provided
  
  customer: {                 // New customer info
    fullName: string;         // e.g., "Nguyễn Văn A"
    phone: string;            // Unique identifier (checked against DB)
    idNumber?: string;        // ID card/passport number
    email?: string;           // Contact email
    address?: string;         // Street address
  },
  
  rooms: [
    { roomTypeId: string; count: number; }
  ],
  
  checkInDate: string;        // ISO 8601
  checkOutDate: string;       // ISO 8601
  totalGuests: number;
}
```

**Backend Processing:**
1. If `customerId` provided: Use existing customer
2. If `customer.phone` already exists: Use that customer instead
3. If `customer.phone` is new: Create customer with default password `12345678`
4. Proceed with same booking logic as Scenario 1

**Response:** Same as Scenario 1

**Frontend Implementation Notes:**
- For walk-in: Verify customer doesn't already exist by phone
- Create customer record first, or pass customer object
- Employee dashboard handles both paths

---

### Scenario 3: Group Booking

**When:** Large group or corporate booking (10+ people)

**Difference from Standard:**
- Multiple room types for same group
- Longer stay duration
- Special rates/negotiations may apply
- Additional services (airport transfer, group meals)

**Required Data (Same as Scenario 1):**

```typescript
{
  rooms: [
    { roomTypeId: "type-a", count: 5 },    // 5 standard rooms
    { roomTypeId: "type-b", count: 3 }     // 3 suite rooms
  ],
  
  checkInDate: "2026-01-09T14:00:00Z",
  checkOutDate: "2026-01-14T12:00:00Z",    // 5 nights
  totalGuests: 18
}
```

**Additional Handling:**
- Same booking creation logic
- May add group-level services (transfer, meals)
- May apply group discount (through promotions)
- Check-in flexibility: Guests assigned to rooms at arrival

**Unique Service Scenario:**
```typescript
// Group service example (Airport transfer)
{
  bookingId: "group-booking-id",
  serviceId: "airport-transfer-service-id",
  quantity: 2,          // 2 transfers (there and back)
  employeeId: "emp-123"
}
```

---

### Scenario 4: Multi-Room Booking (Same Guest Family)

**When:** Family or team books multiple rooms together

**Difference from Group:**
- Same primary customer
- Same check-in/check-out
- Different rooms (potentially different types)
- All bookings tracked under one `bookingId`

**Required Data:**

```typescript
{
  rooms: [
    { roomTypeId: "family-room", count: 2 },
    { roomTypeId: "single-room", count: 1 }
  ],
  
  checkInDate: "2026-01-09T14:00:00Z",
  checkOutDate: "2026-01-10T12:00:00Z",
  totalGuests: 5  // Total across all rooms
}
```

**Booking Structure:**
- 1 Booking record
- 3 BookingRoom records (2 family + 1 single)
- All under same booking code and status

**Check-in Flow:**
- Assign specific customers to each room during check-in
- Each room has its own check-in record
- Different guests in different rooms

**Payment Scenarios:**
- Option A: Pay full booking amount
- Option B: Pay per room (split payment)
- Option C: Pay deposit, remainder later

---

### Scenario 5: Corporate/Long-Term Booking

**When:** Extended stay (7+ nights) with contract

**Required Data:** Same as standard, but with:

```typescript
{
  rooms: [ { roomTypeId, count } ],
  checkInDate: "2026-01-09T14:00:00Z",
  checkOutDate: "2026-02-09T12:00:00Z",    // 31 nights
  totalGuests: 2,
  
  // Additional metadata (notes, special requests)
  // Handled through booking update API
}
```

**Special Handling:**
- Long stay pricing may apply (via PromotionService)
- Flexible cancellation policy
- Potential for room changes mid-stay
- Daily/weekly settlement options

---

## 📋 Part 3: Required Fields by Entity

### CreateBookingPayload (Backend Interface)

```typescript
interface CreateBookingPayload {
  rooms: RoomRequest[];
  checkInDate: string;        // ISO 8601 datetime string
  checkOutDate: string;       // ISO 8601 datetime string
  totalGuests: number;        // Positive integer
  customerId: string;         // UUID of customer
}

interface RoomRequest {
  roomTypeId: string;         // UUID
  count: number;              // 1-10 rooms per type
}
```

### CheckInPayload (Backend Interface)

```typescript
interface CheckInPayload {
  checkInInfo: Array<{
    bookingRoomId: string;    // UUID
    customerIds: string[];    // Array of customer UUIDs
  }>;
  employeeId: string;         // UUID of staff member
}
```

### CheckOutPayload (Backend Interface)

```typescript
interface CheckOutPayload {
  bookingRoomIds: string[];   // Array of room UUIDs to check out
  employeeId: string;         // UUID of staff member
}
```

### Booking Response Object

```typescript
interface Booking {
  id: string;                 // UUID
  bookingCode: string;        // BK{timestamp}{random}
  status: BookingStatus;      // PENDING | CONFIRMED | CHECKED_IN | etc.
  
  // Customers
  primaryCustomerId: string;  // UUID
  primaryCustomer: Customer;  // Full customer object
  
  // Dates
  checkInDate: Date;          // Actual datetime
  checkOutDate: Date;         // Actual datetime
  
  // Amounts
  totalGuests: number;
  totalAmount: number;        // Sum of all rooms
  depositRequired: number;    // 30% of total (configurable)
  balance: number;            // Remaining to pay
  
  // Details
  bookingRooms: BookingRoom[]; // Array of allocated rooms
  createdAt: Date;
  updatedAt: Date;
}

interface BookingRoom {
  id: string;                 // UUID
  roomId: string;             // Physical room UUID
  roomTypeId: string;
  status: BookingStatus;      // Matches booking or more specific
  
  checkInDate: Date;
  checkOutDate: Date;
  actualCheckIn?: Date;       // Filled during check-in
  actualCheckOut?: Date;      // Filled during check-out
  
  pricePerNight: number;
  subtotalRoom: number;       // pricePerNight × nights
  totalAmount: number;
  balance: number;
  
  room: Room;
  roomType: RoomType;
  bookingCustomers: BookingCustomer[];
}

interface BookingCustomer {
  id: string;
  bookingId: string;
  customerId: string;
  bookingRoomId?: string;     // Which room in the booking
  isPrimary: boolean;
  customer: Customer;
}
```

---

## 📋 Part 4: Payment Integration Points

### Scenario 1: Deposit Payment (PENDING → CONFIRMED)

**Trigger:** Customer completes deposit payment after booking created

**API Call:**
```typescript
POST /employee-api/v1/transactions

{
  bookingId: "booking-123",
  amount: 360000,             // 30% deposit
  paymentMethod: "CASH" | "CREDIT_CARD" | "BANK_TRANSFER" | "E_WALLET",
  notes: "Deposit payment"
}
```

**Backend Processing:**
- Verify booking exists and is `PENDING`
- Create transaction record
- Update booking status: `PENDING` → `CONFIRMED`
- Reduce balance: `balance -= amount`

---

### Scenario 2: Split Room Payments (During/After Stay)

**Trigger:** Pay for some rooms before checking out others

**API Call:**
```typescript
POST /employee-api/v1/transactions

{
  bookingId: "booking-123",
  bookingRoomIds: ["room-1", "room-2"],  // Pay for these rooms only
  amount: 600000,                        // Not full amount
  paymentMethod: "CASH" | "CREDIT_CARD" | "BANK_TRANSFER" | "E_WALLET",
  notes: "Partial payment for 2 rooms"
}
```

**Backend Processing:**
- Create transaction
- Allocate payment across specified rooms
- Each room maintains own balance

---

### Scenario 3: Full Settlement (CHECKED_OUT)

**Trigger:** All rooms checked out, final payment due

**API Call:**
```typescript
POST /employee-api/v1/transactions

{
  bookingId: "booking-123",
  amount: 1200000,            // Full total amount
  paymentMethod: "CASH" | "CREDIT_CARD" | "BANK_TRANSFER" | "E_WALLET",
  notes: "Final payment"
}
```

---

## ⚙️ Part 5: Key Validation Rules

| Rule | Value | Error |
|------|-------|-------|
| Check-out after check-in | `nights > 0` | "Check-out date must be after check-in date" |
| Room availability | Available rooms ≥ requested | "Not enough available rooms for room type X" |
| Room type exists | All room types must exist | "One or more room types not found" |
| Deposit percentage | 30% (default, configurable) | N/A |
| Booking expiration | 15 minutes from creation | Auto-cancel if not confirmed |
| Check-in status | Must be CONFIRMED | "All booking rooms must be CONFIRMED" |
| Check-out status | Must be CHECKED_IN | "All booking rooms must be CHECKED_IN" |
| Cancellation status | Not CANCELLED or CHECKED_OUT | "Cannot cancel checked-in or checked-out booking" |
| Payment methods | CASH, CREDIT_CARD, BANK_TRANSFER, E_WALLET | "Invalid payment method" |
| Customer validation | Customer must exist | "One or more customers not found" |

---

## 🔗 Part 6: Related Business Logic References

### Service Management (Service Usage)

Three scenarios for adding services to a booking:

1. **Booking-Level Service** (shared by all rooms)
   - `bookingId` provided, `bookingRoomId` = null
   - Example: Airport transfer for entire group

2. **Room-Specific Service** (for single room)
   - `bookingId` + `bookingRoomId` both provided
   - Example: Room service for room 101

3. **Guest Service** (standalone)
   - Neither `bookingId` nor `bookingRoomId` provided
   - Example: Laundry service

### Promotion & Discount Application

- Applied during payment processing
- Can reduce total booking amount
- Adjusts deposit calculation accordingly

### Activity Logging

Every action creates audit trail:
- Booking creation
- Check-in/check-out
- Payment transactions
- Service usage
- Cancellations

---

## 📊 Frontend Checklist for Integration

✅ **Booking Creation:**
- [ ] Collect room types and quantities
- [ ] Collect check-in date (with 14:00 time)
- [ ] Collect check-out date (with 12:00 time)
- [ ] Calculate nights and total amount
- [ ] Display deposit requirement (30%)
- [ ] Send ISO 8601 format datetimes
- [ ] Handle expiration (15 minutes)

✅ **Payment Processing:**
- [ ] Validate deposit >= calculated amount
- [ ] Support payment methods: CASH, CREDIT_CARD, BANK_TRANSFER, E_WALLET
- [ ] Update booking status to CONFIRMED after deposit
- [ ] Show updated balance

✅ **Check-in Management:**
- [ ] Assign customers to specific booking rooms
- [ ] Validate all customers exist
- [ ] Update room status display
- [ ] Show confirmation with check-in time

✅ **Check-out Processing:**
- [ ] Select which rooms to check out
- [ ] Calculate final charges if any
- [ ] Process final payment
- [ ] Release rooms for availability

---

## 🐛 Common Implementation Issues & Fixes

### Issue 1: Date/Time Validation Error
**Problem:** Backend returns "Check-out date must be after check-in date"
**Cause:** `checkOutDate` is same as or before `checkInDate`
**Solution:** Ensure check-in is 14:00 and check-out is next day at 12:00 (or later)

### Issue 2: Not Enough Available Rooms
**Problem:** Backend returns 409 CONFLICT
**Cause:** Requested rooms overlap with existing bookings
**Solution:** Query available rooms endpoint first to see real-time availability

### Issue 3: Invalid Payment Method
**Problem:** Backend rejects DEBIT_CARD
**Cause:** Backend only accepts: CASH, CREDIT_CARD, BANK_TRANSFER, E_WALLET
**Solution:** Use valid payment methods; replace DEBIT_CARD with E_WALLET

### Issue 4: Booking Cannot Transition
**Problem:** Cannot check-in pending booking
**Cause:** Booking must be CONFIRMED (deposit paid) before check-in
**Solution:** Process deposit payment first to change status to CONFIRMED

---

## 📞 API Endpoints Summary

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/customer-api/v1/bookings` | POST | Create booking | Customer |
| `/customer-api/v1/bookings` | GET | List own bookings | Customer |
| `/customer-api/v1/bookings/{id}` | GET | View booking detail | Customer |
| `/customer-api/v1/bookings/{id}/cancel` | POST | Cancel booking | Customer |
| `/employee-api/v1/bookings` | POST | Create booking (walk-in) | Employee |
| `/employee-api/v1/bookings` | GET | List all bookings | Employee |
| `/employee-api/v1/bookings/{id}` | GET | View booking detail | Employee |
| `/employee-api/v1/bookings/{id}/check-in` | POST | Check in guests | Employee |
| `/employee-api/v1/bookings/{id}/check-out` | POST | Check out guests | Employee |
| `/employee-api/v1/bookings/{id}` | PUT | Update booking | Employee |
| `/employee-api/v1/bookings/{id}/cancel` | POST | Cancel booking | Employee |

