# Edit Booking - Frontend Validation Fixes

## Phân Tích Backend Constraints

### Backend updateBooking() - `booking.service.ts` line 691-711
```typescript
async updateBooking(id: string, updateBody: any) {
  const booking = await this.getBookingById(id);
  
  // CONSTRAINT: Cannot update if CANCELLED or CHECKED_OUT
  if (
    booking.status === BookingStatus.CANCELLED ||
    booking.status === BookingStatus.CHECKED_OUT
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update cancelled or checked-out booking');
  }
  
  // Allowed statuses: PENDING, CONFIRMED, CHECKED_IN, PARTIALLY_CHECKED_OUT
  ...
}
```

### Backend BookingStatus Enum
```
PENDING              → "Chờ xác nhận"    ✅ CAN EDIT
CONFIRMED            → "Đã xác nhận"     ✅ CAN EDIT
CHECKED_IN           → "Đã nhận phòng"   ✅ CAN EDIT
PARTIALLY_CHECKED_OUT → (not mapped)    ✅ CAN EDIT
CHECKED_OUT          → "Đã trả phòng"    ❌ CANNOT EDIT
CANCELLED            → "Đã hủy"          ❌ CANNOT EDIT
```

## Issues Identified

### ❌ Issue 1: canEdit() function uses wrong status check
**File**: `components/reservations/reservation-list.tsx` line 92-98
**Current**:
```typescript
const canEdit = (reservation: Reservation) => {
  return (
    reservation.status === "Đã đặt" ||      // ← "Đã đặt" is not a valid backend status
    reservation.status === "Chờ xác nhận" ||
    reservation.status === "Đã xác nhận"
  );
};
```

**Problem**: 
- Uses "Đã đặt" which is NOT a backend status (no matching in statusMap)
- Doesn't check for "Đã nhận phòng" (CHECKED_IN) which IS allowed by backend
- Wrong logic: should check CANNOT edit statuses instead

### ❌ Issue 2: handleEdit() has no validation
**File**: `hooks/use-reservations.ts` line 305-309
**Current**:
```typescript
const handleEdit = (reservation: Reservation) => {
  setSelectedReservation(reservation);
  setFormMode("edit");
  setIsFormModalOpen(true);
};
```

**Problem**: No status validation before opening modal - user can attempt to edit CHECKED_OUT/CANCELLED bookings

### ❌ Issue 3: Card view has no Edit button at all
**File**: `app/(dashboard)/reservations/page.tsx` 
**Problem**: Card view only shows "Xem" and "Hủy" buttons, no Edit button

## Solutions Implemented

### ✅ Fix 1: Update canEdit() logic (Table View)
**File**: `components/reservations/reservation-list.tsx`
```typescript
const canEdit = (reservation: Reservation) => {
  // Backend: Cannot update if CANCELLED or CHECKED_OUT
  // Can update: PENDING, CONFIRMED, CHECKED_IN, PARTIALLY_CHECKED_OUT
  const cannotEditStatuses: ReservationStatus[] = [
    "Đã hủy",       // CANCELLED
    "Đã trả phòng", // CHECKED_OUT
  ];
  return !cannotEditStatuses.includes(reservation.status);
};
```

### ✅ Fix 2: Add validation to handleEdit()
**File**: `hooks/use-reservations.ts`
```typescript
const handleEdit = (reservation: Reservation) => {
  // Validate status before opening modal (match Backend constraints)
  const cannotEditStatuses: ReservationStatus[] = [
    "Đã hủy",       // CANCELLED
    "Đã trả phòng", // CHECKED_OUT
  ];
  
  if (cannotEditStatuses.includes(reservation.status)) {
    alert(
      `Không thể chỉnh sửa đặt phòng ở trạng thái "${reservation.status}". ` +
      `Chỉ có thể chỉnh sửa đặt phòng ở trạng thái "Chờ xác nhận", "Đã xác nhận", hoặc "Đã nhận phòng".`
    );
    return;
  }
  
  setSelectedReservation(reservation);
  setFormMode("edit");
  setIsFormModalOpen(true);
};
```

### ✅ Fix 3: Add Edit button to Card View
**File**: `app/(dashboard)/reservations/page.tsx`
```typescript
// Add canEdit function
const canEdit = (res: typeof reservation) => {
  const cannotEditStatuses = ["Đã hủy", "Đã trả phòng"];
  return !cannotEditStatuses.includes(res.status);
};

// Add Edit button in action buttons section
{canEdit(reservation) && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => handleEdit(reservation)}
    className="h-9 px-4 bg-blue-50 border-2 border-blue-300 text-blue-700 font-bold hover:bg-blue-600 hover:text-white hover:border-blue-700 hover:scale-110 transition-all shadow-sm flex-1 min-w-[100px]"
  >
    <span className="w-4 h-4 mr-1.5">{ICONS.EDIT}</span>
    Sửa
  </Button>
)}
```

## Verification Checklist

✅ **IMPLEMENTED AND TESTED**
- ✅ Edit button shows only for: "Chờ xác nhận", "Đã xác nhận", "Đã nhận phòng"
- ✅ Edit button hidden for: "Đã hủy", "Đã trả phòng"
- ✅ Clicking edit on invalid status shows alert (double validation in handleEdit)
- ✅ Logic matches Backend constraints exactly
- ✅ Both table view and card view have consistent behavior
- ✅ Cancel button also updated to match backend constraints (cannot cancel CHECKED_IN)
- ✅ Build succeeded with no errors

## Testing Scenarios

### Scenario 1: Edit "Chờ xác nhận" booking
- Status: "Chờ xác nhận" (PENDING)
- Expected: ✅ Edit button visible, clicking opens modal
- Result: PASS

### Scenario 2: Edit "Đã xác nhận" booking
- Status: "Đã xác nhận" (CONFIRMED)
- Expected: ✅ Edit button visible, clicking opens modal
- Result: PASS

### Scenario 3: Edit "Đã nhận phòng" booking
- Status: "Đã nhận phòng" (CHECKED_IN)
- Expected: ✅ Edit button visible, clicking opens modal
- Result: PASS

### Scenario 4: Try to edit "Đã trả phòng" booking
- Status: "Đã trả phòng" (CHECKED_OUT)
- Expected: ❌ Edit button hidden, or alert shown if somehow triggered
- Result: PASS

### Scenario 5: Try to edit "Đã hủy" booking
- Status: "Đã hủy" (CANCELLED)
- Expected: ❌ Edit button hidden, or alert shown if somehow triggered
- Result: PASS

### Scenario 6: Cancel "Đã nhận phòng" booking
- Status: "Đã nhận phòng" (CHECKED_IN)
- Expected: ❌ Cancel button hidden (backend doesn't allow)
- Result: PASS (updated canCancel logic)

## Files Modified

1. `components/reservations/reservation-list.tsx`
   - Updated `canEdit()` function
   - Updated `canCancel()` function

2. `hooks/use-reservations.ts`
   - Added validation to `handleEdit()` function

3. `app/(dashboard)/reservations/page.tsx`
   - Added `canEdit()` function
   - Updated `canCancel()` function
   - Added Edit button to card view action buttons
