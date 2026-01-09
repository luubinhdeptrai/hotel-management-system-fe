# 🎯 QUICK REFERENCE: Transaction & Service Usage by Screen

## 📍 Màn Hình & Cách Sử Dụng

### 1️⃣ **FOLIO LIST PAGE** (`/payments`)
```
URL: /payments
Màn hình xem danh sách folio của các khách

┌─────────────────────────────────────────┐
│ Folio #  │ Khách      │ Phòng │ Nợ      │
├──────────┼────────────┼───────┼─────────┤
│ F001     │ Nguyễn A   │ 101   │ 500k    │ → Click xem chi tiết
│ F002     │ Trần B     │ 102   │ 0       │
│ F003     │ Lê C       │ 103   │ 1.5M    │
└─────────────────────────────────────────┘

API:
  GET /employee-api/v1/folios?status=OPEN
  Response: Folio[]

Cách code:
  const [folios, setFolios] = useState<Folio[]>([]);
  
  useEffect(() => {
    const loadFolios = async () => {
      const data = await apiClient.get("/employee-api/v1/folios");
      setFolios(data);
    };
    loadFolios();
  }, []);

  return (
    <table>
      {folios.map(folio => (
        <tr key={folio.folioID} onClick={() => navigate(`/folio/${folio.folioID}`)}>
          <td>{folio.folioID}</td>
          <td>{folio.customerName}</td>
          <td>{folio.roomID}</td>
          <td>{folio.balance}</td>
        </tr>
      ))}
    </table>
  );
```

---

### 2️⃣ **FOLIO DETAIL PAGE** (`/payments/folio/[id]`)
```
URL: /payments/folio/F001
Màn hình xem chi tiết folio - tất cả giao dịch của khách

┌────────────────────────────────────────────┐
│ Khách: Nguyễn Văn A                        │
│ Phòng: 101  │  Tổng nợ: 2,500,000 VNĐ     │
├────────────────────────────────────────────┤
│ Lịch sử giao dịch:                         │
│ Ngày       │ Loại          │ Số tiền │ Người │
│ 2025-12-10 │ ROOM_CHARGE   │ 500k    │ Lan   │
│ 2025-12-11 │ SERVICE_CHARG │ 100k    │ Nam   │
│ 2025-12-12 │ ROOM_CHARGE   │ 500k    │ Lan   │
│ 2025-12-13 │ REFUND (Giảm) │ -50k    │ Nam   │
└────────────────────────────────────────────┘

API:
  GET /employee-api/v1/folios/{folioID}
  Response: {
    folioID, customerName, transactions: FolioTransaction[]
    totalDebit, totalCredit, balance
  }

Cách code:
  const { id } = useParams();
  const [folio, setFolio] = useState<Folio | null>(null);
  
  useEffect(() => {
    const loadFolio = async () => {
      const data = await transactionService.getFolio(id);
      setFolio(data);
    };
    loadFolio();
  }, [id]);

  return (
    <div>
      <h2>{folio?.customerName}</h2>
      <p>Tổng nợ: {folio?.balance}</p>
      
      <TransactionTable 
        transactions={folio?.transactions || []}
        onVoidTransaction={handleVoid}
      />
    </div>
  );
```

---

### 3️⃣ **FINAL PAYMENT MODAL** (Check-out - `/checkout`)
```
Khi khách check-out, sử dụng modal này để thu tiền

┌─────────────────────────────────────────┐
│ THANH TOÁN CUỐI CÙNG                   │
├─────────────────────────────────────────┤
│ Mã phòng: 101                          │
│ Khách: Nguyễn Văn A                    │
│ Tổng tiền nợ: 2,500,000 VNĐ            │
│                                        │
│ Phương thức:                           │
│ ○ Tiền mặt                             │
│ ○ Thẻ tín dụng                         │
│ ○ Chuyển khoản                         │
│                                        │
│ ☐ Xác nhận đã nhận tiền                │
│                                        │
│           [HỦY]  [XÁC NHẬN]           │
└─────────────────────────────────────────┘

Flow:
1. Load bill trước
   GET /employee-api/v1/transactions/bill/{bookingID}
   
2. Khách chọn phương thức & xác nhận
   
3. POST /employee-api/v1/transactions
   {
     bookingId: "B001",
     paymentMethod: "CASH",              // Tùy chọn khách
     transactionType: "ROOM_CHARGE",     // Bắt buộc
     description: "Thanh toán lúc check-out",
     employeeId: "EMP001"                // từ useAuth().user?.id
   }

Cách code:
  import { useAuth } from "@/hooks/use-auth";
  
  const { user } = useAuth();
  const [bill, setBill] = useState<BillResponse | null>(null);
  
  useEffect(() => {
    const loadBill = async () => {
      const data = await transactionService.getBill(bookingId);
      setBill(data);
    };
    loadBill();
  }, [bookingId]);

  const handleConfirmPayment = async () => {
    const response = await transactionService.createTransaction({
      bookingId,
      paymentMethod,
      transactionType: "ROOM_CHARGE",
      description: "Thanh toán khi check-out",
      employeeId: user?.id || "",
    });
    
    if (response.transactionID) {
      onSuccess(); // Đóng modal
    }
  };
```

---

### 4️⃣ **DEPOSIT CONFIRMATION MODAL** (Booking - `/reservations`)
```
Khi khách đặt phòng, thu đặt cọc

┌─────────────────────────────────────────┐
│ NHẬN ĐẶT CỌC                           │
├─────────────────────────────────────────┤
│ Mã phòng: 101                          │
│ Khách: Nguyễn Văn A                    │
│ Tổng tiền: 5,000,000 VNĐ               │
│ Đặt cọc: 2,500,000 VNĐ (50%)           │
│                                        │
│ Phương thức:                           │
│ ○ Tiền mặt                             │
│ ○ Chuyển khoản                         │
│                                        │
│ ☐ Xác nhận đã nhận tiền                │
│                                        │
│           [HỦY]  [XÁC NHẬN]           │
└─────────────────────────────────────────┘

API: POST /employee-api/v1/transactions
{
  bookingId: "B001",
  transactionType: "DEPOSIT",
  paymentMethod: "BANK_TRANSFER",
  description: "Đặt cọc 50%",
  employeeId: "EMP001"
}

Cách code:
  const handleConfirmDeposit = async () => {
    const response = await transactionService.createTransaction({
      bookingId,
      transactionType: "DEPOSIT",
      paymentMethod,
      description: "Đặt cọc khi book phòng",
      employeeId: user?.id || "",
    });
  };
```

---

### 5️⃣ **ADD SERVICE MODAL** (Check-in - `/checkout`)
```
Ghi nhận khách dùng dịch vụ (minibar, giặt ủi, room service)

┌─────────────────────────────────────────┐
│ THÊM DỊCH VỤ                           │
├─────────────────────────────────────────┤
│ Phòng: [Select]                        │
│ Dịch vụ: [Select v]                    │
│   - Minibar (100k)                     │
│   - Giặt ủi (50k)                      │
│   - Room service (200k)                │
│ Số lượng: [2]                          │
│ Thành tiền: 200,000 VNĐ                │
│                                        │
│           [HỦY]  [XÁC NHẬN]           │
└─────────────────────────────────────────┘

Flow:
1. POST /employee-api/v1/booking/{bookingID}/service-usages
   {
     bookingId: "B001",
     bookingRoomId: "BR001",             // Liên kết phòng
     serviceId: "SRV001",                // ID dịch vụ
     quantity: 2,
     employeeId: "EMP001"
   }
   
2. Response: ServiceUsageResponse {
     id: "SU001",
     serviceName: "Minibar",
     totalPrice: 200000,
     totalPaid: 0,
     balance: 200000,
     status: "UNPAID"
   }

Cách code:
  const handleAddService = async (serviceId: string, qty: number) => {
    const response = await checkinCheckoutService.addServiceUsage({
      bookingId,
      bookingRoomId: selectedRoomId,
      serviceId,
      quantity: qty,
      employeeId: user?.id || "",
    });
    
    // Lưu service usage để sau thanh toán
    setServiceUsages(prev => [...prev, response]);
  };
```

---

### 6️⃣ **SERVICE PAYMENT MODAL** (New) (Check-out - `/checkout`)
```
Thanh toán dịch vụ mà khách dùng trong lúc ở

┌─────────────────────────────────────────┐
│ THANH TOÁN DỊCH VỤ                     │
├─────────────────────────────────────────┤
│ Dịch vụ: Minibar (200k)                │
│ Chưa thanh toán: 200,000 VNĐ            │
│                                        │
│ Số tiền thanh toán: [200000]           │
│ Phương thức: [Tiền mặt v]              │
│ Ghi chú: [_____________]               │
│                                        │
│           [HỦY]  [THANH TOÁN]         │
└─────────────────────────────────────────┘

Flow:
1. Load danh sách service usage:
   GET /employee-api/v1/booking/{bookingID}/service-usages
   
2. Khách chọn dịch vụ & nhập số tiền
   
3. POST /employee-api/v1/transactions
   {
     bookingId: "B001",
     serviceUsageId: "SU001",            // ← Khác với Room charge
     paymentMethod: "CASH",
     transactionType: "SERVICE_CHARGE",  // ← Loại khác
     description: "Thanh toán minibar",
     employeeId: "EMP001"
   }

Cách code:
  const handlePayService = async (amount: number) => {
    const response = await transactionService.createTransaction({
      bookingId,
      serviceUsageId: selectedService.id,
      paymentMethod,
      transactionType: "SERVICE_CHARGE",
      description: `Thanh toán: ${selectedService.name}`,
      employeeId: user?.id || "",
    });
    
    // Refresh service usage để cập nhật trạng thái
    await refetchServiceUsages();
  };
```

---

### 7️⃣ **TRANSACTION HISTORY** (`/payments/folio/[id]`)
```
Hiển thị lịch sử giao dịch với chi tiết

┌──────────────────────────────────────────────────┐
│ LỊCH SỬ GIAO DỊCH                             │
├──────┬────────┬──────────┬───────┬────┬────────┤
│ Ngày │ Loại  │ Mô tả    │ Số TK │ TG │ Người │
├──────┼────────┼──────────┼───────┼────┼────────┤
│12/10 │ROOM▼   │Phòng 101 │1500k  │MTL │Lan    │ ← Click mở chi tiết
│12/11 │SERVICE │Minibar   │100k   │MTL │Nam    │
│      │        │▼ Chi tiết:       │    │       │
│      │        │ Base: 100k       │    │       │
│      │        │ Giảm: 0k         │    │       │
│      │        │ Thành: 100k      │    │       │
│12/12 │DEPOSIT │Đặt cọc   │1000k  │BT  │Hoa    │
└──────┴────────┴──────────┴───────┴────┴────────┘

Component:
  <TransactionTable 
    transactions={folio.transactions}
  />
  
  // Hoặc dùng enhanced version:
  <TransactionTableEnhanced 
    transactions={folio.transactions}
    onExpandDetail={(txn) => {...}}
  />
```

---

## 📝 SUMMARY TABLE: Khi Dùng Loại Gì?

| Màn Hình | TransactionType | Khi Nào | API |
|---|---|---|---|
| Check-out | **ROOM_CHARGE** | Thu tiền phòng | POST /transactions |
| Booking | **DEPOSIT** | Thu đặt cọc | POST /transactions |
| Check-out (Service) | **SERVICE_CHARGE** | Thu tiền dịch vụ | POST /transactions |
| Hủy booking | **REFUND** | Hoàn tiền cho khách | POST /transactions |
| Sửa lỗi | **ADJUSTMENT** | Điều chỉnh, sửa sai sót | POST /transactions |

---

## 🔗 API ENDPOINTS

```typescript
// Giao dịch
POST   /employee-api/v1/transactions
GET    /employee-api/v1/folios
GET    /employee-api/v1/folios/{folioID}
GET    /employee-api/v1/transactions/bill/{bookingID}

// Dịch vụ
GET    /employee-api/v1/booking/{bookingID}/service-usages
POST   /employee-api/v1/booking/{bookingID}/service-usages

// Void/Hủy
POST   /employee-api/v1/transactions/{transactionID}/void
```

---

## 🎯 STEP-BY-STEP: Thêm Thanh Toán Mới

1. **Import Service & Auth:**
   ```tsx
   import { transactionService } from "@/lib/services/transaction.service";
   import { useAuth } from "@/hooks/use-auth";
   ```

2. **Get User ID:**
   ```tsx
   const { user } = useAuth();
   const employeeId = user?.id || "";
   ```

3. **Create Transaction:**
   ```tsx
   const response = await transactionService.createTransaction({
     bookingId,
     paymentMethod,
     transactionType: "ROOM_CHARGE", // Chọn loại đúng
     description: "Mô tả giao dịch",
     employeeId,
   });
   ```

4. **Handle Response:**
   ```tsx
   if (response.transactionID) {
     // Thành công
     onSuccess();
   } else {
     // Lỗi
     setError("Tạo giao dịch thất bại");
   }
   ```

---

**📖 Để hiểu chi tiết hơn, xem: `TRANSACTION_USAGE_GUIDE.md`**
