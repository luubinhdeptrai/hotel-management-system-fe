# Phân Tích Nghiệp Vụ Reservation (Đặt Phòng)

## 🎯 Mục Tiêu
Đối chiếu modal "Chỉnh sửa Đặt Phòng" Frontend với Backend API để xác định:
- Trường dữ liệu nào đã đúng
- Logic nghiệp vụ nào sai
- Điều kiện chỉnh sửa nào bị thiếu

---

## 📊 BACKEND - Source of Truth

### A. Data Model (Prisma Schema)

**Booking Model (Chính)**
```
- id: String (Primary Key)
- bookingCode: String (Unique)
- status: BookingStatus (PENDING | CONFIRMED | CHECKED_IN | PARTIALLY_CHECKED_OUT | CHECKED_OUT | CANCELLED)
- primaryCustomerId: String (FK → Customer)
- checkInDate: DateTime
- checkOutDate: DateTime
- totalGuests: Int
- totalAmount: Decimal
- depositRequired: Decimal
- totalDeposit: Decimal
- totalPaid: Decimal
- balance: Decimal
- createdAt: DateTime
- updatedAt: DateTime
- Relations: bookingRooms[], bookingCustomers[], transactions[], serviceUsages[]
```

**BookingRoom Model (Chi tiết từng phòng)**
```
- id: String (Primary Key)
- bookingId: String (FK → Booking)
- roomId: String (FK → Room)
- roomTypeId: String (FK → RoomType)
- checkInDate: DateTime
- checkOutDate: DateTime
- actualCheckIn: DateTime (nullable)
- actualCheckOut: DateTime (nullable)
- pricePerNight: Decimal
- depositAmount: Decimal
- subtotalRoom: Decimal
- subtotalService: Decimal
- totalAmount: Decimal
- totalPaid: Decimal
- balance: Decimal
- status: BookingStatus
- createdAt: DateTime
- updatedAt: DateTime
```

**BookingCustomer Model**
```
- id: String
- bookingId: String (FK → Booking)
- customerId: String (FK → Customer)
- bookingRoomId: String? (FK → BookingRoom) - nullable, khách có thể ở phòng nào
- isPrimary: Boolean
```

### B. API Endpoints (Employee)

**1. Create Booking**
- Route: `POST /employee/bookings`
- Input: CreateBookingRequest
  ```
  - customerId OR customer object (new customer data)
  - rooms: { roomId: string }[]
  - checkInDate: DateTime
  - checkOutDate: DateTime
  - totalGuests: Int
  ```
- Behavior:
  - Tạo Booking record
  - Tạo BookingRoom record cho mỗi phòng
  - Trạng thái ban đầu: PENDING (1 tiếng)
  - Nếu không confirm cọc, sẽ expire
  - Return: { bookingId, bookingCode, expiresAt, totalAmount }

**2. Update Booking**
- Route: `PUT /employee/bookings/:id`
- Input: Bất kỳ trường nào (generic update)
- Constraints:
  - ❌ Cannot update if status = CANCELLED
  - ❌ Cannot update if status = CHECKED_OUT
  - ✅ Can update if status = PENDING, CONFIRMED, CHECKED_IN
- Fields that can be updated:
  - checkInDate, checkOutDate
  - totalGuests
  - và bất kỳ trường nào khác (no validation)
- **⚠️ VẤN ĐỀ**: Endpoint này rất đơn giản, không hỗ trợ:
  - Thay đổi phòng (rooms)
  - Logic check availability
  - Cập nhật BookingRoom records

**3. Cancel Booking**
- Route: `POST /employee/bookings/:id/cancel`
- Constraints:
  - ❌ Cannot cancel if status = CANCELLED
  - ❌ Cannot cancel if status = CHECKED_IN
  - ❌ Cannot cancel if status = CHECKED_OUT
  - ✅ Can cancel if status = PENDING, CONFIRMED
- Side effects:
  - Cập nhật Booking.status → CANCELLED
  - Cập nhật BookingRoom.status → CANCELLED
  - Release rooms (Room.status → AVAILABLE)

**4. Check In**
- Route: `POST /employee/bookings/check-in-rooms`
- Input:
  ```
  checkInInfo: [
    { bookingRoomId: string, customerIds: string[] }
  ]
  ```
- Constraints:
  - Booking room must be CONFIRMED
  - Customers must exist
- Side effects:
  - BookingRoom.status → CHECKED_IN
  - BookingRoom.actualCheckIn = now
  - Room.status → OCCUPIED
  - Tạo BookingCustomer records

**5. Check Out**
- Route: `POST /employee/bookings/check-out-rooms`
- Input: bookingRoomIds[]
- Side effects:
  - BookingRoom.status → CHECKED_OUT
  - BookingRoom.actualCheckOut = now
  - Room.status → AVAILABLE

### C. Booking Status Flow (BE)

```
CREATE (PENDING)
    ↓
    ├─→ confirm deposit (transaction created) → CONFIRMED
    │    ↓
    │    └─→ check in → CHECKED_IN
    │         ↓
    │         ├─→ check out all → CHECKED_OUT
    │         └─→ check out some → PARTIALLY_CHECKED_OUT
    │
    └─→ cancel → CANCELLED
```

---

## 🖥️ FRONTEND - Current Implementation

### File Structure
```
hooks/use-reservations.ts - Main business logic
├── handleSaveReservation()
│   ├── formMode === "create" → createBooking()
│   └── formMode === "edit" → updateBooking() + updateCustomer()
├── handleEdit() - Open edit modal
└── handleCancelClick() - Cancel booking

components/reservations/new-reservation-form-modal.tsx
├── 3-step form: customer → rooms → summary
├── onSave callback
└── mode: "create" | "edit"
```

### Current Form Data Structure (FE)

**ReservationFormData**
```
{
  customerName: string
  phoneNumber: string
  email: string
  identityCard: string
  address: string
  checkInDate: string (YYYY-MM-DD)
  checkOutDate: string (YYYY-MM-DD)
  roomSelections: {
    roomTypeID: string
    roomTypeName: string
    quantity: number
    numberOfGuests: number
    pricePerNight: number
    checkInDate: string
    checkOutDate: string
    roomID: string  ← THIS IS IMPORTANT
  }[]
  depositAmount: number
  notes: string
  depositConfirmed: boolean
  depositPaymentMethod: "CASH" | "CREDIT_CARD" | ...
  customerSelection: {
    useExisting: boolean
    customerId?: string
  }
}
```

### Current Logic for Update

**File: `hooks/use-reservations.ts` Lines 547-750**

```typescript
// Update path:
1. updateCustomer (if customer data changed) → customer.service.updateCustomer()
2. updateBooking (dates/guests) → bookingService.updateBooking()
3. If deposit newly confirmed → transactionService.createTransaction()
4. Update local state
```

**Issues Found:**

❌ **Issue 1: Thay đổi phòng không được hỗ trợ**
- Modal cho phép chọn lại phòng trong edit mode
- FE gửi roomSelections với roomID mới
- **Backend updateBooking() không cập nhật BookingRoom records**
- Chỉ có generic update cho trường checkInDate/checkOutDate
- BookingRoom relationships không được thay đổi

❌ **Issue 2: Không kiểm tra điều kiện edit**
- BE: Cannot update if status = CANCELLED hoặc CHECKED_OUT
- FE: Không kiểm tra status trước khi mở edit modal
- Có thể mở form edit cho booking đã CHECKED_OUT (sẽ fail ở BE)
- UX tệ: người dùng không biết tại sao update lại bị error

❌ **Issue 3: Validation điều kiện edit không hoàn chỉnh**
- BE: Can update if PENDING | CONFIRMED | CHECKED_IN
- FE: Không có logic để disable edit cho statuses không cho phép
- Modal không thông báo "Booking này không thể chỉnh sửa nữa"

❌ **Issue 4: Thay đổi checkInDate/checkOutDate của từng room**
- Mỗi BookingRoom có checkInDate/checkOutDate riêng
- FE chỉ gửi checkInDate/checkOutDate chung cho Booking
- Không cập nhật từng BookingRoom
- **Backend updateBooking() không có logic update BookingRoom.checkInDate/checkOutDate**

❌ **Issue 5: Cancel booking có logic khác ở BE**
- BE: Cannot cancel if CHECKED_IN hoặc CHECKED_OUT
- FE: Không kiểm tra điều kiện này
- FE: Không pass vào "reason" (FE call có, nhưng BE cancelBooking() không nhận)
- Function signature khác nhau

❌ **Issue 6: Deposit confirmation logic phức tạp**
- FE: Check `wasDepositConfirmed = status === "Đã xác nhận" | "Đã đặt" | "Đã nhận phòng"`
- BE: Status values = PENDING | CONFIRMED | CHECKED_IN | PARTIALLY_CHECKED_OUT | CHECKED_OUT | CANCELLED
- FE status mapping không chính xác
- Logic "newly confirmed" dựa vào status - có thể bị sai nếu user update lại

❌ **Issue 7: Không xử lý BookingCustomer relationship**
- BE có BookingCustomer table để map khách với phòng
- FE không tạo BookingCustomer khi edit booking
- Check-in sẽ cần BookingCustomer - nếu edit nhưng không update customers → check-in sẽ fail

---

## ✅ WHAT'S CORRECT

✅ **Booking Creation**
- FE correctly creates booking with specific room IDs
- Correct payload format for createBooking
- Handle customer selection (new vs existing)
- Calculate total guests correctly

✅ **Customer Update**
- FE correctly updates customer if data changed
- Uses customer service properly
- Handles customer not found gracefully

✅ **Status Mapping (partially)**
- FE maps backend statuses to Vietnamese labels
- But status check logic uses Vi labels instead of BE values

✅ **Deposit Transaction**
- FE correctly creates deposit transaction after booking
- Uses transactionService properly
- Pass correct payment method

---

## 🔧 REQUIRED FIXES

### Fix 1: Add Edit Condition Validation
**File**: `components/reservations/new-reservation-form-modal.tsx`
**Action**: Add check before allowing edit
```tsx
// Check if booking status allows editing
const canEdit = !["CHECKED_OUT", "CANCELLED"].includes(reservation?.status);

if (!canEdit) {
  return <Alert>Không thể chỉnh sửa đặt phòng này</Alert>;
}
```

### Fix 2: Update Cancel Logic
**File**: `hooks/use-reservations.ts` (handleConfirmCancel function)
**Action**: Match BE constraints
```tsx
// Before cancelling, check status
const canCancel = !["CANCELLED", "CHECKED_IN", "CHECKED_OUT"].includes(
  selectedReservation.status
);

if (!canCancel) {
  toast.error("Không thể hủy đặt phòng ở trạng thái này");
  return;
}
```

### Fix 3: Update Deposit Confirmation Logic
**File**: `hooks/use-reservations.ts` (handleSaveReservation edit path)
**Action**: Use BE status values, not Vietnamese labels
```tsx
// Check if deposit was already confirmed (using BE status)
const wasDepositConfirmed = 
  ["CONFIRMED", "CHECKED_IN", "PARTIALLY_CHECKED_OUT"].includes(
    selectedReservation.status  // Use booking status from BE directly
  );
```

### Fix 4: Handle Room Change in Edit
**File**: `hooks/use-reservations.ts`
**Action**: Add note/warning that changing rooms is complex
- Current BE updateBooking() doesn't support room changes
- Would need to:
  1. Delete old BookingRooms
  2. Create new BookingRooms
  3. Handle availability check
- **Recommendation**: For now, disable room selection in edit mode
- Only allow edit of: customer info, checkIn/checkOut dates, guests, notes

```tsx
// In edit mode, disable room selector
if (formMode === "edit") {
  // Only show selected rooms, don't allow changes
  // Only allow edit: customer, dates, guests, notes
}
```

### Fix 5: Update Status Mapping
**File**: `hooks/use-reservations.ts` (convertBookingToReservation)
**Action**: Use BE status directly in comparison
```tsx
// Don't convert to Vietnamese for status checks
// Keep original BE status values for logic operations
// Convert to Vietnamese ONLY for display

// For logic:
if (booking.status === "CANCELLED") { ... }

// For display:
statusDisplay = {
  "PENDING": "Chờ xác nhận",
  "CONFIRMED": "Đã xác nhận",
  "CHECKED_IN": "Đã nhận phòng",
  ...
}[booking.status]
```

### Fix 6: Add Check-in Readiness Validation
**File**: `hooks/use-reservations.ts` or `components/reservations/`
**Action**: Before check-in, validate:
- Booking status = CONFIRMED (only CONFIRMED can be checked in)
- All BookingRooms exist and are CONFIRMED

### Fix 7: Update Booking Customer Associations
**File**: `hooks/use-reservations.ts`
**Status**: This is complex, depends on user flow for assigning customers to rooms
**Note**: For now, if not implemented, document as BE issue

---

## 📋 SUMMARY TABLE

| Feature | BE API | FE Current | Status | Fix Priority |
|---------|--------|-----------|--------|--------------|
| Edit Customer Info | ✅ supported | ✅ correct | ✅ OK | N/A |
| Edit Check-in/out Dates | ✅ (partial*) | ✅ attempted | ⚠️ Partial | HIGH |
| Edit Rooms | ❌ not supported | ❌ attempted | ❌ BROKEN | HIGH |
| Edit Guests | ✅ supported | ✅ correct | ✅ OK | N/A |
| Edit Notes | ? | ✅ attempted | ? | MEDIUM |
| Cancel Booking | ✅ with constraints | ⚠️ no validation | ❌ RISKY | HIGH |
| Create Deposit | ✅ via transaction | ✅ correct | ✅ OK | N/A |
| Edit Deposit Confirmation | ⚠️ limited | ⚠️ complex logic | ⚠️ UNCLEAR | HIGH |
| Status Validation | ✅ checked | ❌ not checked | ❌ BROKEN | HIGH |
| Room Availability Check | ✅ in create | ❌ in edit | ❌ MISSING | HIGH |

(*) BE updateBooking() doesn't validate available rooms or check overlapping bookings

---

## 🎯 IMMEDIATE ACTION ITEMS

1. **HIGH PRIORITY - Status Validation**
   - Add modal checks to prevent editing CANCELLED/CHECKED_OUT bookings
   - Disable edit button in UI if status doesn't allow

2. **HIGH PRIORITY - Room Change Limitation**
   - Disable room selector in edit mode
   - Show as read-only "Selected Rooms"
   - Add note: "Để thay đổi phòng, hãy hủy và tạo đặt phòng mới"

3. **HIGH PRIORITY - Cancel Validation**
   - Check status before allowing cancel
   - Update constraints: CHECKED_IN, CHECKED_OUT, CANCELLED cannot be cancelled

4. **MEDIUM PRIORITY - Deposit Logic**
   - Clarify when deposit should be paid
   - Use BE status values for status checks
   - Remove Vietnamese label dependencies for logic

5. **MEDIUM PRIORITY - Check-in Validation**
   - Before check-in, ensure booking is CONFIRMED
   - Show error if not ready to check in

---

## 🐛 Issues to Report in Bugs_For_BE.md

### Issue: updateBooking() endpoint doesn't support complex edits
**Severity**: MEDIUM
**Description**: Backend updateBooking() is generic and doesn't:
- Update individual BookingRoom records
- Validate room availability when dates change
- Support changing rooms
- Handle BookingCustomer associations
**Impact**: FE cannot properly edit booking with room changes
**Recommendation**: Either:
1. Enhance updateBooking() to handle room changes
2. Create separate endpoints: updateBookingDates, updateBookingRooms, etc.
3. Or document that only simple edits are supported (customer, dates, guests)

### Issue: BookingCustomer relationship not managed in create/update
**Severity**: LOW
**Description**: Booking creation doesn't create BookingCustomer records
**Impact**: When checking in, need to assign customers to rooms, but relationships don't exist
**Recommendation**: Create BookingCustomer records during booking creation (or at least allow creation during check-in)

---

## 📝 Notes

- BE status enum: PENDING | CONFIRMED | CHECKED_IN | PARTIALLY_CHECKED_OUT | CHECKED_OUT | CANCELLED
- FE status mapping uses Vietnamese labels - risky for logic comparisons
- Each BookingRoom can have different checkIn/checkOut dates (not fully used in FE)
- Booking expires in 1 hour if not confirmed with deposit
- updateBooking() supports `data: updateBody` - any field can technically be updated without validation
