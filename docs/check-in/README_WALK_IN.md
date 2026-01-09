# 🏨 Nghiệp Vụ Khách Vãng Lai - Tổng Quan

## 📖 Tài Liệu Đầy Đủ

Xem [WALK_IN_GUIDE.md](./WALK_IN_GUIDE.md) để có hướng dẫn chi tiết đầy đủ.

---

## 🎯 Khái Niệm

**Khách vãng lai (Walk-in)** = Khách đến trực tiếp khách sạn KHÔNG ĐẶT PHÒNG TRƯỚC, yêu cầu nhận phòng ngay.

---

## ⚡ Quick Start

### 1️⃣ Mở Modal Walk-in
```typescript
// Từ trang Check-in
<Button onClick={checkIn.handleWalkIn}>
  Khách vãng lai
</Button>
```

### 2️⃣ Nhập Thông Tin
- ✅ Tên khách hàng
- ✅ Số điện thoại (10 chữ số)
- ✅ CMND/CCCD
- ○ Email (optional)
- ○ Địa chỉ (optional)

### 3️⃣ Chọn Phòng (Hỗ trợ nhiều phòng)
- Chọn phòng trống
- Nhập số khách
- Chọn ngày nhận/trả
- Bấm "Thêm phòng" nếu cần nhiều phòng

### 4️⃣ Xác Nhận
- Xem tổng tiền dự kiến
- Nhập tiền cọc (optional)
- Bấm "Xác nhận Check-in"

---

## 🔄 Luồng Xử Lý (2 Bước)

```
┌─────────────────────────────────┐
│  1. TẠO BOOKING                 │
│     POST /employee/bookings     │
│     { customer, rooms, dates }  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  2. CHECK-IN NGAY               │
│     POST .../check-in           │
│     { checkInInfo }             │
└─────────────────────────────────┘
```

**⚠️ Lưu ý:** Backend KHÔNG có API one-step cho Walk-in, phải gọi 2 API tuần tự.

---

## 📦 Data Structure

### Frontend → Backend
```typescript
{
  customerName: string;         // ✅ REQUIRED
  phoneNumber: string;          // ✅ REQUIRED (10 digits)
  identityCard: string;         // ✅ REQUIRED
  email?: string;
  address?: string;
  rooms: [                      // ✅ REQUIRED
    { roomTypeId: string, count: number }
  ],
  checkInDate: string;          // ✅ REQUIRED (ISO)
  checkOutDate: string;         // ✅ REQUIRED (ISO)
  numberOfGuests: number;       // ✅ REQUIRED (tổng tất cả phòng)
}
```

---

## 🛠️ Files Modified

| File | Mô tả |
|------|-------|
| `app/(dashboard)/checkin/page.tsx` | Kết nối Walk-in handler với notification |
| `components/checkin-checkout/walk-in-modal.tsx` | UI modal Walk-in |
| `hooks/use-checkin.ts` | Logic 2-step: Create → Check-in |
| `lib/types/checkin-checkout.ts` | Type definitions |

---

## ✅ Status

- ✅ UI hoàn chỉnh (multi-room support)
- ✅ Backend integration (2-step flow)
- ✅ Validation & error handling
- ✅ Success notifications
- ✅ TypeScript types
- ✅ Documentation

---

## 🧪 Testing

### Test Case: Walk-in 1 Phòng
```
1. Mở modal Walk-in
2. Nhập: "Nguyễn Văn An", "0901234567", "079012345678"
3. Chọn Phòng 101 (Deluxe), 2 khách, 3 đêm
4. Bấm "Xác nhận Check-in"
5. ✅ Thành công → Phòng 101 = OCCUPIED
```

### Test Case: Walk-in 2 Phòng
```
1. Chọn Phòng 101 (2 khách)
2. Bấm "Thêm phòng"
3. Chọn Phòng 201 (2 khách)
4. Total: 4 khách, 2 phòng
5. ✅ Thành công → Cả 2 phòng = OCCUPIED
```

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| "No rooms available" | Kiểm tra room status = AVAILABLE trong DB |
| "All rooms must be CONFIRMED" | BookingRoom chưa được tạo, thêm delay |
| Validation errors | Check console logs, verify required fields |

---

## 📚 Tài Liệu Liên Quan

- [WALK_IN_GUIDE.md](./WALK_IN_GUIDE.md) - Hướng dẫn chi tiết đầy đủ
- [CHECKIN_BUSINESS_LOGIC.md](./CHECKIN_BUSINESS_LOGIC.md) - Nghiệp vụ check-in tổng quát
- [WALK_IN_COMPATIBILITY_FIX.md](./WALK_IN_COMPATIBILITY_FIX.md) - Lịch sử fix
- [BACKEND_API_DOCUMENTATION.md](../../BACKEND_API_DOCUMENTATION.md) - API reference

---

**Version:** 1.0  
**Last Updated:** 09/01/2026  
**Status:** ✅ READY FOR PRODUCTION
