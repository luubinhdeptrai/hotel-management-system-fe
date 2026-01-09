# Transaction & Service Implementation Guide

## 🎯 Overview

This guide demonstrates how to use the newly implemented transaction and service payment features that are now compatible with the backend API.

## 📚 Table of Contents

1. [Basic Usage Examples](#basic-usage-examples)
2. [Payment Scenarios](#payment-scenarios)
3. [Service Management](#service-management)
4. [Validation & Error Handling](#validation--error-handling)
5. [Component Integration](#component-integration)

---

## Basic Usage Examples

### 1. Creating a Full Booking Payment (Scenario 1)

```typescript
import { transactionService } from "@/lib/services/transaction.service";
import { validateTransactionRequest } from "@/lib/utils/transaction-validators";

// Prepare transaction data
const transactionData = {
  bookingId: "booking_123",
  paymentMethod: "CASH" as const,
  transactionType: "ROOM_CHARGE" as const,
  description: "Full payment for booking #BK001",
  employeeId: currentUser.id, // From auth context
};

// Validate before submitting
const validation = validateTransactionRequest(transactionData);
if (!validation.valid) {
  alert(validation.error);
  return;
}

// Create transaction
try {
  const result = await transactionService.createTransaction(transactionData);
  console.log("Transaction created:", result);
  // Update UI, show success message
} catch (error) {
  console.error("Payment failed:", error);
  // Show error message
}
```

### 2. Creating a Split Room Payment (Scenario 2)

```typescript
const transactionData = {
  bookingId: "booking_123",
  bookingRoomIds: ["room_001", "room_002"], // Pay these 2 rooms only
  paymentMethod: "CREDIT_CARD" as const,
  transactionType: "ROOM_CHARGE" as const,
  description: "Partial payment for rooms 101 and 102",
  employeeId: currentUser.id,
  promotionApplications: [
    {
      customerPromotionId: "promo_456",
      bookingRoomId: "room_001", // Apply promotion to room 001 only
    },
  ],
};

const result = await transactionService.createTransaction(transactionData);
```

### 3. Creating a Service Payment (Scenario 3)

```typescript
const transactionData = {
  bookingId: "booking_123",
  serviceUsageId: "service_usage_789", // Specific service to pay
  paymentMethod: "BANK_TRANSFER" as const,
  transactionType: "SERVICE_CHARGE" as const,
  description: "Payment for Spa service",
  employeeId: currentUser.id,
  promotionApplications: [
    {
      customerPromotionId: "promo_spa50",
      serviceUsageId: "service_usage_789", // Service-specific discount
    },
  ],
};

const result = await transactionService.createTransaction(transactionData);
```

### 4. Creating a Guest Service Payment (Scenario 4)

```typescript
// For walk-in guests (no booking)
const transactionData = {
  serviceUsageId: "service_usage_999",
  paymentMethod: "CASH" as const,
  transactionType: "SERVICE_CHARGE" as const,
  description: "Guest laundry service",
  employeeId: currentUser.id,
  // Note: No bookingId, no promotions for guest services
};

const result = await transactionService.createTransaction(transactionData);
```

---

## Payment Scenarios

### Using Enhanced Payment Modal

```typescript
import { PaymentModalEnhanced } from "@/components/payments/payment-modal-enhanced";

function CheckoutPage() {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  
  const handlePaymentConfirm = async (data: PaymentData) => {
    const transactionData = {
      bookingId: booking.id,
      paymentMethod: data.method,
      transactionType: "ROOM_CHARGE" as const,
      bookingRoomIds: data.bookingRoomIds,
      serviceUsageId: data.serviceUsageId,
      description: data.description,
      employeeId: currentUser.id,
    };

    try {
      await transactionService.createTransaction(transactionData);
      alert("Thanh toán thành công!");
      setPaymentModalOpen(false);
      // Refresh data
    } catch (error) {
      alert("Thanh toán thất bại!");
    }
  };

  return (
    <>
      <Button onClick={() => setPaymentModalOpen(true)}>
        Thanh toán
      </Button>

      <PaymentModalEnhanced
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        summary={checkoutSummary}
        bookingId={booking.id}
        availableRooms={booking.rooms.map(r => ({
          id: r.id,
          name: r.roomNumber,
          balance: r.balance,
        }))}
        availableServices={booking.services.map(s => ({
          id: s.id,
          name: s.serviceName,
          balance: s.balance,
        }))}
        onConfirm={handlePaymentConfirm}
      />
    </>
  );
}
```

### Using Service Payment Modal

```typescript
import { ServicePaymentModal } from "@/components/payments/service-payment-modal";
import { parseServiceUsage } from "@/lib/utils/service-helpers";

function ServiceList() {
  const [selectedService, setSelectedService] = useState<ServiceUsageResponse | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const handleServicePayment = async (data: ServicePaymentData) => {
    const transactionData = {
      bookingId: booking?.id, // Present for Scenario 3, absent for Scenario 4
      serviceUsageId: data.serviceUsageId,
      paymentMethod: data.paymentMethod,
      transactionType: "SERVICE_CHARGE" as const,
      description: data.description,
      employeeId: currentUser.id,
    };

    try {
      await transactionService.createTransaction(transactionData);
      alert("Thanh toán dịch vụ thành công!");
      setPaymentModalOpen(false);
      // Refresh service list
    } catch (error) {
      alert("Thanh toán thất bại!");
    }
  };

  return (
    <>
      {services.map((service) => (
        <div key={service.id}>
          <span>{service.serviceName}</span>
          <span>Balance: {service.balance}</span>
          <Button
            onClick={() => {
              setSelectedService(parseServiceUsage(service));
              setPaymentModalOpen(true);
            }}
            disabled={service.balance === 0}
          >
            Thanh toán
          </Button>
        </div>
      ))}

      <ServicePaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        serviceUsage={selectedService}
        bookingId={booking?.id}
        onConfirm={handleServicePayment}
      />
    </>
  );
}
```

---

## Service Management

### Creating Service Usage

```typescript
import { validateServiceUsageRequest } from "@/lib/utils/transaction-validators";

const serviceUsageData = {
  bookingId: "booking_123",
  bookingRoomId: "room_001",
  serviceId: "service_456",
  quantity: 2,
  employeeId: currentUser.id,
};

// Validate
const validation = validateServiceUsageRequest(serviceUsageData);
if (!validation.valid) {
  alert(validation.error);
  return;
}

// Create service usage via API
const result = await api.post("/employee-api/v1/service/service-usage", serviceUsageData);
```

### Parsing Service Responses

```typescript
import { parseService, parseServiceUsage, parseServices } from "@/lib/utils/service-helpers";

// Parse single service
const serviceFromAPI = await api.get("/employee-api/v1/services/123");
const service = parseService(serviceFromAPI.data);
console.log(service.price); // Now a number, not string

// Parse service array
const servicesFromAPI = await api.get("/employee-api/v1/services");
const services = parseServices(servicesFromAPI.data);

// Parse service usage with calculated balance
const usageFromAPI = await api.get("/employee-api/v1/service/service-usage/456");
const usage = parseServiceUsage(usageFromAPI.data);
console.log(usage.balance); // Calculated: totalPrice - totalPaid
```

### Calculating Service Totals

```typescript
import {
  calculateTotalServiceCharges,
  calculateTotalServiceBalance,
  getUnpaidServices,
} from "@/lib/utils/service-helpers";

const allServices = parseServiceUsages(rawServicesFromAPI);

// Total charges
const totalCharges = calculateTotalServiceCharges(allServices);
console.log("Total service charges:", totalCharges);

// Total unpaid balance
const totalBalance = calculateTotalServiceBalance(allServices);
console.log("Total service balance:", totalBalance);

// Filter unpaid services
const unpaidServices = getUnpaidServices(allServices);
console.log("Unpaid services:", unpaidServices);
```

---

## Validation & Error Handling

### Using Validation Helpers

```typescript
import {
  validateTransactionRequest,
  validateServiceUsageRequest,
  validatePromotionApplication,
  validatePaymentAmount,
} from "@/lib/utils/transaction-validators";

// Validate transaction request
const txnValidation = validateTransactionRequest(transactionData);
if (!txnValidation.valid) {
  showError(txnValidation.error);
  return;
}

// Validate service usage
const svcValidation = validateServiceUsageRequest(serviceData);
if (!svcValidation.valid) {
  showError(svcValidation.error);
  return;
}

// Validate promotion
const promoValidation = validatePromotionApplication({
  customerPromotionId: "promo_123",
  bookingRoomId: "room_001",
  // Cannot have both room and service
  // serviceUsageId: "service_456", // ❌ This would fail validation
});

// Validate payment amount
const amountValidation = validatePaymentAmount(inputAmount, serviceBalance);
if (!amountValidation.valid) {
  showError(amountValidation.error);
  return;
}
```

### Handling API Errors

```typescript
try {
  const result = await transactionService.createTransaction(data);
  // Success
} catch (error: any) {
  // Handle specific error cases
  if (error.response?.status === 400) {
    // Validation error
    alert(`Lỗi: ${error.response.data.message}`);
  } else if (error.response?.status === 404) {
    // Not found
    alert("Không tìm thấy booking hoặc dịch vụ");
  } else if (error.response?.status === 403) {
    // Forbidden
    alert("Bạn không có quyền thực hiện thao tác này");
  } else {
    // Generic error
    alert("Đã xảy ra lỗi, vui lòng thử lại");
  }
  console.error("API Error:", error);
}
```

---

## Component Integration

### Using Enhanced Transaction Table

```typescript
import { TransactionTableEnhanced } from "@/components/folio/transaction-table-enhanced";
import type { FolioTransaction } from "@/lib/types/folio";

function FolioPage() {
  const [transactions, setTransactions] = useState<FolioTransaction[]>([]);

  const handleVoidTransaction = async (txnId: string) => {
    if (!confirm("Bạn có chắc muốn hủy giao dịch này?")) return;

    try {
      await api.post(`/employee-api/v1/transactions/${txnId}/void`);
      // Refresh transactions
      fetchTransactions();
    } catch (error) {
      alert("Không thể hủy giao dịch");
    }
  };

  return (
    <TransactionTableEnhanced
      transactions={transactions}
      onVoidTransaction={handleVoidTransaction}
      isFolioClosed={folio.status === "CLOSED"}
    />
  );
}
```

### Type Safety with Enums

```typescript
import {
  PAYMENT_METHOD_LABELS,
  TRANSACTION_STATUS_LABELS,
  SERVICE_USAGE_STATUS_LABELS,
} from "@/lib/types/api";
import {
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_COLORS,
} from "@/lib/types/folio";

// Display payment method
<span>{PAYMENT_METHOD_LABELS[transaction.method]}</span>

// Display transaction type with color
<Badge className={TRANSACTION_TYPE_COLORS[transaction.type]}>
  {TRANSACTION_TYPE_LABELS[transaction.type]}
</Badge>

// Display status
<Badge>{TRANSACTION_STATUS_LABELS[transaction.status]}</Badge>
```

---

## 🧪 Testing Checklist

### Scenario 1: Full Booking Payment
- [ ] Create booking with multiple rooms and services
- [ ] Open payment modal, select "full payment"
- [ ] Choose payment method
- [ ] Verify total amount is correct
- [ ] Submit payment
- [ ] Verify booking status updated to CHECKED_OUT
- [ ] Verify all balances are 0
- [ ] Verify transaction appears in folio

### Scenario 2: Split Room Payment
- [ ] Create booking with 3+ rooms
- [ ] Open enhanced payment modal
- [ ] Select "split rooms" scenario
- [ ] Check 2 out of 3 rooms
- [ ] Apply room-specific promotion
- [ ] Submit payment
- [ ] Verify only selected rooms paid
- [ ] Verify booking still has balance
- [ ] Verify booking NOT checked out yet

### Scenario 3: Service Payment
- [ ] Create booking with services
- [ ] Click "Pay Service" on service row
- [ ] Service payment modal opens
- [ ] Enter partial payment amount
- [ ] Submit payment
- [ ] Verify service totalPaid updated
- [ ] Verify service balance updated
- [ ] Pay remaining balance
- [ ] Verify service status → COMPLETED

### Scenario 4: Guest Service Payment
- [ ] Create service usage WITHOUT booking
- [ ] Open service payment modal
- [ ] Verify "guest service" mode active
- [ ] Verify no promotions available
- [ ] Submit payment
- [ ] Verify TransactionDetail created (no Transaction entity)
- [ ] Verify service marked complete

### Validation Tests
- [ ] Try to create transaction without employeeId → Should fail
- [ ] Try to pay more than balance → Should fail
- [ ] Try to apply promotion to both room AND service → Should fail
- [ ] Try to create service usage without employeeId → Should fail
- [ ] Try to select 0 rooms in split payment → Should fail

---

## 📖 API Reference Quick Links

- **Backend API Documentation**: `roommaster-be/docs/TRANSACTION_API.md`
- **Compatibility Analysis**: `hotel-management-system-fe/TRANSACTION_SERVICE_COMPATIBILITY_ANALYSIS.md`
- **Type Definitions**: `hotel-management-system-fe/lib/types/api.ts`
- **Service Helpers**: `hotel-management-system-fe/lib/utils/service-helpers.ts`
- **Validators**: `hotel-management-system-fe/lib/utils/transaction-validators.ts`

---

## ⚠️ Common Pitfalls

1. **Forgetting employeeId**: All transactions and service usages REQUIRE employeeId
2. **Wrong PaymentMethod values**: Use enum values ("CASH"), not Vietnamese labels
3. **Price type confusion**: Backend returns Decimal as string, parse with `parseDecimalPrice()`
4. **Missing serviceUsageId**: Scenarios 3 & 4 require serviceUsageId
5. **Wrong API endpoints**: Use `/employee-api/v1/...` not `/employee/...`

---

## 🎓 Best Practices

1. **Always validate before API calls**: Use validation helpers
2. **Parse all backend responses**: Use service-helpers for consistent parsing
3. **Use type-safe enums**: Import label constants for display
4. **Handle partial payments**: Support amount input in service payments
5. **Show transaction details**: Use enhanced table with expandable rows
6. **Track audit trail**: Always include employeeId and description
7. **Test all 4 scenarios**: Don't assume Scenario 1 works means all work

---

**Last Updated**: 2026-01-09  
**Version**: 1.0  
**Status**: ✅ Implementation Complete
