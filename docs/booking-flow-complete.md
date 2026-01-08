# Complete Booking Flow - Hotel Management System

**API Implementation Guide for Complete Use Case: Reservation → Check-in → Service Usage → Check-out**

> API Reference: https://room-master-dcdsfng4c7h7hwbg.eastasia-01.azurewebsites.net/api-docs/

- html page of the API reference: docs\Roommaster API Documentation.html
- The page requires authentication. Use this account: username: admin, password: admin160

---

## Overview

This document provides a comprehensive guide for implementing the complete hotel booking lifecycle, from initial reservation through final check-out. It combines core functionality with advanced features including error handling, business rules, and service management.

### Booking Lifecycle Stages

1. **Reservation** - Create booking and collect deposit
2. **Modification** (Optional) - Update booking details before check-in
3. **Check-in** - Guest arrival and room assignment
4. **Service Usage** (Optional) - Additional services during stay
5. **Check-out** - Final billing and departure
6. **Cancellation** (Optional) - Handle booking cancellations and refunds

---

## Business Rules & Policies

### Deposit Policy

- **Minimum deposit**: 30% of total booking amount
- **Full payment required**: 48 hours before check-in
- **Deposit statuses**: `PENDING`, `PARTIAL`, `FULL`

### Cancellation Policy

- **Free cancellation**: 48+ hours before check-in (100% refund)
- **Partial refund**: 24-48 hours before check-in (50% refund)
- **No refund**: <24 hours before check-in (0% refund)
- **No-show**: Full charge, no refund

### Check-in/Check-out Times

- **Standard check-in**: 14:00
- **Standard check-out**: 12:00
- **Early check-in fee**: 50% of daily rate (before 12:00)
- **Late check-out fee**: 50% of daily rate (after 15:00)

### Room Assignment

- Auto-assign available rooms of requested type
- Manual override by staff allowed
- Room preference handling (floor, view, etc.)

---

## Frontend UI Guidelines

> **CRITICAL**: The frontend should NEVER have input fields for payment amounts. All payment calculations are handled by the backend.

### Payment UI Rules

1. **No Amount Input Fields**

   - ❌ Do NOT show input fields for deposit amount
   - ❌ Do NOT show input fields for payment amount
   - ❌ Do NOT show input fields for refund amount
   - ✅ Only show calculated amounts as read-only/display text

2. **Payment Method Selection**

   - ✅ Dropdown/radio buttons for payment method (CASH, CREDIT_CARD, etc.)
   - ✅ Transaction type selection (if applicable)
   - ✅ Promotion code input (optional)

3. **Display Calculated Amounts**
   - Show total booking amount (from booking response)
   - Show required deposit amount (from booking response)
   - Show remaining balance (from bill endpoint)
   - All amounts are READ-ONLY, fetched from backend

### Reservation Flow for Hotel Employees

**UI Workflow**:

1. **Create Booking Form**

   - Customer selection/creation
   - Date selection (check-in/check-out)
   - Room type and quantity selection
   - Guest count input

2. **After Booking Creation**
   - Display booking summary with calculated amounts:
     - Total Amount: `15,000,000 VND`
     - Required Deposit (30%): `4,500,000 VND`
     - Status: `PENDING`
3. **Deposit Confirmation Checkbox**

   ```
   ☐ Confirm deposit payment received

   Payment Method: [Dropdown: Cash/Credit Card/Debit Card/Bank Transfer]

   [Confirm Deposit Button] (disabled until checkbox is checked)
   ```

4. **After Deposit Confirmation**
   - Call `POST /employee/transactions` with selected payment method
   - Update booking status to `CONFIRMED`
   - Show success message with transaction details

**Important**: The employee confirms that payment was received (e.g., customer paid cash at counter), then the system records the transaction. The amount is auto-calculated by the backend.

---

## I. Reservation

### Step 1: Check Room Availability

**Endpoint**: `GET /employee/room-types/availability`

**Query Parameters**:

```
checkInDate: 2026-01-10
checkOutDate: 2026-01-15
```

**Response**:

```json
{
  "available": [
    {
      "roomTypeId": "rt_001",
      "name": "Deluxe Room",
      "availableCount": 5,
      "pricePerNight": 1500000,
      "maxGuests": 2
    },
    {
      "roomTypeId": "rt_002",
      "name": "Suite",
      "availableCount": 2,
      "pricePerNight": 3000000,
      "maxGuests": 4
    }
  ]
}
```

**Validation**:

- ✅ Check-out date must be after check-in date
- ✅ Date range must be valid (not in the past)
- ✅ At least one room type must be available

---

### Step 2: Create or Verify Customer

**Endpoint**: `POST /employee/customers`

**Request Body**:

```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567",
  "password": "password123",
  "email": "nguyenvana@example.com",
  "idNumber": "001234567890",
  "address": "123 Đường Lê Lợi, Quận 1, TP.HCM"
}
```

**Response**:

```json
{
  "customerId": "cust_001",
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567",
  "email": "nguyenvana@example.com"
}
```

**Error Handling**:

- `409 Conflict` - Customer with phone/email already exists
- `400 Bad Request` - Invalid email format or missing required fields

**Note**: If customer exists, retrieve customer ID via `GET /employee/customers?phone=0901234567`

---

### Step 3: Create Booking

**Endpoint**: `POST /employee/bookings`

**Request Body**:

```json
{
  "customerId": "cust_001",
  "customer": {
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567",
    "email": "nguyenvana@example.com",
    "idNumber": "001234567890",
    "address": "123 Đường Lê Lợi, Quận 1, TP.HCM"
  },
  "rooms": [
    {
      "roomTypeId": "rt_001",
      "count": 2
    }
  ],
  "checkInDate": "2026-01-10T14:00:00.000Z",
  "checkOutDate": "2026-01-15T12:00:00.000Z",
  "totalGuests": 3
}
```

**Response**:

```json
{
  "bookingId": "booking_001",
  "customerId": "cust_001",
  "status": "PENDING",
  "totalAmount": 15000000,
  "depositRequired": 4500000,
  "depositPaid": 0,
  "bookingRooms": [
    {
      "bookingRoomId": "br_001",
      "roomTypeId": "rt_001",
      "roomTypeName": "Deluxe Room"
    },
    {
      "bookingRoomId": "br_002",
      "roomTypeId": "rt_001",
      "roomTypeName": "Deluxe Room"
    }
  ]
}
```

**Validation**:

- ✅ Room availability for selected dates
- ✅ Total guests doesn't exceed room capacity
- ✅ Valid customer ID
- ✅ Check-in date is in the future

**Note**: A single booking can contain multiple rooms. Each room gets a unique `bookingRoomId`.

---

### Step 4: Confirm Deposit Payment

> **Frontend UI Flow**: After booking creation, display a confirmation checkbox for the employee to confirm that the customer has paid the deposit. No amount input field should be shown.

**UI Components**:

- ☐ Checkbox: "Confirm deposit payment received"
- Dropdown: Payment method selection
- Display: Required deposit amount (read-only, from booking response)
- Button: "Confirm Deposit" (enabled only when checkbox is checked)

**Endpoint**: `POST /employee/transactions`

> **Note**: The transaction API does NOT accept an `amount` field. The backend automatically calculates the payment amount based on the booking details and transaction type.

#### Option A: Full Deposit Payment

```json
{
  "bookingId": "booking_001",
  "paymentMethod": "CASH",
  "transactionType": "DEPOSIT"
}
```

**Backend Calculation**: Automatically calculates the required deposit amount (minimum 30% of total booking amount).

#### Option B: Split Room Payment

```json
{
  "bookingId": "booking_001",
  "bookingRoomIds": ["br_001", "br_002"],
  "paymentMethod": "CREDIT_CARD",
  "transactionType": "ROOM_CHARGE"
}
```

**Backend Calculation**: Calculates the total amount for the specified rooms only.

#### Option C: Payment with Promotion Code

```json
{
  "bookingId": "booking_001",
  "paymentMethod": "CASH",
  "transactionType": "DEPOSIT",
  "promotionApplications": [
    {
      "customerPromotionId": "cp_123",
      "bookingRoomId": "br_001"
    }
  ]
}
```

**Backend Calculation**: Calculates deposit amount after applying the promotion discount.

**Response**:

```json
{
  "transactionId": "txn_001",
  "bookingId": "booking_001",
  "amount": 4500000,
  "paymentMethod": "CASH",
  "status": "COMPLETED",
  "bookingStatus": "CONFIRMED"
}
```

**Business Logic**:

- Multiple deposits can be made for the same booking
- When total deposits ≥ minimum required (30%), booking status → `CONFIRMED`
- When total deposits = 100%, deposit status → `FULL`

**Payment Methods**: `CASH`, `CREDIT_CARD`, `DEBIT_CARD`, `BANK_TRANSFER`

---

## II. Booking Modification (Optional)

### Step 1: Retrieve Booking Details

**Endpoint**: `GET /employee/bookings/{bookingId}`

**Response**:

```json
{
  "bookingId": "booking_001",
  "customerId": "cust_001",
  "status": "CONFIRMED",
  "checkInDate": "2026-01-10T14:00:00.000Z",
  "checkOutDate": "2026-01-15T12:00:00.000Z",
  "totalAmount": 15000000,
  "depositPaid": 4500000,
  "rooms": [...]
}
```

---

### Step 2: Modify Booking

**Endpoint**: `PATCH /employee/bookings/{bookingId}`

**Request Body** (partial update):

```json
{
  "checkInDate": "2026-01-11T14:00:00.000Z",
  "checkOutDate": "2026-01-16T12:00:00.000Z",
  "rooms": [
    {
      "roomTypeId": "rt_001",
      "count": 3
    }
  ]
}
```

**Response**:

```json
{
  "bookingId": "booking_001",
  "status": "CONFIRMED",
  "totalAmount": 18000000,
  "depositRequired": 5400000,
  "depositPaid": 4500000,
  "additionalDepositRequired": 900000,
  "message": "Booking modified successfully. Additional deposit required."
}
```

**Business Logic**:

- Recalculate total amount based on new dates/rooms
- If new total > old total, require additional deposit
- If new total < old total, credit can be applied or refunded
- Check room availability for new dates

**Restrictions**:

- Cannot modify booking within 24 hours of check-in
- Cannot modify checked-in bookings

---

## III. Check-in

### Step 1: Verify Booking Status

**Endpoint**: `GET /employee/bookings/{bookingId}`

**Pre-Check-in Validations**:

- ✅ Booking status is `CONFIRMED`
- ✅ Deposit is `FULL` or acceptable balance
- ✅ Check-in date is today or earlier (with early check-in fee if applicable)
- ✅ Rooms are available and assigned

---

### Step 2: Create Additional Guests (if needed)

**Endpoint**: `POST /employee/customers`

Create customer records for all guests checking in (if not already in system).

```json
{
  "fullName": "Trần Thị B",
  "phone": "0907654321",
  "password": "password456",
  "email": "tranthib@example.com",
  "idNumber": "001234567891",
  "address": "456 Đường Nguyễn Huệ, Quận 1, TP.HCM"
}
```

---

### Step 3: Assign Rooms and Check-in

**Endpoint**: `POST /employee/bookings/check-in`

**Request Body**:

```json
{
  "checkInInfo": [
    {
      "bookingRoomId": "br_001",
      "roomId": "room_101",
      "customerIds": ["cust_001", "cust_002"]
    },
    {
      "bookingRoomId": "br_002",
      "roomId": "room_102",
      "customerIds": ["cust_003"]
    }
  ]
}
```

**Response**:

```json
{
  "bookingId": "booking_001",
  "status": "CHECKED_IN",
  "checkInTime": "2026-01-10T14:30:00.000Z",
  "rooms": [
    {
      "bookingRoomId": "br_001",
      "roomId": "room_101",
      "roomNumber": "101",
      "guests": ["Nguyễn Văn A", "Trần Thị B"]
    },
    {
      "bookingRoomId": "br_002",
      "roomId": "room_102",
      "roomNumber": "102",
      "guests": ["Nguyễn Văn C"]
    }
  ]
}
```

**Business Logic**:

- Can check-in multiple rooms in a single booking
- Each room can have multiple guests
- Room status changes: `AVAILABLE` → `OCCUPIED`
- Early check-in fee applied if before 14:00

**Note**: Partial check-in is supported (check-in some rooms, others later)

---

## IV. Service Usage (Optional)

### Step 1: List Available Services

**Endpoint**: `GET /employee/services`

**Response**:

```json
{
  "services": [
    {
      "serviceId": "svc_001",
      "name": "Room Service - Breakfast",
      "category": "FOOD_BEVERAGE",
      "price": 150000,
      "description": "Continental breakfast delivered to room"
    },
    {
      "serviceId": "svc_002",
      "name": "Laundry Service",
      "category": "LAUNDRY",
      "price": 50000,
      "unit": "per item"
    },
    {
      "serviceId": "svc_003",
      "name": "Spa Treatment",
      "category": "SPA",
      "price": 500000,
      "duration": "60 minutes"
    }
  ]
}
```

**Service Categories**: `FOOD_BEVERAGE`, `LAUNDRY`, `SPA`, `TRANSPORT`, `MINIBAR`, `OTHER`

---

### Step 2: Add Service to Booking

**Endpoint**: `POST /employee/bookings/{bookingId}/services`

**Request Body**:

```json
{
  "bookingRoomId": "br_001",
  "serviceId": "svc_001",
  "quantity": 2,
  "notes": "No sugar, extra milk"
}
```

**Response**:

```json
{
  "bookingServiceId": "bs_001",
  "serviceId": "svc_001",
  "serviceName": "Room Service - Breakfast",
  "quantity": 2,
  "unitPrice": 150000,
  "totalPrice": 300000,
  "status": "PENDING",
  "orderedAt": "2026-01-11T08:30:00.000Z"
}
```

---

### Step 3: View Booking Services

**Endpoint**: `GET /employee/bookings/{bookingId}/services`

**Response**:

```json
{
  "bookingId": "booking_001",
  "services": [
    {
      "bookingServiceId": "bs_001",
      "serviceName": "Room Service - Breakfast",
      "quantity": 2,
      "totalPrice": 300000,
      "status": "COMPLETED"
    },
    {
      "bookingServiceId": "bs_002",
      "serviceName": "Laundry Service",
      "quantity": 5,
      "totalPrice": 250000,
      "status": "COMPLETED"
    }
  ],
  "totalServiceCharges": 550000
}
```

---

### Step 4: Remove Service (if needed)

**Endpoint**: `DELETE /employee/bookings/{bookingId}/services/{serviceId}`

**Note**: Only services with status `PENDING` can be removed.

---

## V. Check-out

### Step 1: Get Final Bill

**Endpoint**: `GET /employee/bookings/{bookingId}/bill`

**Response**:

```json
{
  "bookingId": "booking_001",
  "customerId": "cust_001",
  "customerName": "Nguyễn Văn A",
  "checkInDate": "2026-01-10T14:30:00.000Z",
  "checkOutDate": "2026-01-15T12:00:00.000Z",
  "nights": 5,
  "roomCharges": 15000000,
  "serviceCharges": 550000,
  "earlyCheckInFee": 0,
  "lateCheckOutFee": 0,
  "subtotal": 15550000,
  "discounts": 0,
  "totalAmount": 15550000,
  "paidAmount": 4500000,
  "remainingBalance": 11050000,
  "breakdown": [
    {
      "description": "Room charges (2x Deluxe Room, 5 nights)",
      "amount": 15000000
    },
    {
      "description": "Room Service - Breakfast (2x)",
      "amount": 300000
    },
    {
      "description": "Laundry Service (5 items)",
      "amount": 250000
    },
    {
      "description": "Deposit paid",
      "amount": -4500000
    }
  ]
}
```

**Business Logic**:

- Includes all room charges based on nights stayed
- Includes all service charges
- Applies early check-in or late check-out fees if applicable
- Deducts deposits already paid
- Shows remaining balance to be paid

---

### Step 2: Confirm Final Payment

> **Frontend UI Flow**: After viewing the final bill, display a confirmation checkbox for the employee to confirm that the customer has paid the remaining balance. No amount input field should be shown.

**UI Components**:

- Display: Final bill breakdown (read-only, from `/bill` endpoint)
- Display: Remaining balance amount (read-only)
- ☐ Checkbox: "Confirm final payment received"
- Dropdown: Payment method selection
- Button: "Confirm Payment" (enabled only when checkbox is checked)

**Endpoint**: `POST /employee/transactions`

**Request Body**:

```json
{
  "bookingId": "booking_001",
  "paymentMethod": "CREDIT_CARD",
  "transactionType": "FINAL_PAYMENT"
}
```

> **Note**: No `amount` field is required. The backend automatically calculates the remaining balance to be paid.

**Response**:

```json
{
  "transactionId": "txn_002",
  "bookingId": "booking_001",
  "amount": 11050000,
  "paymentMethod": "CREDIT_CARD",
  "status": "COMPLETED",
  "remainingBalance": 0
}
```

**Backend Calculation**: Automatically calculates remaining balance = total amount - deposits paid - other payments.

**Validation**:

- ✅ Cannot check-out with unpaid balance
- ✅ Backend ensures full payment is collected

---

### Step 3: Check-out

**Endpoint**: `POST /employee/bookings/check-out`

**Request Body**:

```json
{
  "bookingRoomIds": ["br_001", "br_002"]
}
```

**Response**:

```json
{
  "bookingId": "booking_001",
  "status": "CHECKED_OUT",
  "checkOutTime": "2026-01-15T11:45:00.000Z",
  "finalAmount": 15550000,
  "paidAmount": 15550000,
  "rooms": [
    {
      "bookingRoomId": "br_001",
      "roomId": "room_101",
      "roomNumber": "101",
      "status": "CHECKED_OUT"
    },
    {
      "bookingRoomId": "br_002",
      "roomId": "room_102",
      "roomNumber": "102",
      "status": "CHECKED_OUT"
    }
  ]
}
```

**Business Logic**:

- Can check-out multiple rooms at once
- Room status changes: `OCCUPIED` → `CLEANING`
- After housekeeping completes cleaning: `CLEANING` → `AVAILABLE`
- Late check-out fee applied if after 12:00
- Booking status changes to `CHECKED_OUT`

**Note**: Partial check-out is supported (some rooms can check-out earlier)

---

## VI. Cancellation (Optional)

### Step 1: Calculate Refund Amount

**Endpoint**: `GET /employee/bookings/{bookingId}/cancellation-preview`

**Response**:

```json
{
  "bookingId": "booking_001",
  "totalAmount": 15000000,
  "paidAmount": 4500000,
  "cancellationFee": 0,
  "refundAmount": 4500000,
  "refundPercentage": 100,
  "policy": "Free cancellation (48+ hours before check-in)"
}
```

**Cancellation Fee Calculation**:

- 48+ hours before check-in: 0% fee (100% refund)
- 24-48 hours before check-in: 50% fee (50% refund)
- <24 hours before check-in: 100% fee (0% refund)

---

### Step 2: Cancel Booking

**Endpoint**: `POST /employee/bookings/{bookingId}/cancel`

**Request Body**:

```json
{
  "reason": "Customer request - change of plans",
  "cancelledBy": "employee_001"
}
```

**Response**:

```json
{
  "bookingId": "booking_001",
  "status": "CANCELLED",
  "cancelledAt": "2026-01-08T10:00:00.000Z",
  "refundAmount": 4500000,
  "refundStatus": "PENDING"
}
```

**Business Logic**:

- Booking status changes to `CANCELLED`
- Rooms are released back to inventory
- Room status changes: `RESERVED` → `AVAILABLE`

**Restrictions**:

- Cannot cancel `CHECKED_IN` or `CHECKED_OUT` bookings
- Cannot cancel if check-in date has passed

---

### Step 3: Process Refund

**Endpoint**: `POST /employee/transactions/refund`

**Request Body**:

```json
{
  "bookingId": "booking_001",
  "refundMethod": "ORIGINAL_PAYMENT_METHOD",
  "notes": "Cancellation refund as per policy"
}
```

> **Note**: No `amount` field is required. The backend automatically calculates the refund amount based on the cancellation policy and timing.

**Response**:

```json
{
  "refundId": "ref_001",
  "bookingId": "booking_001",
  "amount": 4500000,
  "refundMethod": "CREDIT_CARD",
  "status": "COMPLETED",
  "processedAt": "2026-01-08T10:05:00.000Z"
}
```

**Refund Methods**: `ORIGINAL_PAYMENT_METHOD`, `CASH`, `BANK_TRANSFER`

---

## Error Handling

### Common Error Codes

#### Reservation Errors

- `400` - Invalid date range (check-out before check-in)
- `404` - Room type not found
- `409` - Room unavailable for selected dates
- `422` - Insufficient room capacity for guest count

#### Payment Errors

- `400` - Insufficient deposit amount
- `402` - Payment required
- `404` - Invalid promotion code
- `500` - Payment gateway failure

#### Check-in Errors

- `400` - Booking not confirmed
- `402` - Insufficient deposit paid
- `409` - Room not available
- `422` - Early check-in not allowed without fee

#### Check-out Errors

- `402` - Unpaid balance remaining
- `409` - Cannot check-out, services still pending
- `422` - Late check-out fee not paid

#### Cancellation Errors

- `400` - Cannot cancel checked-in booking
- `422` - Cancellation deadline passed

### Error Response Format

```json
{
  "error": {
    "code": "ROOM_UNAVAILABLE",
    "message": "Selected room type is not available for the chosen dates",
    "details": {
      "roomTypeId": "rt_001",
      "requestedDates": "2026-01-10 to 2026-01-15",
      "nextAvailableDate": "2026-01-16"
    }
  }
}
```

---

## Room Management Integration

### Room Statuses

- `AVAILABLE` - Ready for new guests
- `RESERVED` - Booked but not checked in
- `OCCUPIED` - Currently in use
- `CLEANING` - Being cleaned after check-out
- `MAINTENANCE` - Under repair, not bookable
- `OUT_OF_SERVICE` - Temporarily unavailable

### Housekeeping Flow

1. **After Check-out**: Room status → `CLEANING`
2. **Staff Updates**: `PATCH /employee/rooms/{roomId}/status` → `AVAILABLE`
3. **Room Ready**: Available for next booking

**Endpoint**: `GET /employee/rooms`

**Response**:

```json
{
  "rooms": [
    {
      "roomId": "room_101",
      "roomNumber": "101",
      "roomTypeId": "rt_001",
      "roomTypeName": "Deluxe Room",
      "status": "AVAILABLE",
      "floor": 1
    },
    {
      "roomId": "room_102",
      "roomNumber": "102",
      "roomTypeId": "rt_001",
      "roomTypeName": "Deluxe Room",
      "status": "OCCUPIED",
      "floor": 1,
      "currentBookingId": "booking_001"
    }
  ]
}
```

---

## Complete Use Case Example

### Scenario: 2 Guests, 1 Room, 3 Nights with Services

**Timeline**: Jan 10-13, 2026

#### 1. Reservation (Jan 5)

```
GET /employee/room-types/availability?checkInDate=2026-01-10&checkOutDate=2026-01-13
POST /employee/customers (if new)
POST /employee/bookings
POST /employee/transactions (transactionType: DEPOSIT, backend calculates 30% = 1,350,000 VND)
→ Booking Status: CONFIRMED
```

#### 2. Check-in (Jan 10, 14:00)

```
GET /employee/bookings/{bookingId}
POST /employee/bookings/check-in
→ Booking Status: CHECKED_IN
→ Room Status: OCCUPIED
```

#### 3. Service Usage (Jan 11-12)

```
POST /employee/bookings/{bookingId}/services (Breakfast x2)
POST /employee/bookings/{bookingId}/services (Laundry x1)
→ Service Charges: 350,000 VND
```

#### 4. Check-out (Jan 13, 11:30)

```
GET /employee/bookings/{bookingId}/bill
→ Total: 4,850,000 VND
→ Paid: 1,350,000 VND
→ Balance: 3,500,000 VND

POST /employee/transactions (transactionType: FINAL_PAYMENT, backend calculates balance)
POST /employee/bookings/check-out
→ Booking Status: CHECKED_OUT
→ Room Status: CLEANING
```

**Final Bill Breakdown**:

- Room charges (3 nights × 1,500,000): 4,500,000 VND
- Breakfast (2×): 300,000 VND
- Laundry: 50,000 VND
- **Total**: 4,850,000 VND
- Deposit paid: -1,350,000 VND
- **Balance paid**: 3,500,000 VND

---

## API Endpoints Summary

### Customer Management

- `POST /employee/customers` - Create customer
- `GET /employee/customers?phone={phone}` - Find customer

### Booking Management

- `GET /employee/room-types/availability` - Check availability
- `POST /employee/bookings` - Create booking
- `GET /employee/bookings/{bookingId}` - Get booking details
- `PATCH /employee/bookings/{bookingId}` - Modify booking
- `POST /employee/bookings/check-in` - Check-in
- `POST /employee/bookings/check-out` - Check-out
- `GET /employee/bookings/{bookingId}/bill` - Get final bill
- `GET /employee/bookings/{bookingId}/cancellation-preview` - Preview cancellation
- `POST /employee/bookings/{bookingId}/cancel` - Cancel booking

### Payment Management

- `POST /employee/transactions` - Make payment
- `POST /employee/transactions/refund` - Process refund

### Service Management

- `GET /employee/services` - List services
- `POST /employee/bookings/{bookingId}/services` - Add service
- `GET /employee/bookings/{bookingId}/services` - Get booking services
- `DELETE /employee/bookings/{bookingId}/services/{serviceId}` - Remove service

### Room Management

- `GET /employee/rooms` - List all rooms
- `GET /employee/rooms/available` - Get available rooms
- `PATCH /employee/rooms/{roomId}/status` - Update room status

---

## Notes for Backend Implementation

1. **Transaction Atomicity**: Ensure booking creation and room reservation are atomic operations
2. **Concurrency Control**: Implement locking mechanism for room availability checks
3. **Audit Trail**: Log all booking modifications, payments, and status changes
4. **Idempotency**: Payment endpoints should be idempotent to prevent double charges
5. **Validation**: Implement server-side validation for all business rules
6. **Notifications**: Trigger email/SMS notifications for booking confirmations, check-in reminders, etc.
7. **Reporting**: Maintain aggregated data for occupancy rates, revenue, and analytics

---

**Document Version**: 2.0  
**Last Updated**: January 8, 2026  
**Status**: Complete Implementation Guide
