# Booking Flow Implementation - Quick Reference

## Files Created/Modified

### ✅ New Files Created

1. **`lib/services/transaction.service.ts`** - Complete transaction handling (deposit, payment, refund, bill)
2. **`components/reservations/deposit-confirmation-modal.tsx`** - UI for confirming deposit after booking
3. **`components/checkin-checkout/final-payment-modal.tsx`** - UI for final payment before check-out
4. **`IMPLEMENTATION_PROGRESS.md`** - Detailed progress report and next steps

### ✅ Files Modified

1. **`lib/services/booking.service.ts`** - Added 6 new methods:
   - `getRoomTypeAvailability()`
   - `addService()`
   - `getBookingServices()`
   - `removeService()`
   - `getCancellationPreview()`
2. **`lib/services/index.ts`** - Added export for `transactionService`

## Key API Methods Available

### Transaction Service

```typescript
import { transactionService } from "@/lib/services";

// Create deposit/payment (NO amount field - auto-calculated)
await transactionService.createTransaction({
  bookingId: "booking_001",
  paymentMethod: "CASH",
  transactionType: "DEPOSIT",
});

// Get final bill
const bill = await transactionService.getBill(bookingId);

// Process refund (NO amount field - auto-calculated)
await transactionService.processRefund({
  bookingId: "booking_001",
  refundMethod: "CASH",
});
```

### Booking Service Extensions

```typescript
import { bookingService } from "@/lib/services";

// Check room type availability
const available = await bookingService.getRoomTypeAvailability(
  "2026-01-10T14:00:00.000Z",
  "2026-01-15T12:00:00.000Z"
);

// Add service to booking
await bookingService.addService(bookingId, {
  bookingRoomId: "br_001",
  serviceId: "svc_001",
  quantity: 2,
  notes: "Extra towels",
});

// Get booking services
const services = await bookingService.getBookingServices(bookingId);

// Preview cancellation
const preview = await bookingService.getCancellationPreview(bookingId);
```

## UI Components Usage

### Deposit Confirmation Modal

```tsx
import { DepositConfirmationModal } from "@/components/reservations/deposit-confirmation-modal";

<DepositConfirmationModal
  isOpen={showDepositModal}
  onClose={() => setShowDepositModal(false)}
  onSuccess={handleDepositSuccess}
  bookingId="booking_001"
  bookingCode="BK001"
  totalAmount={15000000}
  depositRequired={4500000}
  customerName="Nguyễn Văn A"
/>;
```

### Final Payment Modal

```tsx
import { FinalPaymentModal } from "@/components/checkin-checkout/final-payment-modal";

<FinalPaymentModal
  isOpen={showPaymentModal}
  onClose={() => setShowPaymentModal(false)}
  onSuccess={handlePaymentSuccess}
  bookingId="booking_001"
  bookingCode="BK001"
/>;
```

## Next Steps for Integration

### 1. Reservations Page Integration

**File:** `app/(dashboard)/reservations/page.tsx`

Add after booking creation:

```typescript
// State
const [showDepositModal, setShowDepositModal] = useState(false);
const [pendingBooking, setPendingBooking] = useState(null);

// After createBooking success
setPendingBooking(response);
setShowDepositModal(true);

// Modal JSX
<DepositConfirmationModal
  isOpen={showDepositModal}
  onClose={() => setShowDepositModal(false)}
  onSuccess={async () => {
    await loadBookings();
    setShowDepositModal(false);
  }}
  bookingId={pendingBooking?.bookingId}
  bookingCode={pendingBooking?.bookingCode}
  totalAmount={pendingBooking?.totalAmount}
  depositRequired={pendingBooking?.depositRequired}
  customerName={formData.customerName}
/>;
```

### 2. Check-out Page Integration

**File:** Check-out tab component

Add before check-out:

```typescript
// State
const [showPaymentModal, setShowPaymentModal] = useState(false);

// Before check-out
const handleViewBill = () => {
  setShowPaymentModal(true);
};

// After payment success
const handlePaymentSuccess = async () => {
  setShowPaymentModal(false);
  // Proceed with check-out
  await handleCheckOut();
};

// Modal JSX
<FinalPaymentModal
  isOpen={showPaymentModal}
  onClose={() => setShowPaymentModal(false)}
  onSuccess={handlePaymentSuccess}
  bookingId={selectedBooking?.id}
  bookingCode={selectedBooking?.bookingCode}
/>;
```

## Complete Booking Flow Diagram

```
1. RESERVATION
   └─> Create Booking
       └─> Deposit Confirmation Modal ✅
           └─> Transaction API (DEPOSIT) ✅
               └─> Status: PENDING → CONFIRMED

2. CHECK-IN
   └─> Search Confirmed Bookings
       └─> Assign Rooms
           └─> Status: CONFIRMED → CHECKED_IN

3. SERVICES (Optional)
   └─> Add Service Modal (TODO)
       └─> Add Service API ✅
           └─> Services recorded

4. CHECK-OUT
   └─> Final Payment Modal ✅
       └─> Get Bill API ✅
           └─> Transaction API (FINAL_PAYMENT) ✅
               └─> Check-out API
                   └─> Status: CHECKED_IN → CHECKED_OUT

5. CANCELLATION (Optional)
   └─> Cancellation Preview Modal (TODO)
       └─> Preview API ✅
           └─> Refund API ✅
               └─> Status: * → CANCELLED
```

## CRITICAL Design Principles

### ❌ NEVER Do This

```typescript
// DON'T send amount in transaction request
await transactionService.createTransaction({
  bookingId: "booking_001",
  amount: 4500000, // ❌ WRONG
  paymentMethod: "CASH",
});
```

### ✅ Always Do This

```typescript
// Backend auto-calculates amount
await transactionService.createTransaction({
  bookingId: "booking_001",
  paymentMethod: "CASH",
  transactionType: "DEPOSIT", // Backend knows this = 30% minimum
});
```

### UI Rules

1. **NO** amount input fields
2. **YES** payment method dropdown
3. **YES** confirmation checkbox
4. **YES** display calculated amounts (read-only)

## Testing Commands

```bash
# Run dev server
pnpm run dev

# Test transaction flow
# 1. Go to /reservations
# 2. Create new booking
# 3. Deposit modal should appear
# 4. Confirm deposit
# 5. Check booking status = CONFIRMED

# Test check-out flow
# 1. Go to /checkin-checkout
# 2. Search checked-in booking
# 3. Click "View Bill"
# 4. Confirm payment
# 5. Proceed with check-out
```

## Backend API Checklist

Test these endpoints:

- [ ] `POST /employee/transactions`
- [ ] `GET /employee/bookings/{id}/bill`
- [ ] `POST /employee/transactions/refund`
- [ ] `GET /employee/room-types/availability`
- [ ] `POST /employee/bookings/{id}/services`
- [ ] `GET /employee/bookings/{id}/services`
- [ ] `DELETE /employee/bookings/{id}/services/{serviceId}`
- [ ] `GET /employee/bookings/{id}/cancellation-preview`

## Common Issues & Solutions

### Issue: Modal not showing

**Solution:** Check state management, ensure modal open state is true

### Issue: Amount not auto-calculated

**Solution:** Check backend response, verify transactionType is correct

### Issue: Payment method not saving

**Solution:** Verify PaymentMethod enum matches backend exactly

### Issue: Bill not loading

**Solution:** Check bookingId is valid, check network tab for errors

---

**Quick Start:** See `IMPLEMENTATION_PROGRESS.md` for detailed implementation guide.
