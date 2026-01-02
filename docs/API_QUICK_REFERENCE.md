# API Client Quick Reference

## Import Services

```typescript
import {
  authService,
  customerService,
  employeeService,
  roomService,
  serviceManagementService,
  bookingService,
} from '@/lib/services';
```

## Authentication

### Login (Employee)
```typescript
const { employee, tokens } = await authService.login(username, password);
// Tokens are automatically stored
```

### Logout
```typescript
await authService.logout();
// Clears all tokens and user data
```

### Get Current User Profile
```typescript
const employee = await authService.getCurrentUser();
```

### Change Password
```typescript
await authService.changePassword(currentPassword, newPassword);
```

### Refresh Tokens
```typescript
const refreshedTokens = await authService.refreshTokens();
```

## Customer Management

### Get All Customers (Paginated)
```typescript
const result = await customerService.getCustomers({
  search: "Nguyễn",
  page: 1,
  limit: 10,
  sortBy: "fullName",
  sortOrder: "asc"
});

// result: { data: Customer[], total: number, page: number, limit: number }
```

### Get Customer by ID
```typescript
const customer = await customerService.getCustomerById(customerId);
```

### Create Customer
```typescript
const newCustomer = await customerService.createCustomer({
  fullName: "Nguyễn Văn A",
  phone: "0901234567",
  password: "password123",
  email: "customer@example.com",
  idNumber: "001234567890",
  address: "123 Đường ABC"
});
```

### Update Customer
```typescript
const updated = await customerService.updateCustomer(customerId, {
  fullName: "Nguyễn Văn B",
  email: "updated@example.com"
});
```

### Delete Customer
```typescript
await customerService.deleteCustomer(customerId);
```

## Employee Management

### Get All Employees
```typescript
const result = await employeeService.getEmployees({
  search: "admin",
  role: "ADMIN",
  page: 1,
  limit: 10
});
```

### Create Employee
```typescript
const newEmployee = await employeeService.createEmployee({
  name: "Trần Văn B",
  username: "tranvanb",
  password: "password123",
  role: "RECEPTIONIST"
});
```

### Update Employee
```typescript
const updated = await employeeService.updateEmployee(employeeId, {
  name: "Trần Văn C",
  role: "ADMIN"
});
```

## Room Management

### Get All Rooms
```typescript
const result = await roomService.getRooms({
  status: "AVAILABLE",
  floor: 1,
  roomTypeId: "type_id",
  page: 1,
  limit: 20
});
```

### Update Room Status
```typescript
const updated = await roomService.updateRoom(roomId, {
  status: "CLEANING"
});
```

### Create Room
```typescript
const newRoom = await roomService.createRoom({
  roomNumber: "101",
  floor: 1,
  roomTypeId: "type_id",
  status: "AVAILABLE"
});
```

## Room Type Management

### Get All Room Types
```typescript
const result = await roomService.getRoomTypes({
  minCapacity: 2,
  maxCapacity: 4,
  minPrice: 1000000,
  maxPrice: 3000000
});
```

### Create Room Type
```typescript
const newType = await roomService.createRoomType({
  name: "Phòng Deluxe",
  capacity: 2,
  pricePerNight: 1500000,
  amenities: {
    wifi: true,
    airConditioner: true,
    minibar: true
  }
});
```

## Service Management

### Get All Services
```typescript
const result = await serviceManagementService.getServices({
  isActive: true,
  minPrice: 10000,
  maxPrice: 100000
});
```

### Create Service
```typescript
const newService = await serviceManagementService.createService({
  name: "Giặt ủi",
  price: 50000,
  unit: "kg",
  isActive: true
});
```

### Update Service
```typescript
const updated = await serviceManagementService.updateService(serviceId, {
  price: 60000,
  isActive: false
});
```

## Booking Management

### Create Booking
```typescript
const booking = await bookingService.createBooking({
  rooms: [
    { roomTypeId: "type_1", count: 2 },
    { roomTypeId: "type_2", count: 1 }
  ],
  checkInDate: "2025-12-25T14:00:00Z",
  checkOutDate: "2025-12-27T12:00:00Z",
  totalGuests: 4
});

// Returns: { bookingId, bookingCode, expiresAt, totalAmount }
```

### Check In
```typescript
const result = await bookingService.checkIn({
  bookingId: "booking_123",
  bookingRoomId: "room_456",
  guests: [
    { customerId: "customer_1", isPrimary: true },
    { customerId: "customer_2", isPrimary: false }
  ]
});
```

### Create Transaction
```typescript
const transaction = await bookingService.createTransaction({
  bookingId: "booking_123",
  transactionType: "DEPOSIT",
  amount: 500000,
  method: "BANK_TRANSFER",
  transactionRef: "TXN123456",
  description: "Initial deposit"
});
```

## Error Handling

### Basic Try-Catch
```typescript
try {
  const customer = await customerService.getCustomerById(id);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Error ${error.statusCode}: ${error.message}`);
  }
}
```

### Handling Specific Status Codes
```typescript
try {
  await authService.login(username, password);
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 401:
        setError("Tên đăng nhập hoặc mật khẩu không đúng");
        break;
      case 400:
        // Validation error
        const validationErrors = error.data?.errors || [];
        // Handle validation errors
        break;
      case 404:
        setError("Không tìm thấy tài nguyên");
        break;
      case 0:
        setError("Không thể kết nối đến máy chủ");
        break;
      default:
        setError("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  }
}
```

## Common Patterns

### Using in React Hook
```typescript
import { useState, useEffect } from 'react';
import { customerService } from '@/lib/services';
import type { Customer } from '@/lib/types/api';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await customerService.getCustomers();
        setCustomers(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  return { customers, loading, error };
}
```

### Pagination Hook
```typescript
import { useState } from 'react';
import { customerService } from '@/lib/services';

export function useCustomerPagination() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [data, setData] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadPage = async () => {
    setLoading(true);
    try {
      const result = await customerService.getCustomers({ page, limit });
      setData(result.data);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    total,
    loading,
    page,
    setPage,
    limit,
    loadPage,
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1
  };
}
```

## Type Definitions

### Room Status
```typescript
type RoomStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "OCCUPIED"
  | "CLEANING"
  | "MAINTENANCE"
  | "OUT_OF_SERVICE";
```

### Employee Role
```typescript
type EmployeeRole = "ADMIN" | "RECEPTIONIST" | "HOUSEKEEPING" | "STAFF";
```

### Transaction Type
```typescript
type TransactionType =
  | "DEPOSIT"
  | "ROOM_CHARGE"
  | "SERVICE_CHARGE"
  | "REFUND"
  | "ADJUSTMENT";
```

### Payment Method
```typescript
type PaymentMethod =
  | "CASH"
  | "CREDIT_CARD"
  | "BANK_TRANSFER"
  | "E_WALLET";
```

## Configuration

### Set API Base URL
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
```

### Toggle Mock Mode
```typescript
// In your component
const USE_MOCK = process.env.NODE_ENV === 'development';

if (USE_MOCK) {
  // Use mock data
} else {
  // Use real API
  const data = await customerService.getCustomers();
}
```

## Tips

1. **Always handle errors**: API calls can fail, always wrap in try-catch
2. **Use TypeScript**: All services return typed data, leverage autocomplete
3. **Check authentication**: Most endpoints require auth, ensure user is logged in
4. **Pagination**: Large lists use pagination, don't fetch everything at once
5. **Loading states**: Show loading indicators during API calls
6. **Optimistic updates**: Update UI immediately, then sync with server
7. **Cache data**: Consider using React Query or SWR for automatic caching
8. **Retry logic**: Implement retry for transient failures
