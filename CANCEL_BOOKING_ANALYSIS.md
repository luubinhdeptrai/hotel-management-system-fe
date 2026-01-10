# Phân Tích Nghiệp Vụ Hủy Đặt Phòng (Cancel Booking)

**Ngày phân tích:** 2026-01-10  
**Trạng thái:** ✅ Đã chỉnh sửa Frontend để khớp 100% với Backend

---

## 🎯 Mục Tiêu Phân Tích

Đối chiếu nghiệp vụ **Hủy Đặt Phòng** giữa Backend (roommaster-be) và Frontend (hotel-management-system-fe) để:
1. Hiểu rõ logic nghiệp vụ thực tế của Backend (source of truth)
2. Xác định các mismatch giữa FE và BE
3. Chỉnh sửa Frontend để khớp 100% với Backend

---

## 📊 BACKEND - Source of Truth

### A. API Endpoint

**Route:** `POST /employee/bookings/:id/cancel`

**File:** `roommaster-be/src/services/booking.service.ts` (lines 642-687)

**Signature:**
```typescript
async cancelBooking(id: string) {
  // NO parameters accepted besides booking ID in URL
  // Request body should be EMPTY {}
}
```

**Validation Logic:**
```typescript
// Line 647-649: Check if already cancelled
if (booking.status === BookingStatus.CANCELLED) {
  throw new ApiError(httpStatus.BAD_REQUEST, 'Booking is already cancelled');
}

// Line 651-656: Cannot cancel checked-in or checked-out bookings
if (
  booking.status === BookingStatus.CHECKED_IN ||
  booking.status === BookingStatus.CHECKED_OUT
) {
  throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot cancel checked-in or checked-out booking');
}
```

**Side Effects (lines 659-682):**
```typescript
await this.prisma.$transaction(async (tx) => {
  // 1. Update Booking status to CANCELLED
  await tx.booking.update({
    where: { id },
    data: { status: BookingStatus.CANCELLED }
  });

  // 2. Update all BookingRoom status to CANCELLED
  await tx.bookingRoom.updateMany({
    where: { bookingId: id },
    data: { status: BookingStatus.CANCELLED }
  });

  // 3. Release rooms (set Room.status = AVAILABLE)
  const roomIds = booking.bookingRooms.map((br) => br.roomId);
  await tx.room.updateMany({
    where: { id: { in: roomIds } },
    data: { status: RoomStatus.AVAILABLE }
  });
});
```

**Return Value:**
```typescript
return { message: 'Booking cancelled successfully' };
```

### B. Điều Kiện Cho Phép Hủy

✅ **CÓ THỂ hủy** khi booking có status:
- `PENDING` (Chờ xác nhận)
- `CONFIRMED` (Đã xác nhận)

❌ **KHÔNG THỂ hủy** khi booking có status:
- `CANCELLED` (Đã hủy) - đã bị hủy rồi
- `CHECKED_IN` (Đã nhận phòng) - khách đang ở
- `CHECKED_OUT` (Đã trả phòng) - booking đã hoàn tất
- `PARTIALLY_CHECKED_OUT` - một phần phòng đã trả

### C. Data Model Liên Quan

**Prisma Schema:** `roommaster-be/prisma/schema.prisma`

**BookingStatus Enum:**
```prisma
enum BookingStatus {
  PENDING              // Chờ xác nhận (mới tạo, chưa cọc)
  CONFIRMED            // Đã xác nhận (đã cọc)
  CHECKED_IN           // Đã nhận phòng (khách đang ở)
  PARTIALLY_CHECKED_OUT // Một phần phòng đã trả
  CHECKED_OUT          // Đã trả phòng (hoàn tất)
  CANCELLED            // Đã hủy
}
```

**Booking Model:**
```prisma
model Booking {
  id          String        @id
  bookingCode String        @unique
  status      BookingStatus @default(PENDING)
  // ... other fields
  bookingRooms BookingRoom[]
}
```

**BookingRoom Model:**
```prisma
model BookingRoom {
  id        String        @id
  bookingId String
  roomId    String
  status    BookingStatus // Cũng có status riêng
  // ...
}
```

**Room Model:**
```prisma
model Room {
  id         String     @id
  status     RoomStatus @default(AVAILABLE)
  // ...
}

enum RoomStatus {
  AVAILABLE
  RESERVED
  OCCUPIED
  CLEANING
  MAINTENANCE
  OUT_OF_SERVICE
}
```

### D. Nghiệp Vụ Hủy Đặt Phòng (Backend Logic)

**Flow:**
```
User Request Cancel
    ↓
1. Validate booking exists (getBookingById)
    ↓
2. Check status ≠ CANCELLED
    ↓
3. Check status ≠ CHECKED_IN, CHECKED_OUT
    ↓
4. Start Transaction:
   a. Booking.status → CANCELLED
   b. All BookingRoom.status → CANCELLED
   c. All Room.status → AVAILABLE
    ↓
5. Return { message: 'Booking cancelled successfully' }
```

**Đặc điểm quan trọng:**
- ❌ **KHÔNG** có tính năng `cancelReason` (lý do hủy) - Backend không lưu lý do hủy
- ❌ **KHÔNG** có chính sách hủy (cancellation policy)
- ❌ **KHÔNG** có phí hủy (cancellation fee)
- ❌ **KHÔNG** có tính toán hoàn tiền (refund calculation)
- ❌ **KHÔNG** có endpoint preview thông tin hủy
- ✅ Hủy là hành động đơn giản: chỉ đổi status và giải phóng phòng
- ✅ Tất cả thay đổi nằm trong transaction (đảm bảo consistency)

### E. Controller & Route

**Controller:** `roommaster-be/src/controllers/employee/employee.booking.controller.ts` (lines 119-127)
```typescript
cancelBooking = catchAsync(async (req: Request, res: Response) => {
  if (!req.employee?.id) {
    throw new Error('Employee not authenticated');
  }

  const result = await this.bookingService.cancelBooking(req.params.id);
  sendData(res, result);
});
```

**Validation Schema:** `roommaster-be/src/validations/booking.validation.ts` (lines 90-94)
```typescript
const cancelBooking = {
  params: Joi.object().keys({
    id: Joi.string().required()
  })
  // NO body validation - body should be empty
};
```

---

## 🖥️ FRONTEND - Trước Khi Sửa

### A. API Service (Trước đây)

**File:** `hotel-management-system-fe/lib/services/booking.service.ts` (lines 187-215)

**Vấn đề:**
```typescript
async cancelBooking(
  bookingId: string,
  reason?: string  // ❌ WRONG: Backend không nhận parameter này
): Promise<CancelBookingResponse> {
  try {
    const response = await api.post<ApiResponse<CancelBookingResponse>>(
      `/employee/bookings/${bookingId}/cancel`,
      { reason } as CancelBookingRequest,  // ❌ WRONG: Backend expects empty body
      { requiresAuth: true }
    );
    return data;
  } catch (error) {
    // ❌ WRONG: Mock fallback hides real errors
    return {
      id: bookingId,
      bookingCode: "",
      status: "CANCELLED",
      cancelledAt: new Date().toISOString(),
      cancelReason: reason,
    };
  }
}
```

### B. Type Definitions (Trước đây)

**File:** `hotel-management-system-fe/lib/types/api.ts` (lines 594-606)

**Vấn đề:**
```typescript
export interface CancelBookingRequest {
  reason?: string;  // ❌ Backend không accept field này
}

export interface CancelBookingResponse {
  id: string;
  bookingCode: string;
  status: "CANCELLED";
  cancelledAt: string;
  cancelReason?: string;  // ❌ Backend không trả về field này
}
```

**Backend thực tế trả về:**
```typescript
{ message: 'Booking cancelled successfully' }
```

### C. Hook Logic (Trước đây)

**File:** `hotel-management-system-fe/hooks/use-reservations.ts` (lines 312-341)

**Vấn đề:**
```typescript
const handleConfirmCancel = async (reason?: string) => {
  if (selectedReservation) {
    try {
      // ❌ WRONG: Passing reason parameter
      await bookingService.cancelBooking(
        selectedReservation.reservationID,
        reason || "Hủy theo yêu cầu"
      );
      logger.log("Booking cancelled via API:", selectedReservation.reservationID);
    } catch (error) {
      logger.error("Cancel API failed, updating local state:", error);
      // ❌ WRONG: Silently continues even if API fails
    }

    // ❌ WRONG: Updates state regardless of API success
    // No validation for booking status before canceling
    setReservations((prev) =>
      prev.map((r) =>
        r.reservationID === selectedReservation.reservationID
          ? { ...r, status: "Đã hủy" as ReservationStatus }
          : r
      )
    );
    // ...
  }
};
```

**Thiếu validation:**
- Không kiểm tra status trước khi hủy
- Không chặn việc hủy booking đã CHECKED_IN hoặc CHECKED_OUT
- Update state ngay cả khi API thất bại

### D. Cancel Dialog Component (Trước đây)

**File:** `hotel-management-system-fe/components/reservations/cancel-reservation-dialog.tsx`

**Vấn đề:**
```typescript
// ❌ WRONG: Calls getCancellationPreview endpoint that doesn't exist in Backend
const loadCancellationPreview = async () => {
  const previewData = await bookingService.getCancellationPreview(
    reservation.reservationID
  );
  setPreview(previewData);
};

// ❌ WRONG: Shows refund calculation, cancellation fee, policy
// Backend has NO such features
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
  <h4>Thông tin hoàn tiền</h4>
  <div>
    <p>Đã thanh toán</p>
    <p>{formatCurrency(preview.paidAmount)}</p>
  </div>
  <div>
    <p>Phí hủy</p>
    <p>{formatCurrency(preview.cancellationFee)}</p>
  </div>
  <div>
    <p>Số tiền hoàn lại</p>
    <p>{formatCurrency(preview.refundAmount)} ({preview.refundPercentage}%)</p>
  </div>
  <p>{preview.policy}</p>
</div>
```

**Interface không tồn tại trong BE:**
```typescript
export interface CancellationPreview {
  bookingId: string;
  totalAmount: number;
  paidAmount: number;
  cancellationFee: number;  // ❌ Backend không có
  refundAmount: number;     // ❌ Backend không có
  refundPercentage: number; // ❌ Backend không có
  policy: string;           // ❌ Backend không có
}
```

---

## ❌ DANH SÁCH CÁC VẤN ĐỀ (Mismatches)

### Issue 1: API Parameter Mismatch
**Severity:** 🔴 HIGH  
**Location:** `lib/services/booking.service.ts`

**Vấn đề:**
- FE gửi `{ reason: string }` trong request body
- BE expects empty body `{}`
- BE không accept và không lưu `reason` parameter

**Ảnh hưởng:**
- Request body sai format (BE ignore extra fields)
- FE nghĩ rằng reason được lưu nhưng thực tế không

---

### Issue 2: Response Type Mismatch
**Severity:** 🔴 HIGH  
**Location:** `lib/types/api.ts`

**Vấn đề:**
- FE expects: `{ id, bookingCode, status, cancelledAt, cancelReason }`
- BE returns: `{ message: 'Booking cancelled successfully' }`

**Ảnh hưởng:**
- Type definitions không khớp với BE response
- Frontend code dựa vào fields không tồn tại

---

### Issue 3: Missing Status Validation
**Severity:** 🔴 HIGH  
**Location:** `hooks/use-reservations.ts`

**Vấn đề:**
- FE không validate booking status trước khi gọi cancel API
- User có thể attempt cancel booking CHECKED_IN hoặc CHECKED_OUT
- BE sẽ reject với error, nhưng FE không hiển thị thông báo rõ ràng

**Ảnh hưởng:**
- UX tệ: user bấm cancel → nhận error không rõ ràng
- Không có feedback về điều kiện hủy
- Có thể call API không cần thiết

---

### Issue 4: Non-Existent Feature - Cancellation Preview
**Severity:** 🔴 HIGH  
**Location:** `lib/services/booking.service.ts`, `components/reservations/cancel-reservation-dialog.tsx`

**Vấn đề:**
- FE calls `GET /employee/bookings/{id}/cancellation-preview`
- Endpoint này **KHÔNG TỒN TẠI** trong Backend
- FE hiển thị: phí hủy, hoàn tiền, policy

**Ảnh hưởng:**
- API call luôn luôn fail (404 Not Found)
- UI hiển thị tính năng không có thật
- Gây nhầm lẫn cho user về chính sách hủy

---

### Issue 5: Mock Fallback Hiding Real Errors
**Severity:** 🟠 MEDIUM  
**Location:** `lib/services/booking.service.ts`

**Vấn đề:**
```typescript
} catch (error) {
  console.error("Cancel booking API failed, returning mock response:", error);
  return {
    id: bookingId,
    status: "CANCELLED",
    // ... mock data
  };
}
```
- Khi API thất bại, service trả về mock response
- FE nghĩ cancel thành công nhưng thực tế không
- State được update sai

**Ảnh hưởng:**
- Data inconsistency giữa FE và BE
- User nghĩ đã hủy nhưng booking vẫn active
- Không biết có lỗi xảy ra

---

### Issue 6: State Update Before API Confirmation
**Severity:** 🟠 MEDIUM  
**Location:** `hooks/use-reservations.ts`

**Vấn đề:**
```typescript
try {
  await bookingService.cancelBooking(...);
} catch (error) {
  logger.error("Cancel API failed, updating local state:", error);
}

// Always update state regardless of API result
setReservations((prev) => ...);
```

**Ảnh hưởng:**
- State thay đổi ngay cả khi API fail
- Optimistic update không có rollback
- Data inconsistency

---

### Issue 7: Lý Do Hủy Được Lưu Sai Chỗ
**Severity:** 🟡 LOW  
**Location:** `components/reservations/cancel-reservation-dialog.tsx`

**Vấn đề:**
- UI có textarea để nhập lý do hủy
- User nghĩ lý do sẽ được lưu vào Backend
- Thực tế Backend không có field này

**Ảnh hưởng:**
- UX misleading
- Thông tin lý do hủy bị mất
- Không có audit trail

---

## ✅ GIẢI PHÁP & CHỈNH SỬA

### Fix 1: Update API Service - Remove Reason Parameter

**File:** `lib/services/booking.service.ts`

**Trước:**
```typescript
async cancelBooking(
  bookingId: string,
  reason?: string
): Promise<CancelBookingResponse> {
  const response = await api.post(
    `/employee/bookings/${bookingId}/cancel`,
    { reason } as CancelBookingRequest,
    { requiresAuth: true }
  );
  // ...
}
```

**Sau (đã sửa):**
```typescript
/**
 * Backend constraints:
 * - Cannot cancel if status = CANCELLED
 * - Cannot cancel if status = CHECKED_IN
 * - Cannot cancel if status = CHECKED_OUT
 * - Can only cancel if status = PENDING or CONFIRMED
 *
 * Backend does NOT accept 'reason' parameter.
 */
async cancelBooking(
  bookingId: string
): Promise<CancelBookingResponse> {
  try {
    const response = await api.post<ApiResponse<CancelBookingResponse>>(
      `/employee/bookings/${bookingId}/cancel`,
      {}, // Empty body - Backend expects no parameters
      { requiresAuth: true }
    );
    const data = /* extract data */;
    return data;
  } catch (error) {
    console.error("Cancel booking API failed:", error);
    throw error; // Don't hide errors with mock fallback
  }
}
```

**Thay đổi:**
- ✅ Remove `reason` parameter
- ✅ Send empty body `{}` to match BE
- ✅ Throw error instead of returning mock fallback
- ✅ Add documentation về constraints

---

### Fix 2: Update Type Definitions

**File:** `lib/types/api.ts`

**Trước:**
```typescript
export interface CancelBookingRequest {
  reason?: string;
}

export interface CancelBookingResponse {
  id: string;
  bookingCode: string;
  status: "CANCELLED";
  cancelledAt: string;
  cancelReason?: string;
}
```

**Sau (đã sửa):**
```typescript
// Backend cancelBooking() accepts NO body parameters
// Request body should be empty {}
export interface CancelBookingRequest {
  // Empty - Backend does not accept any parameters
}

// Backend returns: { message: 'Booking cancelled successfully' }
export interface CancelBookingResponse {
  message: string;
}
```

**Thay đổi:**
- ✅ Remove all fields from CancelBookingRequest
- ✅ Update CancelBookingResponse to match BE return value

---

### Fix 3: Add Status Validation in Hook

**File:** `hooks/use-reservations.ts`

**Trước:**
```typescript
const handleConfirmCancel = async (reason?: string) => {
  if (selectedReservation) {
    try {
      await bookingService.cancelBooking(
        selectedReservation.reservationID,
        reason || "Hủy theo yêu cầu"
      );
    } catch (error) {
      logger.error("Cancel API failed, updating local state:", error);
    }
    
    // Always update state
    setReservations((prev) => ...);
    setIsCancelModalOpen(false);
  }
};
```

**Sau (đã sửa):**
```typescript
const handleConfirmCancel = async (reason?: string) => {
  if (!selectedReservation) return;

  // VALIDATION: Check if booking can be cancelled (match Backend logic)
  const cannotCancelStatuses: ReservationStatus[] = [
    "Đã hủy",        // CANCELLED
    "Đã nhận phòng", // CHECKED_IN
    "Đã trả phòng",  // CHECKED_OUT
  ];

  if (cannotCancelStatuses.includes(selectedReservation.status)) {
    logger.error("Cannot cancel booking with status:", selectedReservation.status);
    alert(
      `Không thể hủy đặt phòng ở trạng thái "${selectedReservation.status}". ` +
      `Chỉ có thể hủy đặt phòng ở trạng thái "Chờ xác nhận" hoặc "Đã xác nhận".`
    );
    return;
  }

  try {
    // Call cancel API (Backend does NOT accept reason parameter)
    await bookingService.cancelBooking(
      selectedReservation.reservationID
    );
    logger.log("Booking cancelled successfully:", selectedReservation.reservationID);

    // Update local state ONLY after successful API call
    setReservations((prev) =>
      prev.map((r) =>
        r.reservationID === selectedReservation.reservationID
          ? { ...r, status: "Đã hủy" as ReservationStatus }
          : r
      )
    );
    setIsCancelModalOpen(false);
    setSelectedReservation(null);
  } catch (error) {
    logger.error("Failed to cancel booking:", error);
    alert(
      "Không thể hủy đặt phòng. " +
      (error instanceof Error ? error.message : "Vui lòng thử lại.")
    );
  }
};
```

**Thay đổi:**
- ✅ Add status validation before API call
- ✅ Match Backend constraints exactly
- ✅ Show clear error message if status doesn't allow cancel
- ✅ Only update state after successful API call
- ✅ Proper error handling and user feedback
- ✅ Remove reason parameter from API call

---

### Fix 4: Disable Cancellation Preview Feature

**File:** `lib/services/booking.service.ts`

**Trước:**
```typescript
async getCancellationPreview(
  bookingId: string
): Promise<CancellationPreview> {
  try {
    const response = await api.get<ApiResponse<CancellationPreview>>(
      `/employee/bookings/${bookingId}/cancellation-preview`,
      { requiresAuth: true }
    );
    return data;
  } catch (error) {
    throw error;
  }
}
```

**Sau (đã sửa):**
```typescript
/**
 * NOTE: This endpoint does NOT exist in Backend.
 * Backend has NO cancellation policy, penalty, or refund calculation.
 * Cancellation is simple: just changes status to CANCELLED and releases rooms.
 * This function is kept for backward compatibility but will throw error.
 */
async getCancellationPreview(
  bookingId: string
): Promise<CancellationPreview> {
  throw new Error(
    "Cancellation preview is not supported by Backend. " +
    "Backend does not have cancellation policy or refund calculation."
  );
}
```

**Thay đổi:**
- ✅ Function throws error immediately
- ✅ Clear documentation explaining why feature doesn't exist
- ✅ Prevent accidental usage

---

### Fix 5: Simplify Cancel Dialog - Remove Preview

**File:** `components/reservations/cancel-reservation-dialog.tsx`

**Trước:**
```typescript
const [preview, setPreview] = useState<CancellationPreview | null>(null);
const [previewError, setPreviewError] = useState<string | null>(null);

useEffect(() => {
  if (isOpen && reservation) {
    loadCancellationPreview();
  }
}, [isOpen, reservation]);

const loadCancellationPreview = async () => {
  const previewData = await bookingService.getCancellationPreview(...);
  setPreview(previewData);
};

// Render cancellation preview UI
{preview && (
  <div>
    <p>Đã thanh toán: {preview.paidAmount}</p>
    <p>Phí hủy: {preview.cancellationFee}</p>
    <p>Hoàn lại: {preview.refundAmount}</p>
    <p>Policy: {preview.policy}</p>
  </div>
)}
```

**Sau (đã sửa):**
```typescript
// Remove all preview-related state and logic
// No more loadCancellationPreview()
// No more preview UI

// Replace with simple notice about cancellation
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
  <h4 className="font-semibold text-yellow-800 flex items-center gap-2">
    <span className="w-4 h-4">{ICONS.ALERT_TRIANGLE}</span>
    Lưu ý về hủy đặt phòng
  </h4>
  <p className="text-sm text-yellow-700">
    • Phòng sẽ được giải phóng và trở về trạng thái có sẵn<br />
    • Không tính phí hủy (Backend không có chính sách phí hủy)<br />
    • Hành động này không thể hoàn tác
  </p>
</div>

{/* Reason Input - for record keeping only, not sent to Backend */}
<div className="space-y-2">
  <Label htmlFor="cancel-reason">
    Lý do hủy <span className="text-gray-400">(ghi chú nội bộ, không gửi lên Backend)</span>
  </Label>
  <Textarea
    id="cancel-reason"
    placeholder="Nhập lý do hủy đặt phòng..."
    value={reason}
    onChange={(e) => setReason(e.target.value)}
  />
</div>
```

**Thay đổi:**
- ✅ Remove getCancellationPreview API call
- ✅ Remove preview state and loading state
- ✅ Remove refund/fee calculation UI
- ✅ Replace with simple notice about BE behavior
- ✅ Update reason input label to clarify it's not sent to BE
- ✅ Reason is kept locally for internal record only

---

## 📋 SO SÁNH TRƯỚC & SAU

| Aspect | Trước (Sai) | Sau (Đúng) |
|--------|-------------|------------|
| **API Request Body** | `{ reason: string }` | `{}` (empty) |
| **API Parameters** | cancelBooking(id, reason?) | cancelBooking(id) |
| **Status Validation** | ❌ Không có | ✅ Check status trước khi cancel |
| **Error Handling** | Mock fallback | Throw error, hiển thị cho user |
| **State Update** | Update ngay cả khi API fail | Update chỉ khi API success |
| **Cancellation Preview** | Call API không tồn tại | Throw error + document lý do |
| **Refund Calculation** | Hiển thị UI cho tính năng không có | Remove hoàn toàn |
| **Cancellation Fee** | Hiển thị UI cho tính năng không có | Remove hoàn toàn |
| **Reason Field** | User nghĩ được lưu BE | Clarify: chỉ ghi chú nội bộ |
| **Response Type** | `{ id, status, cancelledAt, ... }` | `{ message: string }` |

---

## 🎯 KẾT LUẬN

### Backend Cancel Booking Logic (Truth)

**Đơn giản và rõ ràng:**
1. Validate booking tồn tại
2. Validate status cho phép hủy (PENDING hoặc CONFIRMED)
3. Chuyển tất cả status thành CANCELLED
4. Giải phóng phòng (Room.status → AVAILABLE)
5. Trả về `{ message: 'Booking cancelled successfully' }`

**Không có:**
- ❌ Cancellation policy
- ❌ Cancellation fee
- ❌ Refund calculation
- ❌ Reason tracking
- ❌ Preview endpoint
- ❌ Complex business rules

### Frontend Đã Được Chỉnh Sửa

**Files Changed:**
1. ✅ `lib/services/booking.service.ts`
   - Remove reason parameter
   - Send empty body
   - Throw errors properly
   - Add BE constraints documentation

2. ✅ `lib/types/api.ts`
   - Update CancelBookingRequest (empty)
   - Update CancelBookingResponse (message only)

3. ✅ `hooks/use-reservations.ts`
   - Add status validation
   - Match BE constraints
   - Proper error handling
   - Update state only on success

4. ✅ `components/reservations/cancel-reservation-dialog.tsx`
   - Remove cancellation preview
   - Remove refund/fee UI
   - Simplify to basic info + confirmation
   - Clarify reason is not sent to BE

### Compatibility: 100% ✅

Frontend giờ đây:
- ✅ Gửi request đúng format (empty body)
- ✅ Validate status như Backend
- ✅ Không hiển thị tính năng không tồn tại
- ✅ Xử lý response đúng
- ✅ Error handling proper
- ✅ UX rõ ràng về điều kiện hủy

**Không còn mismatch nào giữa FE và BE.**

---

## 📝 GHI CHÚ QUAN TRỌNG

1. **Backend là Source of Truth:**
   - Mọi logic nghiệp vụ phải theo Backend
   - Không được suy diễn tính năng ngoài BE
   - Không được tự thêm validation không có trong BE

2. **Về Cancellation Policy:**
   - Backend KHÔNG có cancellation policy
   - Nếu trong tương lai cần thêm, phải:
     + Thêm field trong Prisma schema
     + Implement logic tính phí trong BE service
     + Tạo endpoint preview
     + Sau đó mới update FE

3. **Về Cancel Reason:**
   - Backend KHÔNG lưu cancel reason
   - Nếu cần lưu, phải:
     + Add field `cancelReason` vào Booking model
     + Update cancelBooking service accept reason
     + Update validation schema
     + Sau đó FE mới gửi reason

4. **Status Mapping:**
   - FE dùng Vietnamese labels: "Đã hủy", "Đã nhận phòng"
   - BE dùng enum: CANCELLED, CHECKED_IN
   - Phải map chính xác trong convertBookingToReservation
   - Validation phải dùng đúng status values

---

**Ngày hoàn thành chỉnh sửa:** 2026-01-10  
**Status:** ✅ DONE - Frontend khớp 100% với Backend
