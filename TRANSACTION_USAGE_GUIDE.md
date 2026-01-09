# 📋 Hướng Dẫn Sử Dụng Transaction, Transaction Detail & Service Usage

## 1. Các Khái Niệm Cơ Bản

### 1.1 Transaction (Giao Dịch)
**Định nghĩa:** Giao dịch là mỗi hành động tài chính liên quan đến booking/phòng của khách.

**Các loại Transaction:**
```typescript
TransactionType:
- ROOM_CHARGE      // Tiền phòng
- SERVICE_CHARGE   // Tiền dịch vụ
- DEPOSIT          // Đặt cọc
- REFUND           // Hoàn tiền
- ADJUSTMENT       // Điều chỉnh (thay vì SURCHARGE, PENALTY)
```

**Status của Transaction:**
```typescript
- PENDING          // Chưa hoàn thành
- COMPLETED        // Đã hoàn thành
- CANCELLED        // Đã hủy
- VOIDED           // Đã làm vô hiệu
```

### 1.2 Transaction Detail (Chi Tiết Giao Dịch)
**Định nghĩa:** Chi tiết hóa đơn - liên kết một giao dịch với phòng cụ thể HOẶC dịch vụ cụ thể (không được vừa có phòng vừa có dịch vụ).

```typescript
interface TransactionDetail {
  id: string;
  transactionId: string | null;
  bookingRoomId: string | null;      // Phòng (XOR với serviceUsageId)
  serviceUsageId: string | null;     // Dịch vụ (XOR với bookingRoomId)
  baseAmount: number;                // Số tiền gốc
  discountAmount: number;            // Tiền giảm giá
  amount: number;                    // Thành tiền = baseAmount - discountAmount
  roomNumber?: string;
  serviceName?: string;
}
```

### 1.3 Service Usage (Sử Dụng Dịch Vụ)
**Định nghĩa:** Ghi nhận khách sử dụng một dịch vụ, bao gồm số lượng, giá, trạng thái thanh toán.

```typescript
interface ServiceUsageResponse {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;                 // Giá mỗi đơn vị
  totalPrice: number;                // totalPrice = quantity * unitPrice
  totalPaid?: number;                // Đã thanh toán bao nhiêu
  balance?: number;                  // Còn nợ = totalPrice - totalPaid
  status?: ServiceUsageStatus;       // Trạng thái thanh toán
  bookingId?: string;
  bookingRoomId?: string;
  employeeId: string;                // Người ghi nhận
  createdAt: string;
  updatedAt?: string;
}

type ServiceUsageStatus = 
  | "UNPAID"                         // Chưa thanh toán
  | "PARTIAL_PAID"                   // Thanh toán một phần
  | "FULL_PAID"                      // Đã thanh toán đầy đủ
  | "TRANSFERRED";                   // Chuyển sang phòng khác
```

---

## 2. Các Màn Hình & Cách Sử Dụng

### 🏨 2.1 FOLIO PAGE (`/payments/folio/[id]`)
**Mục đích:** Xem tất cả giao dịch của một khách (một folio)

**API sử dụng:**
```typescript
// Lấy folio chi tiết
GET /employee-api/v1/folios/{folioID}
Response: {
  folioID: string;
  transactions: FolioTransaction[];    // Danh sách tất cả giao dịch
  totalDebit: number;                  // Tổng tiền charge
  totalCredit: number;                 // Tổng tiền thanh toán/cọc
  balance: number;                     // Còn nợ = totalDebit - totalCredit
}

// Lấy bill để check số tiền còn nợ
GET /employee-api/v1/transactions/bill/{bookingID}
Response: {
  bookingId: string;
  totalCharge: number;
  totalPayment: number;
  remainingBalance: number;
}
```

**Components sử dụng:**
```tsx
// app/(dashboard)/payments/folio/[id]/page.tsx

import { TransactionTable } from "@/components/folio/transaction-table";
import { transactionService } from "@/lib/services/transaction.service";

export default function FolioPage({ params }: Props) {
  const [folio, setFolio] = useState<Folio | null>(null);

  useEffect(() => {
    // API call để lấy folio
    const fetchFolio = async () => {
      const response = await transactionService.getFolio(params.id);
      setFolio(response);
    };
    fetchFolio();
  }, [params.id]);

  return (
    <div>
      {/* Hiển thị thông tin khách & tóm tắt folio */}
      <div>
        <h2>{folio?.customerName}</h2>
        <p>Tổng nợ: {formatCurrency(folio?.balance)}</p>
      </div>

      {/* Danh sách giao dịch - sử dụng TransactionTable component */}
      <TransactionTable 
        transactions={folio?.transactions || []}
        onVoidTransaction={handleVoidTransaction}
      />
    </div>
  );
}
```

**Thông tin hiển thị:**
- Danh sách tất cả giao dịch của khách
- Mỗi dòng: Ngày, Loại, Mô tả, Số tiền gốc, Giảm giá, Thành tiền, Phương thức, Người tạo
- Có thể expand để xem chi tiết (chi tiết phòng/dịch vụ)
- Có thể hủy giao dịch (void)

---

### 💳 2.2 PAYMENT PAGES (Các màn hình thanh toán)

#### **2.2.1 Final Payment Modal** (`/checkout`)
**Mục đích:** Thu tiền lúc khách check-out

**Quy trình:**
```
1. Load bill: GET /employee-api/v1/transactions/bill/{bookingID}
2. Chọn phương thức thanh toán
3. Xác nhận đã nhận tiền
4. POST /employee-api/v1/transactions
   {
     bookingId: string;
     paymentMethod: PaymentMethod;    // CASH, CREDIT_CARD, BANK_TRANSFER, E_WALLET
     transactionType: "ROOM_CHARGE";
     employeeId: string;              // ID nhân viên đang thu
   }
```

**Code:**
```tsx
// components/checkin-checkout/final-payment-modal.tsx

const handleConfirmPayment = async () => {
  const response = await transactionService.createTransaction({
    bookingId,
    paymentMethod,
    transactionType: "ROOM_CHARGE",
    employeeId: user?.id || "",
  });
  // Response: FolioTransaction
};
```

---

#### **2.2.2 Deposit Confirmation Modal** (`/reservations`)
**Mục đích:** Thu đặt cọc khi khách book phòng

**Quy trình:**
```
1. Nhập số tiền đặt cọc (hoặc backend tính tự động)
2. Chọn phương thức thanh toán
3. POST /employee-api/v1/transactions
   {
     bookingId: string;
     paymentMethod: PaymentMethod;
     transactionType: "DEPOSIT";
     employeeId: string;
   }
```

**Code:**
```tsx
// components/reservations/deposit-confirmation-modal.tsx

const handleConfirmDeposit = async () => {
  const response = await transactionService.createTransaction({
    bookingId,
    paymentMethod,
    transactionType: "DEPOSIT",
    employeeId: user?.id || "",
  });
};
```

---

#### **2.2.3 Service Payment Modal** (New) (`/checkout`)
**Mục đích:** Thu tiền dịch vụ (ăn cơm, giặt ủi, v.v)

**Quy trình:**
```
1. Load danh sách dịch vụ: GET /employee-api/v1/booking/{bookingID}/service-usages
2. Chọn dịch vụ cần thanh toán
3. Nhập số tiền muốn trả (có thể thanh toán một phần)
4. POST /employee-api/v1/transactions
   {
     bookingId: string;
     serviceUsageId: string;          // ID của service usage
     paymentMethod: PaymentMethod;
     transactionType: "SERVICE_CHARGE";
     description?: string;
     employeeId: string;
   }
```

**Code:**
```tsx
// components/payments/service-payment-modal.tsx

const handlePayService = async (amount: number) => {
  const response = await transactionService.createTransaction({
    bookingId,
    serviceUsageId: selectedService.id,
    paymentMethod,
    transactionType: "SERVICE_CHARGE",
    description: `Thanh toán dịch vụ: ${selectedService.name}`,
    employeeId: user?.id || "",
  });
};
```

---

### 🛎️ 2.3 CHECK-IN/CHECK-OUT PAGES

#### **2.3.1 Add Service Modal** (`/checkout`)
**Mục đích:** Ghi nhận khách dùng dịch vụ

**Quy trình:**
```
1. Chọn phòng (hoặc dịch vụ cho khách - không nhập vào phòng)
2. Chọn dịch vụ từ danh sách
3. Nhập số lượng
4. POST /employee-api/v1/booking/{bookingID}/service-usages
   {
     bookingId: string;
     bookingRoomId?: string;          // Tùy chọn - nếu ghi vào phòng
     serviceId: string;               // ID dịch vụ
     quantity: number;
     employeeId: string;
   }
```

**Response:**
```typescript
ServiceUsageResponse {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  totalPaid: 0,
  balance: totalPrice,
  status: "UNPAID",
  createdAt: string;
}
```

**Code:**
```tsx
// hooks/use-checkout.ts

const handleAddService = async (data: AddServiceFormData) => {
  const response = await checkinCheckoutService.addServiceUsage({
    bookingId: selectedBooking.id,
    bookingRoomId: selectedBookingRooms[0].id,
    serviceId: data.serviceID,
    quantity: data.quantity,
    employeeId: user?.id || "",
  });
  
  // Lưu service usage vào state
  setServiceUsages(prev => [...prev, response]);
};
```

---

### 📊 2.4 FOLIO LIST PAGE (`/payments`)
**Mục đích:** Xem danh sách các folio (tài khoản khách)

**API sử dụng:**
```typescript
// Lấy tất cả folio
GET /employee-api/v1/folios?status=OPEN&type=GUEST
Response: Folio[]
```

**Hiển thị:**
- Danh sách folio với: Mã folio, Tên khách, Phòng, Số tiền nợ, Trạng thái
- Click vào folio để xem chi tiết giao dịch

---

## 3. Cách Tích Hợp API

### 3.1 Tạo Transaction (Thanh Toán)
```typescript
// lib/services/transaction.service.ts

interface CreateTransactionRequest {
  bookingId: string;                          // ID booking
  bookingRoomIds?: string[];                  // Rooms (Scenario 2)
  serviceUsageId?: string;                    // Service (Scenario 3,4)
  paymentMethod: PaymentMethod;
  transactionType: TransactionType;
  description?: string;                       // Ghi chú
  employeeId: string;                         // Bắt buộc - ID nhân viên
  promotionApplications?: PromotionApplication[];
}

// Response
interface FolioTransaction {
  transactionID: string;
  folioID: string;
  date: string;
  time: string;
  type: TransactionType;
  description: string;
  baseAmount: number;
  discountAmount: number;
  amount: number;
  method?: PaymentMethod;
  status: TransactionStatus;
  createdBy: string;
  createdAt: string;
  isVoided?: boolean;
  voidedBy?: string;
  voidedAt?: string;
  details?: TransactionDetail[];
}

async createTransaction(
  request: CreateTransactionRequest
): Promise<FolioTransaction> {
  return apiClient.post(
    "/employee-api/v1/transactions",
    request
  );
}
```

### 3.2 Lấy Folio Chi Tiết
```typescript
async getFolio(folioID: string): Promise<Folio> {
  return apiClient.get(`/employee-api/v1/folios/${folioID}`);
}

// Response bao gồm:
// - transactions: FolioTransaction[]
// - totalDebit, totalCredit, balance
// - details về khách, phòng
```

### 3.3 Tạo Service Usage
```typescript
// lib/services/checkin-checkout.service.ts

interface ServiceUsageRequest {
  bookingId: string;
  bookingRoomId?: string;
  serviceId: string;
  quantity: number;
  employeeId: string;
}

async addServiceUsage(
  request: ServiceUsageRequest
): Promise<ServiceUsageResponse> {
  return apiClient.post(
    `/employee-api/v1/booking/${request.bookingId}/service-usages`,
    request
  );
}
```

### 3.4 Lấy Bill (Tính Nợ)
```typescript
interface BillResponse {
  bookingId: string;
  totalCharge: number;
  totalPayment: number;
  remainingBalance: number;
  chargeDetails: {
    roomCharges: number;
    serviceCharges: number;
    surcharges: number;
    discounts: number;
  };
  deposits: number;
}

async getBill(bookingID: string): Promise<BillResponse> {
  return apiClient.get(
    `/employee-api/v1/transactions/bill/${bookingID}`
  );
}
```

---

## 4. 4 Scenarios Thanh Toán

### **Scenario 1: Thanh Toán Toàn Bộ (Full Booking)**
```
Khách thanh toán hết tất cả tiền phòng, dịch vụ, phụ thu

Flow:
1. Load bill: remainingBalance = 2,500,000 VNĐ
2. POST /transactions
   {
     bookingId: "B001",
     transactionType: "ROOM_CHARGE",  // Lưu ý: loại này cho tất cả
     paymentMethod: "CASH",
     description: "Thanh toán khi check-out",
     employeeId: "EMP001"
   }
3. Backend xử lý: 
   - Tạo transaction lớn
   - Tạo multiple TransactionDetail (một cho mỗi phòng/dịch vụ)
```

---

### **Scenario 2: Thanh Toán Tách Phòng**
```
Booking có 2 phòng, mỗi khách thanh toán riêng

Flow:
1. Load bill: Hiển thị từng phòng với tiền nợ
2. Chọn phòng 101 (1,000,000 VNĐ) và phòng 102 (1,500,000 VNĐ)
3. POST /transactions
   {
     bookingId: "B001",
     bookingRoomIds: ["BR001", "BR002"],
     transactionType: "ROOM_CHARGE",
     paymentMethod: "CASH",
     description: "Thanh toán 2 phòng",
     employeeId: "EMP001"
   }
```

---

### **Scenario 3: Thanh Toán Dịch Vụ (Linked to Booking)**
```
Khách thanh toán tiền dịch vụ đã dùng (minibar, giặt ủi, etc)

Flow:
1. Load service usages: 
   GET /booking/{bookingID}/service-usages
   [
     { id: "SU001", name: "Minibar", totalPrice: 500000, totalPaid: 0 },
     { id: "SU002", name: "Giặt ủi", totalPrice: 300000, totalPaid: 0 }
   ]
2. Chọn thanh toán dịch vụ Minibar (500,000 VNĐ)
3. POST /transactions
   {
     bookingId: "B001",
     serviceUsageId: "SU001",
     transactionType: "SERVICE_CHARGE",
     paymentMethod: "CREDIT_CARD",
     description: "Thanh toán minibar",
     employeeId: "EMP001"
   }
4. Backend:
   - Cập nhật service usage: totalPaid = 500000, status = "FULL_PAID"
   - Tạo TransactionDetail liên kết
```

---

### **Scenario 4: Thanh Toán Dịch Vụ (Guest Service - Không Linked Booking)**
```
Khách order dịch vụ khi ở phòng (không phải booking)
Ví dụ: Khách lẻ dùng hội trường, bố mẹ khách dùng spa

Flow:
1. Tạo ServiceUsage mà không có bookingId/bookingRoomId:
   POST /employee-api/v1/service-usages
   {
     serviceId: "SRV001",
     quantity: 2,
     employeeId: "EMP001"
     // Không có bookingId
   }
2. Thanh toán:
   POST /transactions
   {
     serviceUsageId: "SU_GUEST_001",
     transactionType: "SERVICE_CHARGE",
     paymentMethod: "CASH",
     description: "Dịch vụ spa - khách lẻ",
     employeeId: "EMP001"
   }
```

---

## 5. Common Patterns & Best Practices

### ✅ Lúc nào dùng TransactionType nào?

| Loại Giao Dịch | Khi Nào Dùng | Ví Dụ |
|---|---|---|
| **ROOM_CHARGE** | Thu tiền phòng, hoặc thanh toán full booking | Khách thanh toán khi check-out |
| **SERVICE_CHARGE** | Thu tiền dịch vụ | Minibar, giặt ủi, room service |
| **DEPOSIT** | Thu đặt cọc lúc booking | Khách book phòng, cọc 50% |
| **REFUND** | Hoàn tiền cho khách | Khách hủy booking, hoàn cọc |
| **ADJUSTMENT** | Điều chỉnh, sửa lỗi | Tính nhầm giá, phòng bị hỏng |

### ✅ Cách Load Data Đúng Cách

```typescript
// ❌ SAI: Dùng mock data
import { mockFolios } from "@/lib/mock-folio";
const [folio] = useState(mockFolios[0]);

// ✅ ĐÚNG: Load từ API
const [folio, setFolio] = useState<Folio | null>(null);
useEffect(() => {
  const loadFolio = async () => {
    const data = await transactionService.getFolio(folioID);
    setFolio(data);
  };
  loadFolio();
}, [folioID]);
```

### ✅ Error Handling

```typescript
try {
  const response = await transactionService.createTransaction({
    bookingId,
    paymentMethod,
    transactionType: "ROOM_CHARGE",
    employeeId: user?.id || "",
  });
  
  if (response.transactionID) {
    // Success - transaction created
    onSuccess();
  }
} catch (error) {
  // Handle errors
  if (error instanceof ApiError) {
    setError(error.message); // "Booking not found", "Invalid amount", etc
  }
}
```

### ✅ Validation trước khi POST

```typescript
// Validate dữ liệu trước khi tạo transaction
import { validateTransactionRequest } from "@/lib/utils/transaction-validators";

const handlePayment = async () => {
  const validation = validateTransactionRequest({
    bookingId,
    scenario: "full",
    transactionType: "ROOM_CHARGE",
    paymentMethod,
    details: transactions,
  });
  
  if (!validation.isValid) {
    setError(validation.errors.join(", "));
    return;
  }
  
  // Proceed with payment
  await createTransaction(...);
};
```

---

## 6. File Reference

**API Services:**
- `lib/services/transaction.service.ts` - Tạo/lấy transaction, bill
- `lib/services/checkin-checkout.service.ts` - Service usage

**Components:**
- `components/folio/transaction-table.tsx` - Hiển thị danh sách transaction
- `components/folio/transaction-table-enhanced.tsx` - Với chi tiết expand
- `components/payments/final-payment-modal.tsx` - Check-out payment
- `components/reservations/deposit-confirmation-modal.tsx` - Deposit
- `components/payments/service-payment-modal.tsx` - Service payment
- `components/checkin-checkout/add-service-modal.tsx` - Add service

**Types:**
- `lib/types/folio.ts` - FolioTransaction, TransactionDetail
- `lib/types/checkin-checkout.ts` - ServiceUsageRequest/Response
- `lib/types/api.ts` - TransactionType, TransactionStatus enums

**Hooks:**
- `hooks/use-checkout.ts` - Checkout logic
- `hooks/use-reservations.ts` - Reservation & deposit logic

---

## 7. Troubleshooting

### Q: Transaction tạo nhưng không hiển thị trên folio?
**A:** Kiểm tra:
1. `employeeId` có khác rỗng không?
2. `bookingId` có tồn tại không?
3. Bill có refresh sau transaction không?
```typescript
// Refresh folio sau tạo transaction
await refetchFolio(); // hoặc setFolio(newData)
```

### Q: Service usage nằm ở đâu khi không có booking?
**A:** Service usage không liên kết booking được lưu riêng. Khi thanh toán:
```typescript
// Không có bookingId
const response = await transactionService.createTransaction({
  // bookingId: undefined  // Không cần
  serviceUsageId: "SU_GUEST_001",
  transactionType: "SERVICE_CHARGE",
  ...
});
```

### Q: Làm sao biết service đã thanh toán hết hay chưa?
**A:** Check `ServiceUsageResponse.status` hoặc `balance`:
```typescript
if (serviceUsage.status === "FULL_PAID") {
  // Đã thanh toán xong
} else if (serviceUsage.balance > 0) {
  // Còn nợ
}
```
