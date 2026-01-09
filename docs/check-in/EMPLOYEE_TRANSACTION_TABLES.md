# Employee Transaction Tables - Chi Tiết & Mối Quan Hệ

## 📋 Mục Lục
1. [Tổng Quan 3 Bảng](#1-tổng-quan-3-bảng)
2. [Bảng Employee Transactions](#2-bảng-employee-transactions)
3. [Bảng Employee Transaction Details](#3-bảng-employee-transaction-details)
4. [Bảng Employee Services](#4-bảng-employee-services)
5. [Mối Quan Hệ Giữa 3 Bảng](#5-mối-quan-hệ-giữa-3-bảng)
6. [Use Cases & Examples](#6-use-cases--examples)

---

## 1. Tổng Quan 3 Bảng

### 📊 Bird's Eye View

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Transaction (Phiếu thanh toán chính)                       │
│  ├─ Mục đích: Ghi lại mỗi lần khách trả tiền               │
│  ├─ Ví dụ: "Khách trả 5 triệu cho phòng + dịch vụ"        │
│  └─ Dùng cho: Tổng hợp, báo cáo doanh thu                  │
│                                                              │
│  ├─────────── 1:N ─────────────┐                            │
│  │                               │                            │
│  ▼                               ▼                            │
│  TransactionDetail (Từng dòng chi tiết trong phiếu)         │
│  ├─ Mục đích: Phân bổ tiền cho từng mục                    │
│  ├─ Ví dụ: "5 triệu = 3 triệu phòng + 1 triệu dịch vụ"   │
│  ├─ Dùng cho: Audit, chi tiết hóa đơn, khấu trừ           │
│  └─ Link tới: BookingRoom hoặc ServiceUsage                │
│                                                              │
│  ServiceUsage (Dịch vụ được sử dụng)                        │
│  ├─ Mục đích: Theo dõi dịch vụ khách đã dùng              │
│  ├─ Ví dụ: "Khách dùng giặt ủi 2 lần, tổng 100k"          │
│  ├─ Dùng cho: Tính toán chi phí dịch vụ                    │
│  └─ Link tới: Service (là loại dịch vụ gì)                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Bảng Employee Transactions

### 📌 Định Nghĩa

**Transaction** là bảng ghi nhận mỗi lần **khách thanh toán tiền**.

Nó giống như một **"Phiếu Thu"** trong quán cà phê, nơi ghi lại:
- Khách nào đó thanh toán
- Bao nhiêu tiền
- Cách nào (tiền mặt, thẻ, chuyển khoản)
- Trạng thái (chưa hoàn thành, đã hoàn thành)

### 🏗️ Cấu Trúc (Schema)

```typescript
model Transaction {
  id        String  @id @default(cuid())
  bookingId String?               // Booking nào (nếu có)

  type      TransactionType       // DEPOSIT, ROOM_CHARGE, SERVICE_CHARGE, REFUND, ADJUSTMENT
  
  // Số tiền
  baseAmount     Decimal           // Giá gốc (chưa giảm giá)
  discountAmount Decimal           // Số tiền được giảm giá
  amount         Decimal           // Số tiền thực tế trả (baseAmount - discountAmount)

  // Thanh toán
  method PaymentMethod?            // CASH, CREDIT_CARD, BANK_TRANSFER, E_WALLET
  status TransactionStatus         // PENDING, COMPLETED, FAILED, REFUNDED

  // Nhân viên xử lý
  processedById String?
  processedBy   Employee?          // Nhân viên nào xử lý thanh toán

  // Chi tiết
  details TransactionDetail[]      // Danh sách chi tiết (1 phiếu → N chi tiết)
  usedPromotions UsedPromotion[]   // Khuyến mãi được dùng

  // Thời gian
  occurredAt  DateTime             // Khi thanh toán xảy ra
  description String?              // Ghi chú thêm
  createdAt   DateTime
  updatedAt   DateTime

  // Quan hệ
  booking Booking? @relation(...)  // Liên kết tới booking
}
```

### 🎯 Mục Đích Chính

| Mục Đích | Chi Tiết |
|----------|----------|
| **Ghi nhận thanh toán** | Mỗi lần khách trả tiền (toàn bộ booking hoặc một phần) |
| **Tính doanh thu** | Tổng cộng tất cả transaction = doanh thu |
| **Quản lý tiền mặt** | Biết cách nào trả tiền (tiền mặt, thẻ, chuyển khoản) |
| **Theo dõi trạng thái** | Thanh toán chưa xong? Đã hoàn thành? Bị từ chối? |
| **Audit & Report** | Báo cáo tài chính, kiểm toán |

### 📊 Ví Dụ Thực Tế

**Scenario: Khách Nguyễn Văn A đặt phòng và thanh toán**

```javascript
// Transaction 1: Khách trả deposit (30% giá phòng)
{
  id: "txn_001",
  bookingId: "bk_123",
  type: "DEPOSIT",                    // Loại: Thanh toán trước
  baseAmount: 1500000,                // Giá gốc phòng
  discountAmount: 0,                  // Không giảm giá
  amount: 450000,                     // Trả 30% = 450k
  method: "CASH",                     // Trả bằng tiền mặt
  status: "COMPLETED",                // Đã hoàn thành
  processedById: "emp_001",           // Nhân viên thu tiền: Anh Tuấn
  occurredAt: "2026-01-09T10:00:00Z", // Lúc 10:00 sáng
  description: "Khách trả cọc 30%"
}

// Transaction 2: Khách thanh toán dịch vụ giặt ủi
{
  id: "txn_002",
  bookingId: "bk_123",
  type: "SERVICE_CHARGE",             // Loại: Thanh toán dịch vụ
  baseAmount: 100000,                 // Giá dịch vụ giặt ủi
  discountAmount: 10000,              // Giảm giá 10k
  amount: 90000,                      // Thực tế khách trả 90k
  method: "CREDIT_CARD",              // Trả bằng thẻ tín dụng
  status: "COMPLETED",
  processedById: "emp_001",
  occurredAt: "2026-01-09T15:00:00Z",
  description: "Khách trả dịch vụ giặt ủi"
}

// Transaction 3: Hoàn trả khách (refund)
{
  id: "txn_003",
  bookingId: "bk_123",
  type: "REFUND",                     // Loại: Hoàn trả
  amount: -50000,                     // Hoàn lại 50k (âm = đưa tiền)
  method: "CASH",
  status: "COMPLETED",
  processedById: "emp_002",           // Nhân viên khác xử lý hoàn trả
  occurredAt: "2026-01-10T11:00:00Z",
  description: "Hoàn trả khách vì check-out sớm"
}
```

### 🔑 Trường Quan Trọng

| Trường | Ý Nghĩa | Ví Dụ |
|-------|--------|-------|
| `type` | Loại thanh toán gì | DEPOSIT, SERVICE_CHARGE, REFUND |
| `amount` | Số tiền thực tế (sau giảm giá) | 450000 |
| `baseAmount` | Giá gốc trước giảm giá | 500000 |
| `discountAmount` | Tiền được giảm | 50000 |
| `method` | Cách thanh toán | CASH, CREDIT_CARD, BANK_TRANSFER |
| `status` | Trạng thái | PENDING, COMPLETED, FAILED, REFUNDED |
| `processedById` | Nhân viên nào xử lý | emp_001 |

---

## 3. Bảng Employee Transaction Details

### 📌 Định Nghĩa

**TransactionDetail** là bảng **chi tiết hóa từng dòng** trong một Transaction.

Nếu **Transaction** là **"Tổng phiếu thu"**, thì **TransactionDetail** là **"từng dòng chi tiết"** trên phiếu đó.

### 🏗️ Cấu Trúc (Schema)

```typescript
model TransactionDetail {
  id            String  @id @default(cuid())
  transactionId String? // Phiếu thanh toán nào (có thể null cho guest services)

  // Tiền
  baseAmount     Decimal           // Giá gốc của khoản mục này
  discountAmount Decimal           // Giảm giá cho khoản mục này
  amount         Decimal           // Số tiền thực tế (baseAmount - discountAmount)

  // Liên kết tới cái cần trả tiền (chỉ có 1 trong 2)
  bookingRoomId  String?           // Nếu trả tiền phòng
  serviceUsageId String?           // Nếu trả tiền dịch vụ

  // Quan hệ
  transaction  Transaction?        // Phiếu thanh toán chứa chi tiết này
  bookingRoom  BookingRoom?        // Phòng được thanh toán (nếu có)
  serviceUsage ServiceUsage?       // Dịch vụ được thanh toán (nếu có)
  
  customerPromotions CustomerPromotion[] // Khuyến mãi áp dụng lên chi tiết này
  usedPromotions     UsedPromotion[]     // Khuyến mãi đã sử dụng

  createdAt DateTime
}
```

### 🎯 Mục Đích Chính

| Mục Đích | Chi Tiết |
|----------|----------|
| **Phân bổ tiền** | Từ 1 phiếu thu → chia ra các mục khác nhau |
| **Chi tiết hóa** | Biết chính xác tiền phòng, tiền dịch vụ, khấu trừ |
| **Áp dụng khuyến mãi** | Khuyến mãi có thể áp dụng lên từng dòng riêng |
| **Audit chi tiết** | Kiểm tra từng khoản chi tiết |
| **Báo cáo chi tiết** | Biết doanh thu từng phòng, từng dịch vụ |

### 📊 Ví Dụ Thực Tế

**Scenario: Phiếu thu txn_001 từ phía trên, nhưng có chi tiết**

```javascript
// Transaction: txn_001 (khách trả 450k deposit)
{
  id: "txn_001",
  amount: 450000,
  details: [
    // ... chi tiết được liệt kê dưới đây
  ]
}

// TransactionDetail 1: Phần phòng 101
{
  id: "txd_001",
  transactionId: "txn_001",
  bookingRoomId: "br_001",           // Là phòng 101
  baseAmount: 300000,                // Giá phòng 101 là 300k
  discountAmount: 0,
  amount: 300000,                    // Trả 300k cho phòng
  // Không có serviceUsageId (vì đây là tiền phòng, không dịch vụ)
}

// TransactionDetail 2: Phần phòng 102
{
  id: "txd_002",
  transactionId: "txn_001",
  bookingRoomId: "br_002",           // Là phòng 102
  baseAmount: 150000,                // Giá phòng 102 là 150k
  discountAmount: 0,
  amount: 150000,                    // Trả 150k cho phòng
  // Không có serviceUsageId
}

// ✅ Kiểm tra: txd_001.amount + txd_002.amount = 300k + 150k = 450k ✓
// = txn_001.amount ✓
```

---

## 4. Bảng Employee Services

### 📌 Định Nghĩa

**Service** là bảng **danh sách các dịch vụ** mà khách sạn cung cấp.

Nó giống như **"Thực đơn"** trong nhà hàng:
- Dịch vụ là gì (Giặt ủi, Massage, Thuê xe, v.v.)
- Giá bao nhiêu (giá cơ sở)
- Đơn vị tính (lần, giờ, kg, v.v.)

### 🏗️ Cấu Trúc (Schema)

```typescript
model Service {
  id       String  @id @default(cuid())
  
  name     String                 // Tên dịch vụ (Giặt ủi, Massage, Thuê xe)
  price    Decimal @db.Decimal    // Giá cơ sở (VND)
  unit     String  @default("lần") // Đơn vị tính (lần, giờ, kg, phần)
  isActive Boolean @default(true) // Dịch vụ còn hoạt động không

  // Quan hệ
  serviceUsages ServiceUsage[]     // Danh sách lần khách sử dụng dịch vụ này

  createdAt DateTime
  updatedAt DateTime
}
```

### 🎯 Mục Đích Chính

| Mục Đích | Chi Tiết |
|----------|----------|
| **Quản lý dịch vụ** | Cơ sở dữ liệu tất cả dịch vụ khách sạn cung cấp |
| **Định giá** | Lưu giá cơ sở của mỗi dịch vụ |
| **Kích hoạt/tắt** | Dịch vụ nào còn hoạt động, cái nào ngừng |
| **Tính toán chi phí** | Khi khách dùng dịch vụ, lấy giá từ đây |
| **Báo cáo** | Dịch vụ nào bán chạy nhất |

### 📊 Ví Dụ Thực Tế

```javascript
// Service 1: Giặt ủi
{
  id: "svc_001",
  name: "Giặt ủi",
  price: 50000,                      // 50k/kg
  unit: "kg",
  isActive: true
}

// Service 2: Massage
{
  id: "svc_002",
  name: "Massage toàn thân",
  price: 300000,                     // 300k/giờ
  unit: "giờ",
  isActive: true
}

// Service 3: Thuê xe (ngừng hoạt động)
{
  id: "svc_003",
  name: "Thuê xe Grabcar",
  price: 100000,
  unit: "lần",
  isActive: false                    // Không hoạt động nữa
}

// Service 4: Mini bar
{
  id: "svc_004",
  name: "Mini bar",
  price: 150000,
  unit: "phần",
  isActive: true
}
```

### 🔑 Trường Quan Trọng

| Trường | Ý Nghĩa | Ví Dụ |
|-------|--------|-------|
| `name` | Tên dịch vụ | "Giặt ủi", "Massage", "Mini bar" |
| `price` | Giá cơ sở | 50000 (VND) |
| `unit` | Đơn vị tính | "kg", "giờ", "lần", "phần" |
| `isActive` | Còn hoạt động? | true/false |

---

## 5. Mối Quan Hệ Giữa 3 Bảng

### 🔗 Sơ Đồ Quan Hệ

```
┌───────────────────┐
│   Transaction     │  (Phiếu thanh toán chính)
│ ┌─────────────┐   │
│ │ txn_001     │   │
│ │ 450000 VND  │   │
│ └─────────────┘   │
└────────┬──────────┘
         │ 1:N (1 phiếu → nhiều chi tiết)
         ▼
┌─────────────────────────────────┐
│  TransactionDetail              │
│ ┌──────────┐  ┌──────────────┐ │
│ │ txd_001  │  │ txd_002      │ │
│ │ 300k     │  │ 150k         │ │
│ └──────────┘  └──────────────┘ │
│      │               │           │
│      │ bookingRoomId │           │
│      │               └───┐       │
│      └──serviceUsageId   │       │
│                      │   │       │
└──────────────────────┼───┼───────┘
                       │   │
        ┌──────────────┘   │
        │                  │
        ▼                  ▼
    ┌─────────┐       ┌──────────────┐
    │ Service │       │ ServiceUsage │
    │ ┌─────┐ │       │ ┌──────────┐ │
    │ │ svc │ │       │ │ su_001   │ │
    │ │ 001 │ │       │ │ 2 lần    │ │
    │ └─────┘ │       │ │ 100k     │ │
    │ Giặt ủi │       │ └──────────┘ │
    │ 50k/kg  │       │ (dùng dịch vụ│
    └─────────┘       └──────────────┘
                      qty=2, unitPrice=50k
                      totalPrice=100k
```

### 📊 Quan Hệ Chi Tiết

#### 1️⃣ **Transaction ↔ TransactionDetail**

**Mối Quan Hệ:** 1 Transaction : N TransactionDetail

```
Transaction (1 phiếu thu)
  │
  ├─ TransactionDetail (dòng 1)
  ├─ TransactionDetail (dòng 2)
  └─ TransactionDetail (dòng 3)
```

**Ví Dụ:**
```javascript
// 1 phiếu thu (transaction)
const transaction = {
  id: "txn_001",
  amount: 450000,  // Tổng cộng 450k
  details: [
    { id: "txd_001", amount: 300000 },  // Phòng 101
    { id: "txd_002", amount: 150000 }   // Phòng 102
  ]
};
// ✅ 300k + 150k = 450k
```

**Quy tắc:**
- ✅ Tổng `TransactionDetail.amount` **PHẢI BẰNG** `Transaction.amount`
- ✅ Mỗi `TransactionDetail` thuộc đúng 1 `Transaction`
- ⚠️ Nếu `transactionId = NULL`, là guest service payment (dịch vụ không qua phiếu)

#### 2️⃣ **TransactionDetail ↔ BookingRoom / ServiceUsage**

**Mối Quan Hệ:** 1 TransactionDetail → 1 BookingRoom **HOẶC** 1 ServiceUsage

```
TransactionDetail (dòng chi tiết)
  │
  ├─ bookingRoomId (nếu trả tiền phòng)
  │  └─> BookingRoom (phòng 101)
  │
  └─ serviceUsageId (nếu trả tiền dịch vụ)
     └─> ServiceUsage (khách dùng dịch vụ giặt ủi 2 lần)
```

**Ví Dụ:**
```javascript
// TransactionDetail 1: Trả tiền phòng
{
  id: "txd_001",
  bookingRoomId: "br_101",       // ✅ Có
  serviceUsageId: null,          // ❌ Không có
  amount: 300000
}

// TransactionDetail 2: Trả tiền dịch vụ
{
  id: "txd_002",
  bookingRoomId: null,           // ❌ Không có
  serviceUsageId: "su_001",      // ✅ Có (dịch vụ giặt ủi)
  amount: 100000
}

// ⚠️ Không thể có cả 2 cùng lúc
// ⚠️ Cũng không thể không có cái nào
```

#### 3️⃣ **Service ↔ ServiceUsage**

**Mối Quan Hệ:** 1 Service : N ServiceUsage

```
Service (giặt ủi - 50k/kg)
  │
  ├─ ServiceUsage (khách A dùng 2kg → 100k)
  ├─ ServiceUsage (khách B dùng 1kg → 50k)
  └─ ServiceUsage (khách C dùng 3kg → 150k)
```

**Ví Dụ:**
```javascript
// Service
{
  id: "svc_001",
  name: "Giặt ủi",
  price: 50000,  // Giá gốc: 50k/kg
  unit: "kg"
}

// ServiceUsage 1: Khách Nguyễn Văn A dùng
{
  id: "su_001",
  serviceId: "svc_001",      // Dịch vụ giặt ủi
  quantity: 2,               // Dùng 2kg
  unitPrice: 50000,          // Giá: 50k/kg
  totalPrice: 100000         // Tổng: 2 × 50k = 100k
}

// ServiceUsage 2: Khách Lê Thị B dùng
{
  id: "su_002",
  serviceId: "svc_001",
  quantity: 1,
  unitPrice: 50000,
  totalPrice: 50000
}
```

---

## 6. Use Cases & Examples

### 🧪 Use Case 1: Khách Thanh Toán Toàn Bộ Booking

**Scenario:**
- Khách Nguyễn Văn A đặt 2 phòng: 101 (3 triệu), 102 (1.5 triệu) = 4.5 triệu
- Khách trả toàn bộ = 4.5 triệu

**Database:**
```javascript
// 1. Transaction (phiếu thu chính)
Transaction {
  id: "txn_001",
  bookingId: "bk_001",
  type: "ROOM_CHARGE",
  baseAmount: 4500000,
  discountAmount: 0,
  amount: 4500000,
  method: "CREDIT_CARD",
  status: "COMPLETED"
}

// 2. TransactionDetail (chi tiết từng phòng)
TransactionDetail {
  id: "txd_001",
  transactionId: "txn_001",
  bookingRoomId: "br_001",           // Phòng 101
  amount: 3000000
}

TransactionDetail {
  id: "txd_002",
  transactionId: "txn_001",
  bookingRoomId: "br_002",           // Phòng 102
  amount: 1500000
}

// ✅ Kiểm tra: 3M + 1.5M = 4.5M ✓
```

---

### 🧪 Use Case 2: Khách Thanh Toán Phòng + Dịch Vụ

**Scenario:**
- Khách trả phòng 101 (3 triệu) + dịch vụ giặt ủi (100k) = 3.1 triệu
- Có khuyến mãi 10% (giảm 310k)
- Thực tế trả: 2.79 triệu

**Database:**
```javascript
// 1. Transaction
Transaction {
  id: "txn_002",
  bookingId: "bk_001",
  type: "ROOM_CHARGE",
  baseAmount: 3100000,               // 3M + 100k
  discountAmount: 310000,            // Giảm 10%
  amount: 2790000,                   // Thực tế
  method: "CASH",
  status: "COMPLETED"
}

// 2. TransactionDetail 1: Tiền phòng
TransactionDetail {
  id: "txd_003",
  transactionId: "txn_002",
  bookingRoomId: "br_001",
  baseAmount: 3000000,
  discountAmount: 300000,            // Giảm 10% của phòng = 300k
  amount: 2700000
}

// 3. TransactionDetail 2: Tiền dịch vụ
TransactionDetail {
  id: "txd_004",
  transactionId: "txn_002",
  serviceUsageId: "su_001",          // Dịch vụ giặt ủi
  baseAmount: 100000,
  discountAmount: 10000,             // Giảm 10% của dịch vụ = 10k
  amount: 90000
}

// 4. Service (dịch vụ giặt ủi)
Service {
  id: "svc_001",
  name: "Giặt ủi",
  price: 50000,
  unit: "kg"
}

// 5. ServiceUsage (khách dùng dịch vụ)
ServiceUsage {
  id: "su_001",
  bookingId: "bk_001",
  serviceId: "svc_001",
  quantity: 2,
  unitPrice: 50000,
  totalPrice: 100000                 // 2 kg × 50k/kg
}

// ✅ Kiểm tra:
// txd_003.amount + txd_004.amount = 2.7M + 90k = 2.79M ✓
// = txn_002.amount ✓
```

---

### 🧪 Use Case 3: Guest Service Payment (Không Qua Booking)

**Scenario:**
- Khách muốn dùng dịch vụ Massage (300k/giờ) cho 1.5 giờ = 450k
- Không liên kết với booking nào (khách mua riêng)

**Database:**
```javascript
// 1. Service
Service {
  id: "svc_002",
  name: "Massage toàn thân",
  price: 300000,
  unit: "giờ"
}

// 2. ServiceUsage
ServiceUsage {
  id: "su_002",
  bookingId: null,                   // ❌ Không liên kết booking
  serviceId: "svc_002",
  quantity: 1.5,                     // 1.5 giờ
  unitPrice: 300000,
  totalPrice: 450000                 // 1.5 × 300k
}

// 3. TransactionDetail (không có Transaction cha!)
TransactionDetail {
  id: "txd_005",
  transactionId: null,               // ❌ Không có phiếu cha
  serviceUsageId: "su_002",
  amount: 450000
}

// ⚠️ Trường hợp đặc biệt: TransactionDetail mà không có Transaction
// = Thanh toán trực tiếp dịch vụ, không gộp vào phiếu chung
```

---

### 🧪 Use Case 4: Hoàn Trả Khách (Refund)

**Scenario:**
- Khách hủy dự định dùng dịch vụ Massage
- Cần hoàn lại 450k

**Database:**
```javascript
// 1. Transaction (REFUND)
Transaction {
  id: "txn_003",
  bookingId: null,                   // Không liên kết booking cụ thể
  type: "REFUND",
  amount: -450000,                   // Âm = đưa tiền ra
  method: "CASH",
  status: "COMPLETED"
}

// 2. TransactionDetail (hoàn lại dịch vụ)
TransactionDetail {
  id: "txd_006",
  transactionId: "txn_003",
  serviceUsageId: "su_002",          // Dịch vụ Massage
  amount: -450000                    // Âm = hoàn trả
}

// ✅ Dịch vụ ServiceUsage vẫn giữ nguyên
// ✅ Chỉ là tạo TransactionDetail với amount âm để hoàn
```

---

## 7. Tổng Kết Mối Quan Hệ

### 🔄 Luồng Dữ Liệu

```
┌─────────────────────────────────────────────────────────────┐
│                      BOOKING                                 │
│                  (Khách đặt phòng)                           │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                   BOOKING ROOM                               │
│           (Phòng cụ thể trong booking)                       │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────┐     ┌───────────────────────┐
│  SERVICE USAGE           │     │   SERVICE             │
│  (Khách dùng dịch vụ)   │────▶│ (Danh sách dịch vụ)  │
│  qty=2, price=50k        │     │ (Giặt ủi, Massage)   │
│  totalPrice=100k         │     └───────────────────────┘
└────────────┬─────────────┘
             │
             │ Cần thanh toán?
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│              TRANSACTION DETAIL                              │
│              (Chi tiết từng khoản)                          │
│  - amount: 100k (từ ServiceUsage)                           │
│  - bookingRoomId: phòng nào (nếu thanh toán phòng)         │
│  - serviceUsageId: dịch vụ nào (nếu thanh toán dịch vụ)   │
└────────────┬───────────────────────────────────────────────┘
             │
             │ Gộp vào phiếu thu
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│              TRANSACTION                                     │
│         (Phiếu thanh toán chính)                            │
│  - amount: 450k (tổng cộng)                                 │
│  - method: CASH, CREDIT_CARD, v.v.                         │
│  - status: PENDING, COMPLETED, FAILED, REFUNDED            │
│  - details: [txd_001, txd_002, txd_003]                    │
└──────────────────────────────────────────────────────────────┘
```

### 📋 Bảng So Sánh 3 Bảng

| Bảng | Mục Đích | Cấp Độ | Ví Dụ |
|------|----------|--------|-------|
| **Transaction** | Ghi nhận 1 lần thanh toán | Tổng hợp | "Khách trả 4.5 triệu" |
| **TransactionDetail** | Chi tiết từng khoản trong 1 phiếu | Chi tiết | "3 triệu cho phòng, 1.5 triệu cho phòng khác" |
| **Service** | Danh sách dịch vụ có sẵn | Thông tin | "Giặt ủi 50k/kg, Massage 300k/giờ" |

---

## 8. Database Integrity Rules

### ✅ Luật Toàn Vẹn Dữ Liệu

| Rule | Kiểm Tra | Hành Động |
|------|----------|----------|
| **R1** | Tổng `TransactionDetail.amount` = `Transaction.amount` | Validate trước khi save |
| **R2** | Mỗi `TransactionDetail` có đúng 1 `bookingRoomId` HOẶC `serviceUsageId` | Check NOT NULL |
| **R3** | Nếu `transactionId = NULL` → phải có `serviceUsageId` | Guest service payment rule |
| **R4** | `TransactionDetail.transactionId` → tham chiếu tới `Transaction.id` | Foreign key |
| **R5** | `ServiceUsage.serviceId` → tham chiếu tới `Service.id` | Foreign key |
| **R6** | Refund Transaction → `amount` âm | Business logic |

---

## 9. API Endpoints Liên Quan

### 📍 Transaction APIs

```http
POST   /employee/transactions              # Tạo transaction
GET    /employee/transactions              # Danh sách transactions
GET    /employee/transactions/:id          # Chi tiết 1 transaction
GET    /employee/transaction-details       # Tìm kiếm transaction details
```

### 📍 Service APIs

```http
GET    /employee/services                  # Danh sách dịch vụ
POST   /employee/services                  # Tạo dịch vụ mới
PUT    /employee/services/:id              # Cập nhật dịch vụ
DELETE /employee/services/:id              # Xóa/vô hiệu hóa dịch vụ
```

---

## 10. Summary

### 3 Bảng Chính

1. **Transaction** = Phiếu thu chính (1 lần khách trả tiền)
2. **TransactionDetail** = Chi tiết các khoản (phân bổ tiền vào từng phòng/dịch vụ)
3. **Service** = Danh mục dịch vụ (Giặt ủi, Massage, v.v.)

### Mối Liên Kết

- Transaction ← 1:N → TransactionDetail
- TransactionDetail ← Chứa → bookingRoomId **HOẶC** serviceUsageId
- ServiceUsage ← N:1 → Service

### Quy Tắc Quan Trọng

- ✅ 1 phiếu thanh toán (Transaction) → N chi tiết (TransactionDetail)
- ✅ Tổng chi tiết PHẢI bằng tổng phiếu
- ✅ Chi tiết chỉ liên kết 1 phòng HOẶC 1 dịch vụ (không cả 2)
- ✅ Dịch vụ (Service) là thông tin giá, ServiceUsage là khi khách dùng

---

**Last Updated:** January 9, 2026  
**Version:** 1.0  
**Author:** Backend Architecture Team
