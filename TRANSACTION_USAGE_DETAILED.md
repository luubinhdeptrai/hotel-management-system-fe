# 📊 HƯỚNG DẪN SỬ DỤNG TRANSACTION - TRANSACTION DETAIL - SERVICE USAGE

## 📌 OVERVIEW

Hệ thống quản lý khách sạn sử dụng 3 khái niệm chính:

1. **Transaction** - Ghi nhận các giao dịch tài chính
2. **TransactionDetail** - Chi tiết của từng giao dịch (tạo liên kết)
3. **ServiceUsage** - Ghi nhận dịch vụ được sử dụng

---

## 🏷️ PART 1: KHÁI NIỆM CƠ BẢN

### A. Transaction (Giao Dịch)

**Định nghĩa:** Ghi nhận một lần giao dịch tài chính trong hóa đơn

**Cấu trúc:**
```tsx
interface Transaction {
  transactionID: string;           // ID duy nhất
  folioID: string;                 // Hóa đơn
  baseAmount: number;              // Số tiền gốc (100,000)
  discountAmount: number;          // Giảm giá (10,000)
  amount: number;                  // Thành tiền (90,000)
  status: TransactionStatus;       // PENDING | COMPLETED | CANCELLED | VOIDED
  method: PaymentMethod;           // CASH | CARD | BANK | DEBIT
  createdAt: Date;
  createdBy: string;               // ID nhân viên tạo
  isVoided: boolean;               // Đã hủy?
}
```

**5 Loại Transaction:**

| Loại | Tên | Khi nào dùng | Ví dụ |
|------|-----|-------------|-------|
| `ROOM_CHARGE` | Phí phòng | Khách check-in | Phòng A1 3 đêm × 500k |
| `SERVICE_CHARGE` | Phí dịch vụ | Dùng dịch vụ | Giặt ủi, room service |
| `DEPOSIT` | Tiền đặt cọc | Thanh toán trước | Đặt cọc 1M khi booking |
| `REFUND` | Hoàn tiền | Trả lại tiền | Hoàn 500k vì lý do nào |
| `ADJUSTMENT` | Điều chỉnh | Thay đổi giá | Điều chỉnh giá phòng |

---

### B. TransactionDetail (Chi tiết giao dịch)

**Định nghĩa:** Liên kết giao dịch với chi tiết cụ thể (phòng hoặc dịch vụ)

**Cấu trúc:**
```tsx
interface TransactionDetail {
  transactionDetailID: string;
  transactionID: string;           // Transaction nào
  
  // XOR: Chỉ có 1 trong 2
  bookingRoomID?: string;          // Liên kết phòng (room charge)
  serviceUsageID?: string;         // Liên kết dịch vụ (service charge)
  
  createdAt: Date;
}
```

**Công dụng:**
- `bookingRoomID` được set khi loại là `ROOM_CHARGE` → Chỉ ra phòng nào bị tính phí
- `serviceUsageID` được set khi loại là `SERVICE_CHARGE` → Chỉ ra dịch vụ nào bị tính phí

---

### C. ServiceUsage (Sử dụng dịch vụ)

**Định nghĩa:** Ghi nhận khách đã dùng một dịch vụ nào đó

**Cấu trúc:**
```tsx
interface ServiceUsage {
  serviceUsageID: string;
  bookingID: string;               // Booking nào (có thể null)
  serviceID: string;               // Dịch vụ nào
  quantity: number;                // Số lượng (ví dụ: 2 bộ quần áo)
  unitPrice: number;               // Giá/cái (ví dụ: 50k)
  totalPrice: number;              // Tổng (2 × 50k = 100k)
  totalPaid: number;               // Đã thanh toán (70k)
  balance: number;                 // Còn nợ (30k)
  status: ServiceUsageStatus;      // UNPAID | PARTIAL_PAID | FULL_PAID | TRANSFERRED
  createdAt: Date;
}
```

**Trạng thái ServiceUsage:**

| Trạng thái | Nghĩa | Khi nào | Cách fix |
|-----------|-------|---------|---------|
| `UNPAID` | Chưa thanh toán | Vừa thêm dịch vụ | Tạo transaction SERVICE_CHARGE |
| `PARTIAL_PAID` | Thanh toán một phần | Khách trả 70k/100k | Tạo transaction SERVICE_CHARGE thêm |
| `FULL_PAID` | Thanh toán hết | Khách trả đủ 100k | Tạo transaction SERVICE_CHARGE cuối |
| `TRANSFERRED` | Chuyển sang hóa đơn khác | Move sang folio khác | Tạo transaction với folio mới |

---

## 🎯 PART 2: CÁC MÀN HÌNH (DỮ DỤNG NÀO)

### 1️⃣ Màn hình DANH SÁCH HÓAL ĐƠN (`/payments`)

**File:** `app/(dashboard)/folio/page.tsx`

**Dữ liệu dùng:**
- ✅ `Folio[]` - Danh sách hóa đơn
- ✅ `Transaction[]` - Giao dịch của mỗi hóa đơn (để hiển thị tổng)

**Hiển thị:**
```
┌─────────────────────────────────────────┐
│ DANH SÁCH HÓA ĐƠN                       │
├─────────────────────────────────────────┤
│ ID     │ Khách    │ Phòng │ Tổng   │ Nợ │
├─────────────────────────────────────────┤
│ F001   │ Nguyễn A │ A1    │ 1.5M   │ 0  │
│ F002   │ Trần B   │ B2    │ 2.0M   │ 0  │
└─────────────────────────────────────────┘
```

**API cần:**
```tsx
// GET /employee-api/v1/folios
const [folios, setFolios] = useState<Folio[]>([]);

useEffect(() => {
  const loadFolios = async () => {
    try {
      const response = await transactionService.getFolios();
      setFolios(response || []);
    } catch (error) {
      logger.error("Failed to load folios:", error);
    }
  };
  loadFolios();
}, []);

// Hiển thị
<table>
  {folios.map(folio => (
    <tr key={folio.folioID}>
      <td>{folio.folioID}</td>
      <td>{folio.guestName}</td>
      <td>{folio.roomNumber}</td>
      <td>{folio.transactions.reduce((sum, t) => sum + t.amount, 0)}</td>
      <td>{calculateBalance(folio)}</td>
    </tr>
  ))}
</table>
```

---

### 2️⃣ Màn hình CHI TIẾT HÓA ĐƠN (`/payments/folio/[id]`)

**File:** `app/(dashboard)/payments/folio/[id]/page.tsx`

**Dữ liệu dùng:**
- ✅ `Folio` - Chi tiết hóa đơn
- ✅ `Transaction[]` - Tất cả giao dịch
- ✅ `TransactionDetail[]` - Liên kết chi tiết

**Hiển thị:**
```
┌────────────────────────────────────────────┐
│ HÓA ĐƠN F001 - Nguyễn Văn A                │
├────────────────────────────────────────────┤
│ Phòng: A1  │ Check-in: 01/02  │ Đêm: 3     │
├────────────────────────────────────────────┤
│ GIAO DỊCH:                                 │
│                                            │
│ • Phí phòng (ROOM_CHARGE)      1.5M   1.5M│
│ • Giặt ủi (SERVICE_CHARGE)     150k   150k│
│ • Giảm giá                     -50k       │
│                                            │
│ TỔNG:                                 1.6M│
│ ĐÃ THANH TOÁN:                        1.5M│
│ CÒN NỢ:                                100k│
└────────────────────────────────────────────┘
```

**Code:**
```tsx
// GET /employee-api/v1/folios/{folioID}
useEffect(() => {
  const loadFolio = async () => {
    try {
      const data = await transactionService.getFolio(folioID);
      setFolio(data);
    } catch (error) {
      logger.error("Failed to load folio:", error);
    }
  };
  loadFolio();
}, [folioID]);

// Hiển thị transactions
<TransactionTable 
  transactions={folio?.transactions || []}
  details={folio?.transactionDetails || []}
/>
```

---

### 3️⃣ Màn hình THÊM KHÁCH (Walk-in) (`/check-in`)

**File:** `components/checkin-checkout/walk-in-modal.tsx`

**Dữ liệu dùng:**
- ✅ `Room[]` - Danh sách phòng trống
- ⚠️ `Transaction` - Sẽ tạo khi confirm

**Hiển thị:**
```
┌──────────────────────────────────────┐
│ THÊM KHÁCH MỚI                       │
├──────────────────────────────────────┤
│ Họ tên:    [_________________]       │
│ Phòng:     [Chọn]  ↓                 │
│  ├─ A1 (500k/đêm)                   │
│  ├─ A2 (500k/đêm)                   │
│  ├─ B1 (700k/đêm)                   │
│ Check-in:  [01/02]                   │
│ Check-out: [05/02]                   │
│                                      │
│ Tổng: 2M        [THÊM KHÁCH]         │
└──────────────────────────────────────┘
```

**API cần:**
```tsx
// GET /employee-api/v1/rooms?status=AVAILABLE
const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

useEffect(() => {
  const loadRooms = async () => {
    try {
      const response = await roomService.getAvailableRooms();
      setAvailableRooms(response || []);
    } catch (error) {
      logger.error("Failed to load rooms:", error);
    }
  };
  loadRooms();
}, []);

// Khi confirm
const handleConfirm = async () => {
  // 1. Tạo Folio
  const folio = await transactionService.createFolio({
    guestName,
    roomID: selectedRoom.roomID,
    checkInDate,
    checkOutDate,
  });
  
  // 2. Tạo Transaction (ROOM_CHARGE)
  const transaction = await transactionService.createTransaction({
    folioID: folio.folioID,
    type: "ROOM_CHARGE",
    baseAmount: totalPrice,
    discountAmount: 0,
    amount: totalPrice,
    method: "PENDING",
    createdBy: currentUser.id,
  });
  
  // 3. Tạo TransactionDetail (liên kết phòng)
  await transactionService.createTransactionDetail({
    transactionID: transaction.transactionID,
    bookingRoomID: selectedRoom.roomID,
  });
};
```

---

### 4️⃣ Màn hình DEPOSIT (Booking) (`/reservations`)

**File:** Component trong reservations feature

**Dữ liệu dùng:**
- ✅ `Folio` - Hóa đơn của booking
- ✅ `Transaction` - Ghi nhận deposit

**Hiển thị:**
```
┌──────────────────────────────────────┐
│ XÁC NHẬN ĐẶT CỌC                     │
├──────────────────────────────────────┤
│ Booking: RES001                      │
│ Khách: Nguyễn Văn A                  │
│ Phòng: A1 (3 đêm)                    │
│ Tổng: 1.5M                           │
│                                      │
│ Tiền đặt cọc: [500000]   50%         │
│                                      │
│ Hình thức:  [CASH      ▼]            │
│            [XÁC NHẬN]                │
└──────────────────────────────────────┘
```

**Code:**
```tsx
const handleConfirmDeposit = async () => {
  // 1. Lấy folio của booking
  const folio = await transactionService.getFolioByBooking(bookingID);
  
  // 2. Tạo transaction DEPOSIT
  const transaction = await transactionService.createTransaction({
    folioID: folio.folioID,
    type: "DEPOSIT",
    baseAmount: depositAmount,
    discountAmount: 0,
    amount: depositAmount,
    status: "COMPLETED",
    method: paymentMethod,
    createdBy: user.id,
  });
  
  // 3. Tạo TransactionDetail (không cần bookingRoomID)
  // Deposit không link chi tiết, chỉ là tiền chung
  await transactionService.createTransactionDetail({
    transactionID: transaction.transactionID,
    bookingRoomID: null,  // Deposit không link phòng cụ thể
  });
};
```

---

### 5️⃣ Màn hình THÊM DỊCH VỤ (`/check-in`)

**File:** `components/checkin-checkout/add-service-modal.tsx`

**Dữ liệu dùng:**
- ✅ `Service[]` - Danh sách dịch vụ
- ✅ `ServiceUsage` - Ghi nhận dịch vụ
- ⚠️ `Transaction` - Sẽ tạo khi khách trả

**Hiển thị:**
```
┌──────────────────────────────────────┐
│ THÊM DỊCH VỤ                         │
├──────────────────────────────────────┤
│ Khách: Nguyễn Văn A (Phòng A1)       │
│                                      │
│ Dịch vụ:    [Giặt ủi    ▼]           │
│ Số lượng:   [2]  bộ                  │
│ Giá/bộ:     50,000 đ                 │
│ Tổng:       100,000 đ                │
│                                      │
│            [THÊM DỊCH VỤ]            │
└──────────────────────────────────────┘
```

**Code:**
```tsx
const handleAddService = async () => {
  // 1. Tạo ServiceUsage
  const serviceUsage = await bookingService.addServiceUsage({
    bookingID,
    serviceID: selectedService.serviceID,
    quantity,
    unitPrice: selectedService.price,
    totalPrice: quantity * selectedService.price,
  });
  
  // 2. Tạo Transaction (SERVICE_CHARGE)
  const transaction = await transactionService.createTransaction({
    folioID: folio.folioID,
    type: "SERVICE_CHARGE",
    baseAmount: serviceUsage.totalPrice,
    discountAmount: 0,
    amount: serviceUsage.totalPrice,
    status: "PENDING",  // Chờ thanh toán
    method: null,
    createdBy: user.id,
  });
  
  // 3. Tạo TransactionDetail (liên kết dịch vụ)
  await transactionService.createTransactionDetail({
    transactionID: transaction.transactionID,
    serviceUsageID: serviceUsage.serviceUsageID,  // ← Chỉ ra dịch vụ nào
  });
};
```

---

### 6️⃣ Màn hình THANH TOÁN DỊCH VỤ (Mới cần tạo)

**File:** `components/folio/service-payment-modal.tsx`

**Dữ liệu dùng:**
- ✅ `ServiceUsage` - Dịch vụ chưa trả tiền
- ✅ `Transaction` - Ghi nhận thanh toán

**Hiển thị:**
```
┌──────────────────────────────────────┐
│ THANH TOÁN DỊCH VỤ                   │
├──────────────────────────────────────┤
│ • Giặt ủi (2 bộ)          100,000    │
│   Đã trả:       0                    │
│   Còn nợ:       100,000   [TRẢ]      │
│                                      │
│ • Room Service (1 lần)    150,000    │
│   Đã trả:       100,000              │
│   Còn nợ:       50,000    [TRẢ]      │
│                                      │
│ Hình thức:  [CASH      ▼]            │
│            [THANH TOÁN]              │
└──────────────────────────────────────┘
```

**Code:**
```tsx
const handlePayService = async (serviceUsage: ServiceUsage) => {
  const paymentAmount = serviceUsage.balance;  // Số tiền còn nợ
  
  // 1. Tạo Transaction (SERVICE_CHARGE)
  const transaction = await transactionService.createTransaction({
    folioID: folio.folioID,
    type: "SERVICE_CHARGE",
    baseAmount: paymentAmount,
    discountAmount: 0,
    amount: paymentAmount,
    status: "COMPLETED",
    method: paymentMethod,
    createdBy: user.id,
  });
  
  // 2. Tạo TransactionDetail (liên kết dịch vụ)
  await transactionService.createTransactionDetail({
    transactionID: transaction.transactionID,
    serviceUsageID: serviceUsage.serviceUsageID,
  });
  
  // 3. Cập nhật ServiceUsage status
  const newTotalPaid = serviceUsage.totalPaid + paymentAmount;
  const newStatus = newTotalPaid >= serviceUsage.totalPrice 
    ? "FULL_PAID" 
    : "PARTIAL_PAID";
  
  await bookingService.updateServiceUsage(serviceUsage.serviceUsageID, {
    totalPaid: newTotalPaid,
    balance: serviceUsage.totalPrice - newTotalPaid,
    status: newStatus,
  });
};
```

---

### 7️⃣ Màn hình THANH TOÁN CUỐI (Check-out)

**File:** `components/checkin-checkout/final-payment-modal.tsx`

**Dữ liệu dùng:**
- ✅ `Folio` - Chi tiết hóa đơn
- ✅ `Transaction[]` - Tất cả giao dịch
- ✅ `ServiceUsage[]` - Dịch vụ chưa trả

**Hiển thị:**
```
┌──────────────────────────────────────┐
│ THANH TOÁN CUỐI (Check-out)          │
├──────────────────────────────────────┤
│ Khách: Nguyễn Văn A (Phòng A1)       │
│                                      │
│ TỔNG CHI PHÍ:           1,600,000    │
│ ├─ Phòng (3 đêm)        1,500,000    │
│ ├─ Giặt ủi              100,000      │
│ └─ Giảm giá            -   50,000    │
│                                      │
│ ĐÃ THANH TOÁN:          1,500,000    │
│ ├─ Tiền đặt cọc         500,000      │
│ └─ Thanh toán trước      1,000,000   │
│                                      │
│ CÒN PHẢI THANH TOÁN:     100,000     │
│                                      │
│ Hình thức:  [CASH      ▼]            │
│            [THANH TOÁN & CHECK-OUT]  │
└──────────────────────────────────────┘
```

**Code:**
```tsx
const handleFinalPayment = async () => {
  const remainingAmount = folio.totalAmount - folio.totalPaid;
  
  if (remainingAmount > 0) {
    // 1. Tạo Transaction (ROOM_CHARGE hoặc ADJUSTMENT)
    const transaction = await transactionService.createTransaction({
      folioID: folio.folioID,
      type: "ROOM_CHARGE",
      baseAmount: remainingAmount,
      discountAmount: 0,
      amount: remainingAmount,
      status: "COMPLETED",
      method: paymentMethod,
      createdBy: user.id,
    });
    
    // 2. Tạo TransactionDetail
    await transactionService.createTransactionDetail({
      transactionID: transaction.transactionID,
      bookingRoomID: folio.bookingRoomID,
    });
  }
  
  // 3. Update folio status
  await transactionService.updateFolio(folio.folioID, {
    status: "CHECKED_OUT",
    checkedOutTime: new Date(),
  });
};
```

---

## 💡 PART 3: DECISION TREE (KHI NÀO DÙNG CÁI NÀO)

### Quy tắc quyết định:

```
Là giao dịch tài chính?
├─ YES → Tạo TRANSACTION
│        ├─ Phí phòng?
│        │  └─ type = "ROOM_CHARGE"
│        │     └─ Tạo TransactionDetail + bookingRoomID
│        │
│        ├─ Phí dịch vụ?
│        │  └─ type = "SERVICE_CHARGE"
│        │     └─ Tạo TransactionDetail + serviceUsageID
│        │
│        ├─ Tiền đặt cọc?
│        │  └─ type = "DEPOSIT"
│        │     └─ Không cần TransactionDetail
│        │
│        ├─ Hoàn tiền?
│        │  └─ type = "REFUND"
│        │     └─ Không cần TransactionDetail
│        │
│        └─ Điều chỉnh giá?
│           └─ type = "ADJUSTMENT"
│              └─ Không cần TransactionDetail
│
└─ NO → Đó là SERVICE USAGE
       ├─ Khách dùng dịch vụ?
       │  └─ Tạo ServiceUsage
       │     └─ Sau đó tạo Transaction SERVICE_CHARGE khi thanh toán
       │
       └─ Thanh toán dịch vụ?
          └─ Tạo Transaction SERVICE_CHARGE
             └─ Tạo TransactionDetail + serviceUsageID
             └─ Cập nhật ServiceUsage status
```

---

## 📋 PART 4: QUICK REFERENCE TABLE

| Màn hình | Dữ liệu chính | API GET | API POST | Transaction | TransactionDetail |
|---------|---------------|---------|----------|------------|-------------------|
| Danh sách HĐ | Folio[] | `/folios` | - | READ | - |
| Chi tiết HĐ | Folio | `/folios/{id}` | - | READ | READ |
| Thêm khách | Room[] | `/rooms?available` | `/folios` | CREATE | CREATE |
| Deposit | Folio | `/folios` | `/transactions` | CREATE | CREATE |
| Thêm dịch vụ | Service[] | `/services` | `/service-usages` | CREATE | CREATE |
| Thanh toán dv | ServiceUsage[] | `/service-usages` | `/transactions` | CREATE | UPDATE |
| Check-out | Folio | `/folios/{id}` | `/transactions` | CREATE | CREATE |

---

## ✅ PART 5: COMMON PATTERNS

### Pattern 1: Tạo transaction thường
```tsx
// Bước 1: Tạo transaction
const transaction = await transactionService.createTransaction({
  folioID,
  type: "ROOM_CHARGE",  // hoặc SERVICE_CHARGE, DEPOSIT, vv
  baseAmount: 1000000,
  discountAmount: 0,
  amount: 1000000,
  status: "COMPLETED",
  method: "CASH",
  createdBy: currentUser.id,
});

// Bước 2: Tạo transaction detail (nếu cần link)
if (bookingRoomID) {
  await transactionService.createTransactionDetail({
    transactionID: transaction.transactionID,
    bookingRoomID,
  });
}
```

### Pattern 2: Thanh toán dịch vụ
```tsx
// Bước 1: Tạo transaction SERVICE_CHARGE
const transaction = await transactionService.createTransaction({
  folioID,
  type: "SERVICE_CHARGE",
  baseAmount: paymentAmount,
  discountAmount: 0,
  amount: paymentAmount,
  status: "COMPLETED",
  method: paymentMethod,
  createdBy: currentUser.id,
});

// Bước 2: Link với service usage
await transactionService.createTransactionDetail({
  transactionID: transaction.transactionID,
  serviceUsageID: serviceUsage.serviceUsageID,
});

// Bước 3: Cập nhật service usage status
const newTotalPaid = serviceUsage.totalPaid + paymentAmount;
await bookingService.updateServiceUsage(serviceUsage.serviceUsageID, {
  totalPaid: newTotalPaid,
  balance: Math.max(0, serviceUsage.totalPrice - newTotalPaid),
  status: newTotalPaid >= serviceUsage.totalPrice ? "FULL_PAID" : "PARTIAL_PAID",
});
```

### Pattern 3: Hiển thị transaction
```tsx
folio.transactions.map(transaction => (
  <tr key={transaction.transactionID}>
    <td>{getTransactionTypeLabel(transaction.type)}</td>
    <td>{transaction.baseAmount}</td>
    <td>{transaction.discountAmount}</td>
    <td>{transaction.amount}</td>
    <td>{getStatusBadge(transaction.status)}</td>
    
    {/* Nếu có detail, hiển thị link */}
    {folio.transactionDetails?.find(d => d.transactionID === transaction.transactionID)?.bookingRoomID && (
      <td>Phòng {getRoomNumber(...)}</td>
    )}
    {folio.transactionDetails?.find(d => d.transactionID === transaction.transactionID)?.serviceUsageID && (
      <td>Dịch vụ {getServiceName(...)}</td>
    )}
  </tr>
))
```

---

## 🔗 PART 6: SERVICE IMPORTS

Cần import những service này:

```tsx
// Transactions
import { transactionService } from "@/lib/services/transaction.service";

// Booking & Service Usage
import { bookingService } from "@/lib/services/booking.service";

// Rooms
import { roomService } from "@/lib/services/room.service";

// Services (list dịch vụ)
import { serviceService } from "@/lib/services/service.service";

// Auth (để lấy current user)
import { useAuth } from "@/hooks/use-auth";
```

---

## 🚀 PART 7: STEP-BY-STEP IMPLEMENTATION

### Bước 1: Danh sách HĐ (Folio List)
- [ ] GET `/employee-api/v1/folios`
- [ ] Render table với Folio[]
- [ ] Show tổng tiền, nợ

### Bước 2: Chi tiết HĐ (Folio Detail)
- [ ] GET `/employee-api/v1/folios/{id}`
- [ ] Display Folio + Transactions + TransactionDetails
- [ ] Show room info, dates, amount breakdown

### Bước 3: Thêm khách (Walk-in)
- [ ] GET `/employee-api/v1/rooms?available=true`
- [ ] POST `/employee-api/v1/folios` → tạo Folio
- [ ] POST `/employee-api/v1/transactions` → tạo ROOM_CHARGE
- [ ] POST `/employee-api/v1/transaction-details` → link phòng

### Bước 4: Deposit (Booking)
- [ ] GET `/employee-api/v1/folios` (by bookingID)
- [ ] POST `/employee-api/v1/transactions` → DEPOSIT
- [ ] POST `/employee-api/v1/transaction-details`

### Bước 5: Thêm dịch vụ (Services)
- [ ] GET `/employee-api/v1/services`
- [ ] POST `/employee-api/v1/booking/{id}/service-usages` → tạo ServiceUsage
- [ ] POST `/employee-api/v1/transactions` → SERVICE_CHARGE
- [ ] POST `/employee-api/v1/transaction-details` → link dịch vụ

### Bước 6: Thanh toán dịch vụ (Service Payment)
- [ ] GET `/employee-api/v1/booking/{id}/service-usages`
- [ ] Filter những cái còn nợ (balance > 0)
- [ ] POST `/employee-api/v1/transactions` → SERVICE_CHARGE
- [ ] POST `/employee-api/v1/transaction-details`
- [ ] PATCH `/employee-api/v1/service-usages/{id}` → cập nhật status

### Bước 7: Check-out (Final Payment)
- [ ] GET `/employee-api/v1/folios/{id}`
- [ ] Tính remaining amount
- [ ] POST `/employee-api/v1/transactions` → thanh toán cuối
- [ ] PATCH `/employee-api/v1/folios/{id}` → status = CHECKED_OUT

---

## ⚠️ PART 8: COMMON MISTAKES

### ❌ Sai #1: Quên link TransactionDetail
```tsx
// SAI:
const transaction = await transactionService.createTransaction({...});
// Quên tạo TransactionDetail

// ĐÚNG:
const transaction = await transactionService.createTransaction({...});
await transactionService.createTransactionDetail({
  transactionID: transaction.transactionID,
  bookingRoomID: bookingRoom.bookingRoomID,
});
```

### ❌ Sai #2: Không update ServiceUsage status
```tsx
// SAI:
const transaction = await transactionService.createTransaction({...});
// Quên update ServiceUsage status

// ĐÚNG:
const transaction = await transactionService.createTransaction({...});
await bookingService.updateServiceUsage(serviceUsageID, {
  totalPaid: newTotalPaid,
  balance: serviceUsage.totalPrice - newTotalPaid,
  status: "FULL_PAID",
});
```

### ❌ Sai #3: Link sai chi tiết
```tsx
// SAI:
// SERVICE_CHARGE mà lại link bookingRoomID
await transactionService.createTransactionDetail({
  transactionID: transaction.transactionID,
  bookingRoomID: room.roomID,  // ← SAI, đây là ROOM, không phải BookingRoom
});

// ĐÚNG:
await transactionService.createTransactionDetail({
  transactionID: transaction.transactionID,
  serviceUsageID: serviceUsage.serviceUsageID,  // ← Đúng, SERVICE_CHARGE link service
});
```

### ❌ Sai #4: Tạo transaction mà không có type
```tsx
// SAI:
const transaction = await transactionService.createTransaction({
  folioID,
  baseAmount: 1000000,
  amount: 1000000,
  // Quên type
});

// ĐÚNG:
const transaction = await transactionService.createTransaction({
  folioID,
  type: "ROOM_CHARGE",  // ← Bắt buộc
  baseAmount: 1000000,
  amount: 1000000,
});
```

---

## 📚 PART 9: API REFERENCE

```
GET  /employee-api/v1/folios
     → List all folios
     Response: Folio[]

GET  /employee-api/v1/folios/{folioID}
     → Get folio detail
     Response: Folio (with transactions, details)

POST /employee-api/v1/transactions
     → Create transaction
     Body: { folioID, type, baseAmount, discountAmount, amount, status, method, createdBy }
     Response: Transaction

POST /employee-api/v1/transaction-details
     → Create transaction detail
     Body: { transactionID, bookingRoomID?, serviceUsageID? }
     Response: TransactionDetail

GET  /employee-api/v1/booking/{bookingID}/service-usages
     → List service usages for booking
     Response: ServiceUsage[]

POST /employee-api/v1/booking/{bookingID}/service-usages
     → Create service usage
     Body: { serviceID, quantity, unitPrice, totalPrice }
     Response: ServiceUsage

PATCH /employee-api/v1/service-usages/{serviceUsageID}
      → Update service usage
      Body: { totalPaid, balance, status }
      Response: ServiceUsage

PATCH /employee-api/v1/folios/{folioID}
      → Update folio
      Body: { status, checkedOutTime }
      Response: Folio
```

---

**END - HƯỚNG DẪN ĐẦY ĐỦ SỬ DỤNG TRANSACTION, TRANSACTION DETAIL, SERVICE USAGE**
