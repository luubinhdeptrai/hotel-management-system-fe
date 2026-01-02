# Backend API Documentation - Complete Reference

## API Tổng Quan

**Base URL:** `http://localhost:3000/api/v1`

**Authentication:** JWT Bearer token in `Authorization` header
```
Authorization: Bearer <token>
```

**Response Format (Success):**
```json
{
  "code": 200,
  "message": "Success",
  "data": { /* response data */ }
}
```

**Response Format (Error):**
```json
{
  "code": 400,
  "message": "Error message"
}
```

---

## 🔐 Authentication APIs

### 1. Employee Login
- **Method:** `POST`
- **Path:** `/employee/auth/login`
- **Auth Required:** ❌ No
- **Description:** Nhân viên đăng nhập

**Request Body:**
```json
{
  "username": "string (required, 3-50 chars)",
  "password": "string (required, min 8 chars)"
}
```

**Response (200 OK):**
```json
{
  "employee": {
    "id": "string",
    "name": "string",
    "username": "string",
    "role": "ADMIN | RECEPTIONIST | HOUSEKEEPING | STAFF",
    "updatedAt": "ISO datetime"
  },
  "tokens": {
    "access": {
      "token": "JWT string",
      "expires": "2025-01-01T10:15:00Z"
    },
    "refresh": {
      "token": "JWT string",
      "expires": "2025-01-08T10:00:00Z"
    }
  }
}
```

**Errors:**
- `401 Unauthorized` - Username/password sai
- `400 Bad Request` - Validation error

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/employee/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin1",
    "password": "password123"
  }'
```

---

### 2. Employee Logout
- **Method:** `POST`
- **Path:** `/employee/auth/logout`
- **Auth Required:** ✅ Yes (Employee)

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response (204 No Content):** Empty body

---

### 3. Refresh Employee Tokens
- **Method:** `POST`
- **Path:** `/employee/auth/refresh-tokens`
- **Auth Required:** ❌ No

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response (200 OK):**
```json
{
  "access": {
    "token": "JWT string",
    "expires": "2025-01-01T10:15:00Z"
  },
  "refresh": {
    "token": "JWT string",
    "expires": "2025-01-08T10:00:00Z"
  }
}
```

---

### 4. Customer Register
- **Method:** `POST`
- **Path:** `/customer/auth/register`
- **Auth Required:** ❌ No

**Request Body:**
```json
{
  "fullName": "string (required, 1-100 chars)",
  "phone": "string (required, unique, 10-20 chars)",
  "password": "string (required, min 8 chars)",
  "email": "string (optional, email format)",
  "idNumber": "string (optional, CMND/CCCD)",
  "address": "string (optional)"
}
```

**Response (201 Created):**
```json
{
  "customer": {
    "id": "string",
    "fullName": "string",
    "phone": "string",
    "email": "string or null",
    "idNumber": "string or null",
    "address": "string or null",
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime"
  },
  "tokens": {
    "access": { "token": "JWT", "expires": "ISO datetime" },
    "refresh": { "token": "JWT", "expires": "ISO datetime" }
  }
}
```

**Errors:**
- `400 Bad Request` - Phone đã tồn tại hoặc validation error

---

### 5. Customer Login
- **Method:** `POST`
- **Path:** `/customer/auth/login`
- **Auth Required:** ❌ No

**Request Body:**
```json
{
  "phone": "string (required)",
  "password": "string (required)"
}
```

**Response (200 OK):** Same as Register response

**Errors:**
- `401 Unauthorized` - Phone/password sai

---

### 6. Customer Logout
- **Method:** `POST`
- **Path:** `/customer/auth/logout`
- **Auth Required:** ✅ Yes (Customer)

**Response (204 No Content):** Empty

---

### 7. Refresh Customer Tokens
- **Method:** `POST`
- **Path:** `/customer/auth/refresh-tokens`
- **Auth Required:** ❌ No

**Response (200 OK):** Same as Employee refresh response

---

## 👥 Employee Management APIs

### 1. Create Employee
- **Method:** `POST`
- **Path:** `/employee/employees`
- **Auth Required:** ✅ Yes (Admin)

**Request Body:**
```json
{
  "name": "string (required, 1-100 chars)",
  "username": "string (required, 3-50 chars, unique)",
  "password": "string (required, min 8 chars)",
  "role": "ADMIN | RECEPTIONIST | HOUSEKEEPING | STAFF (default: STAFF)"
}
```

**Response (201 Created):**
```json
{
  "id": "string",
  "name": "string",
  "username": "string",
  "role": "string",
  "updatedAt": "ISO datetime"
}
```

**Errors:**
- `400 Bad Request` - Username đã tồn tại, validation error
- `401 Unauthorized` - Not admin

---

### 2. List Employees
- **Method:** `GET`
- **Path:** `/employee/employees`
- **Auth Required:** ✅ Yes (Employee)

**Query Parameters:**
```
GET /employee/employees?search=john&role=RECEPTIONIST&page=1&limit=10&sortBy=name&sortOrder=asc
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | - | Search by name/username |
| `role` | string | - | Filter by role |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 100) |
| `sortBy` | string | `name` | Field: name, username, role, createdAt, updatedAt |
| `sortOrder` | string | `asc` | asc or desc |

**Response (200 OK):**
```json
{
  "data": {
    "data": [
      {
        "id": "string",
        "name": "string",
        "username": "string",
        "role": "string",
        "updatedAt": "ISO datetime"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10
  }
}
```

---

### 3. Get Employee by ID
- **Method:** `GET`
- **Path:** `/employee/employees/:employeeId`
- **Auth Required:** ✅ Yes (Employee)

**Response (200 OK):** Single employee object

---

### 4. Update Employee
- **Method:** `PUT`
- **Path:** `/employee/employees/:employeeId`
- **Auth Required:** ✅ Yes (Admin)

**Request Body:**
```json
{
  "name": "string (optional)",
  "role": "ADMIN | RECEPTIONIST | HOUSEKEEPING | STAFF (optional)"
}
```

**Response (200 OK):** Updated employee object

**Note:** Username **cannot** be updated

---

### 5. Delete Employee
- **Method:** `DELETE`
- **Path:** `/employee/employees/:employeeId`
- **Auth Required:** ✅ Yes (Admin)

**Response (204 No Content):** Empty

**Errors:**
- `400 Bad Request` - Nhân viên có transaction history (protect data integrity)

---

## 👤 Customer Management APIs

### 1. Create Customer (by Employee)
- **Method:** `POST`
- **Path:** `/employee/customers`
- **Auth Required:** ✅ Yes (Employee)

**Request Body:**
```json
{
  "fullName": "string (required)",
  "phone": "string (required, unique)",
  "password": "string (required, min 8)",
  "email": "string (optional)",
  "idNumber": "string (optional)",
  "address": "string (optional)"
}
```

**Response (201 Created):**
```json
{
  "id": "string",
  "fullName": "string",
  "phone": "string",
  "email": "string or null",
  "idNumber": "string or null",
  "address": "string or null",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

---

### 2. List Customers
- **Method:** `GET`
- **Path:** `/employee/customers`
- **Auth Required:** ✅ Yes (Employee)

**Query Parameters:**
```
GET /employee/customers?search=john&page=1&limit=10&sortBy=fullName&sortOrder=asc
```

| Param | Type | Default |
|-------|------|---------|
| `search` | string | - |
| `page` | number | 1 |
| `limit` | number | 10 |
| `sortBy` | string | `fullName` |
| `sortOrder` | string | `asc` |

**Response (200 OK):**
```json
{
  "data": {
    "data": [
      {
        "id": "string",
        "fullName": "string",
        "phone": "string",
        "email": "string or null",
        "idNumber": "string or null",
        "address": "string or null",
        "createdAt": "ISO datetime",
        "updatedAt": "ISO datetime",
        "_count": {
          "bookings": 5,
          "customerPromotions": 2
        }
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 10
  }
}
```

---

### 3. Get Customer by ID
- **Method:** `GET`
- **Path:** `/employee/customers/:customerId`
- **Auth Required:** ✅ Yes (Employee)

**Response (200 OK):** Single customer object with counts

---

### 4. Update Customer
- **Method:** `PUT`
- **Path:** `/employee/customers/:customerId`
- **Auth Required:** ✅ Yes (Employee)

**Request Body:**
```json
{
  "fullName": "string (optional)",
  "email": "string (optional)",
  "idNumber": "string (optional)",
  "address": "string (optional)"
}
```

**Response (200 OK):** Updated customer object

**Note:** Phone **cannot** be updated (login key)

---

### 5. Delete Customer
- **Method:** `DELETE`
- **Path:** `/employee/customers/:customerId`
- **Auth Required:** ✅ Yes (Employee)

**Response (204 No Content)**

**Errors:**
- `400 Bad Request` - Khách có booking history

---

## 🛏️ Room Type Management APIs

### 1. Create Room Type
- **Method:** `POST`
- **Path:** `/employee/room-types`
- **Auth Required:** ✅ Yes (Employee)

**Request Body:**
```json
{
  "name": "string (required, unique, max 100)",
  "capacity": "number (required, min 1)",
  "totalBed": "number (required, min 1)",
  "pricePerNight": "number (required, min 0, decimal)",
  "tagIds": ["string"] (optional, room tag IDs)
}
```

**Response (201 Created):**
```json
{
  "id": "string",
  "name": "string",
  "capacity": 2,
  "totalBed": 2,
  "pricePerNight": "1500000.00",
  "roomTypeTags": [
    {
      "id": "string",
      "name": "wifi"
    }
  ],
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

---

### 2. List Room Types
- **Method:** `GET`
- **Path:** `/employee/room-types`
- **Auth Required:** ✅ Yes (Employee)

**Query Parameters:**
```
GET /employee/room-types?search=deluxe&minCapacity=2&maxCapacity=4&minPrice=1000000&maxPrice=2000000&page=1&limit=10
```

| Param | Type | Default |
|-------|------|---------|
| `search` | string | - |
| `minCapacity` | number | - |
| `maxCapacity` | number | - |
| `minPrice` | number | - |
| `maxPrice` | number | - |
| `page` | number | 1 |
| `limit` | number | 10 |

**Response (200 OK):** List with _count (rooms, bookingRooms)

---

### 3. Get Room Type by ID
- **Method:** `GET`
- **Path:** `/employee/room-types/:roomTypeId`
- **Auth Required:** ✅ Yes

**Response (200 OK):** Single room type with tags and counts

---

### 4. Update Room Type
- **Method:** `PUT`
- **Path:** `/employee/room-types/:roomTypeId`
- **Auth Required:** ✅ Yes (Employee)

**Request Body:**
```json
{
  "name": "string (optional)",
  "capacity": "number (optional)",
  "totalBed": "number (optional)",
  "pricePerNight": "number (optional)",
  "tagIds": ["string"] (optional, replaces all tags)
}
```

**Response (200 OK):** Updated room type

---

### 5. Delete Room Type
- **Method:** `DELETE`
- **Path:** `/employee/room-types/:roomTypeId`
- **Auth Required:** ✅ Yes

**Response (204 No Content)**

**Errors:**
- `400 Bad Request` - Có phòng gán với loại này

---

## 🚪 Room Management APIs

### 1. Create Room
- **Method:** `POST`
- **Path:** `/employee/rooms`
- **Auth Required:** ✅ Yes (Employee)

**Request Body:**
```json
{
  "roomNumber": "string (required, unique, max 50)",
  "floor": "number (required)",
  "roomTypeId": "string (required)",
  "status": "AVAILABLE | RESERVED | OCCUPIED | CLEANING | MAINTENANCE | OUT_OF_SERVICE (default: AVAILABLE)",
  "code": "string (optional)"
}
```

**Response (201 Created):**
```json
{
  "id": "string",
  "roomNumber": "string",
  "floor": 1,
  "code": "string or empty",
  "status": "AVAILABLE",
  "roomTypeId": "string",
  "roomType": {
    "id": "string",
    "name": "string",
    "capacity": 2,
    "pricePerNight": "1500000.00"
  },
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

---

### 2. List Rooms
- **Method:** `GET`
- **Path:** `/employee/rooms`
- **Auth Required:** ✅ Yes

**Query Parameters:**
```
GET /employee/rooms?search=101&status=AVAILABLE&floor=1&roomTypeId=xxx&page=1&limit=10&sortBy=roomNumber&sortOrder=asc
```

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Room number search |
| `status` | string | Filter by status |
| `floor` | number | Filter by floor |
| `roomTypeId` | string | Filter by room type |
| `page` | number | Page number |
| `limit` | number | Items per page |
| `sortBy` | string | roomNumber, floor, status, createdAt, updatedAt |
| `sortOrder` | string | asc/desc |

**Response (200 OK):**
```json
{
  "data": {
    "data": [
      {
        "id": "string",
        "roomNumber": "string",
        "floor": 1,
        "status": "AVAILABLE",
        "roomType": { /* room type info */ },
        "createdAt": "ISO datetime",
        "_count": { "bookingRooms": 10 }
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

---

### 3. Get Room by ID
- **Method:** `GET`
- **Path:** `/employee/rooms/:roomId`
- **Auth Required:** ✅ Yes

**Response (200 OK):** Single room with type and count

---

### 4. Update Room
- **Method:** `PUT`
- **Path:** `/employee/rooms/:roomId`
- **Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "roomNumber": "string (optional)",
  "floor": "number (optional)",
  "roomTypeId": "string (optional)",
  "status": "status enum (optional)",
  "code": "string (optional)"
}
```

**Response (200 OK):** Updated room

**Validation:**
- Check roomNumber unique if changed
- Check roomTypeId exists if changed

---

### 5. Delete Room
- **Method:** `DELETE`
- **Path:** `/employee/rooms/:roomId`
- **Auth Required:** ✅ Yes

**Response (204 No Content)**

**Errors:**
- `400 Bad Request` - Có booking history

---

## 🛎️ Service Management APIs

### 1. Create Service
- **Method:** `POST`
- **Path:** `/employee/services`
- **Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "name": "string (required, unique, max 100)",
  "price": "number (required, min 0, decimal)",
  "unit": "string (optional, default: 'lần', max 50)",
  "isActive": "boolean (optional, default: true)"
}
```

**Response (201 Created):**
```json
{
  "id": "string",
  "name": "string",
  "price": "50000.00",
  "unit": "kg",
  "isActive": true,
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

---

### 2. List Services
- **Method:** `GET`
- **Path:** `/employee/services`
- **Auth Required:** ✅ Yes

**Query Parameters:**
```
GET /employee/services?search=laundry&isActive=true&minPrice=10000&maxPrice=100000&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "data": {
    "data": [
      {
        "id": "string",
        "name": "string",
        "price": "50000.00",
        "unit": "kg",
        "isActive": true,
        "createdAt": "ISO datetime",
        "updatedAt": "ISO datetime",
        "_count": { "serviceUsages": 25 }
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 10
  }
}
```

---

### 3-5. Get/Update/Delete Service
Similar to Room Type APIs (see above for structure)

---

## 📅 Booking Management APIs ⭐

### 1. Create Booking (Customer)
- **Method:** `POST`
- **Path:** `/customer/bookings`
- **Auth Required:** ✅ Yes (Customer)

**Request Body:**
```json
{
  "rooms": [
    {
      "roomTypeId": "string",
      "count": "number (min 1)"
    }
  ],
  "checkInDate": "ISO datetime (required)",
  "checkOutDate": "ISO datetime (required)",
  "totalGuests": "number (required, min 1)"
}
```

**Example:**
```json
{
  "rooms": [
    { "roomTypeId": "rt1", "count": 2 },
    { "roomTypeId": "rt2", "count": 1 }
  ],
  "checkInDate": "2025-02-01T14:00:00Z",
  "checkOutDate": "2025-02-05T12:00:00Z",
  "totalGuests": 5
}
```

**Response (201 Created):**
```json
{
  "bookingId": "string",
  "bookingCode": "BK1735689600123ABC",
  "expiresAt": "2025-01-01T10:15:00Z",
  "totalAmount": 6000000,
  "depositRequired": 3000000,
  "booking": {
    "id": "string",
    "bookingCode": "string",
    "status": "PENDING",
    "primaryCustomerId": "string",
    "checkInDate": "ISO datetime",
    "checkOutDate": "ISO datetime",
    "totalGuests": 5,
    "totalAmount": 6000000,
    "depositRequired": 3000000,
    "totalDeposit": 0,
    "totalPaid": 0,
    "balance": 6000000,
    "bookingRooms": [
      {
        "id": "string",
        "roomId": "string",
        "roomNumber": "101",
        "roomTypeName": "Deluxe",
        "pricePerNight": 1500000,
        "subtotalRoom": 6000000,
        "totalAmount": 6000000,
        "balance": 6000000,
        "status": "PENDING",
        "actualCheckIn": null,
        "actualCheckOut": null
      }
    ],
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime"
  }
}
```

**Errors:**
- `409 Conflict` - Không đủ phòng sẵn sàng
- `400 Bad Request` - Validation error, dates invalid
- `404 Not Found` - Room type không tồn tại

**Logic Chi Tiết:**
- Backend tự động tìm N phòng của loại đó có trạng thái AVAILABLE
- Check xung đột: booking nào có status = PENDING/CONFIRMED/CHECKED_IN và date overlap?
- Nếu ok → Set room status = RESERVED
- Generate unique booking code
- Booking expires sau 15 phút nếu không confirm

---

### 2. Get Booking Details
- **Method:** `GET`
- **Path:** `/customer/bookings/:id` or `/employee/bookings/:id`
- **Auth Required:** ✅ Yes

**Response (200 OK):**
```json
{
  "id": "string",
  "bookingCode": "string",
  "status": "PENDING | CONFIRMED | CHECKED_IN | PARTIALLY_CHECKED_OUT | CHECKED_OUT",
  "primaryCustomer": {
    "id": "string",
    "fullName": "string",
    "phone": "string",
    "email": "string or null"
  },
  "checkInDate": "ISO datetime",
  "checkOutDate": "ISO datetime",
  "totalGuests": 5,
  "totalAmount": 6000000,
  "totalPaid": 0,
  "balance": 6000000,
  "bookingRooms": [
    {
      "id": "string",
      "roomId": "string",
      "roomNumber": "101",
      "roomType": { /* type info */ },
      "status": "PENDING",
      "pricePerNight": 1500000,
      "subtotalRoom": 6000000,
      "subtotalService": 0,
      "totalAmount": 6000000,
      "totalPaid": 0,
      "balance": 6000000,
      "actualCheckIn": null,
      "actualCheckOut": null,
      "bookingCustomers": [
        {
          "customer": { "fullName": "John", "phone": "0901..." },
          "isPrimary": false
        }
      ],
      "serviceUsages": [
        {
          "id": "string",
          "serviceName": "Giặt ủi",
          "quantity": 2,
          "totalPrice": 100000,
          "totalPaid": 0,
          "status": "PENDING"
        }
      ]
    }
  ],
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

---

### 3. Check-in Booking Rooms ⭐
- **Method:** `POST`
- **Path:** `/employee/bookings/check-in`
- **Auth Required:** ✅ Yes (Employee)

**Request Body:**
```json
{
  "checkInInfo": [
    {
      "bookingRoomId": "string",
      "customerIds": ["customer1", "customer2"]
    }
  ]
}
```

**Example:**
```json
{
  "checkInInfo": [
    {
      "bookingRoomId": "br1",
      "customerIds": ["cust1", "cust2"]
    },
    {
      "bookingRoomId": "br2",
      "customerIds": ["cust3"]
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "bookingRooms": [
    {
      "id": "br1",
      "roomNumber": "101",
      "status": "CHECKED_IN",
      "actualCheckIn": "ISO datetime (now)",
      "bookingCustomers": [
        {
          "customer": { "id": "cust1", "fullName": "John", "phone": "..." }
        }
      ]
    }
  ]
}
```

**Validation:**
- Tất cả booking rooms phải status = CONFIRMED
- Tất cả customers phải tồn tại
- Update bookingRoom status = CHECKED_IN + actualCheckIn = now
- Update room status = OCCUPIED
- Create BookingCustomer associations
- Create CHECKED_IN activity logs
- Auto-update booking status nếu tất cả rooms checked-in

**Supports partial check-in:** Có thể check-in 2/3 rooms, 1 room vẫn CONFIRMED

---

### 4. Check-out Booking Rooms ⭐
- **Method:** `POST`
- **Path:** `/employee/bookings/check-out`
- **Auth Required:** ✅ Yes (Employee)

**Request Body:**
```json
{
  "bookingRoomIds": ["br1", "br2"]
}
```

**Response (200 OK):** Similar to check-in response

**Validation:**
- Tất cả rooms phải status = CHECKED_IN
- Update status = CHECKED_OUT + actualCheckOut = now
- Update room status = AVAILABLE
- Create CHECKED_OUT activity logs
- Auto-update booking status
  - Nếu ALL rooms checked-out → CHECKED_OUT
  - Nếu SOME rooms checked-out → PARTIALLY_CHECKED_OUT

**Supports partial check-out:** Khách ở 3 phòng, check-out 2 phòng, 1 phòng ở tiếp

---

## 🛒 Service Usage APIs

### 1. Create Service Usage
- **Method:** `POST`
- **Path:** `/employee/service/service-usage`
- **Auth Required:** ✅ Yes (Employee)

**Request Body:**
```json
{
  "bookingId": "string (optional)",
  "bookingRoomId": "string (optional)",
  "serviceId": "string (required)",
  "quantity": "number (required, min 1)"
}
```

**Scenarios:**
```
Booking-level:     bookingId=xxx,     bookingRoomId=null    (service for whole booking)
Room-specific:     bookingId=xxx,     bookingRoomId=xxx     (service for 1 room)
Walk-in guest:     bookingId=null,    bookingRoomId=null    (no booking)
```

**Response (201 Created):**
```json
{
  "id": "string",
  "bookingId": "string or null",
  "bookingRoomId": "string or null",
  "serviceId": "string",
  "serviceName": "Giặt ủi",
  "quantity": 2,
  "unitPrice": 50000,
  "totalPrice": 100000,
  "totalPaid": 0,
  "status": "PENDING",
  "createdAt": "ISO datetime"
}
```

---

### 2. Update Service Usage
- **Method:** `PATCH`
- **Path:** `/employee/service/service-usage/:id`
- **Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "quantity": "number (optional)",
  "status": "PENDING | TRANSFERRED | COMPLETED | CANCELLED (optional)"
}
```

**Rules:**
- Cannot change quantity if status = TRANSFERRED or COMPLETED
- Valid status transitions:
  - PENDING → TRANSFERRED, CANCELLED
  - TRANSFERRED → COMPLETED, CANCELLED
  - Anything → CANCELLED

**Response (200 OK):** Updated service usage

---

## 💳 Transaction/Payment APIs ⭐⭐⭐

### 1. Create Transaction (Payment)
- **Method:** `POST`
- **Path:** `/employee/transactions`
- **Auth Required:** ✅ Yes (Employee)

**Request Body (4 Scenarios):**

**Scenario A: Full Booking Payment**
```json
{
  "bookingId": "string (required)",
  "bookingRoomIds": [],
  "serviceUsageId": null,
  "type": "DEPOSIT | ROOM_CHARGE",
  "method": "CASH | CREDIT_CARD | BANK_TRANSFER | E_WALLET",
  "processedById": "employee-id",
  "customerPromotionIds": ["promo1"],
  "transactionRef": "POS123",
  "description": "Thanh toán hoà đơn"
}
```

**Scenario B: Split Room Payment (Some Rooms Only)**
```json
{
  "bookingId": "string (required)",
  "bookingRoomIds": ["room1", "room2"],
  "serviceUsageId": null,
  "type": "ROOM_CHARGE",
  "method": "CASH",
  "processedById": "employee-id",
  "customerPromotionIds": ["promo1"]
}
```

**Scenario C: Service Payment (Booking-related)**
```json
{
  "bookingId": "string (required)",
  "bookingRoomIds": [],
  "serviceUsageId": "service1",
  "type": "SERVICE_CHARGE",
  "method": "CASH",
  "processedById": "employee-id"
}
```

**Scenario D: Guest Service Payment (Walk-in, No Booking)**
```json
{
  "bookingId": null,
  "serviceUsageId": "service1",
  "type": "SERVICE_CHARGE",
  "method": "CASH",
  "processedById": "employee-id"
}
```

**Response (201 Created):**
```json
{
  "id": "string",
  "bookingId": "string or null",
  "type": "ROOM_CHARGE | SERVICE_CHARGE | DEPOSIT | REFUND",
  "status": "COMPLETED",
  "method": "CASH",
  "baseAmount": 6000000,
  "discountAmount": 600000,
  "amount": 5400000,
  "processedBy": {
    "id": "string",
    "name": "Nhân viên 1",
    "username": "staff1"
  },
  "details": [
    {
      "id": "string",
      "baseAmount": 6000000,
      "discountAmount": 600000,
      "amount": 5400000,
      "bookingRoom": {
        "id": "br1",
        "room": { "roomNumber": "101" },
        "roomType": { "name": "Deluxe" }
      },
      "usedPromotions": [
        {
          "promotion": {
            "code": "SUMMER2025",
            "type": "PERCENTAGE",
            "value": 10
          },
          "discountAmount": 600000
        }
      ]
    }
  ],
  "usedPromotions": [
    {
      "promotion": { "code": "SUMMER2025" },
      "discountAmount": 600000
    }
  ],
  "occurredAt": "ISO datetime",
  "createdAt": "ISO datetime"
}
```

**Promotion Logic:**
1. For each promotionId provided:
   - Check active? (dates, quantity, disabled?)
   - Check customer limit
   - Check min booking amount
   - Check scope (ROOM/SERVICE) matches
2. Calculate discount:
   - PERCENTAGE: `baseAmount * (value / 100)`, max = maxDiscount
   - FIXED_AMOUNT: `value` (cannot exceed baseAmount)
3. Create UsedPromotion record
4. Mark CustomerPromotion as USED
5. Aggregate: `amount = baseAmount - discountAmount`

**Financial Updates:**
- BookingRoom.totalPaid += (for that room)
- BookingRoom.balance = totalAmount - totalPaid
- Auto-complete ServiceUsage if fully paid
- Booking.totalPaid = sum(room.totalPaid)
- Booking.balance = totalAmount - totalPaid

**Errors:**
- `400 Bad Request` - Invalid scenario, validation error
- `409 Conflict` - Promotion invalid, customer limit exceeded
- `404 Not Found` - Booking/room/service not found

---

### 2. List Transactions
- **Method:** `GET`
- **Path:** `/employee/transactions`
- **Auth Required:** ✅ Yes

**Query Parameters:**
```
GET /employee/transactions?bookingId=xxx&status=COMPLETED&type=ROOM_CHARGE&method=CASH&startDate=2025-01-01&endDate=2025-01-31&search=POS123&page=1&limit=10
```

| Param | Type | Description |
|-------|------|-------------|
| `bookingId` | string | Filter by booking |
| `status` | string | PENDING, COMPLETED, FAILED, REFUNDED |
| `type` | string | DEPOSIT, ROOM_CHARGE, SERVICE_CHARGE, REFUND, ADJUSTMENT |
| `method` | string | CASH, CREDIT_CARD, BANK_TRANSFER, E_WALLET |
| `startDate` | ISO datetime | Date range start |
| `endDate` | ISO datetime | Date range end |
| `search` | string | Search in transactionRef or description |
| `page` | number | Page number |
| `limit` | number | Items per page |
| `sortBy` | string | createdAt, occurredAt, amount (default: createdAt) |
| `sortOrder` | string | asc/desc (default: desc) |

**Response (200 OK):**
```json
{
  "transactions": [
    {
      "id": "string",
      "type": "ROOM_CHARGE",
      "status": "COMPLETED",
      "method": "CASH",
      "baseAmount": 6000000,
      "discountAmount": 600000,
      "amount": 5400000,
      "booking": {
        "id": "string",
        "bookingCode": "BK...",
        "primaryCustomer": { "fullName": "John", "phone": "..." }
      },
      "processedBy": { "name": "Staff1" },
      "details": [ /* transaction details */ ],
      "usedPromotions": [ /* promotions */ ],
      "occurredAt": "ISO datetime"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 250,
    "totalPages": 25
  }
}
```

---

### 3. Get Transaction by ID
- **Method:** `GET`
- **Path:** `/employee/transactions/:transactionId`
- **Auth Required:** ✅ Yes

**Response (200 OK):** Full transaction with all details and related data

---

### 4. Get Transaction Details
- **Method:** `GET`
- **Path:** `/employee/transaction-details`
- **Auth Required:** ✅ Yes

**Query Parameters:**
```
GET /employee/transaction-details?transactionId=xxx&bookingRoomId=yyy&serviceUsageId=zzz&minAmount=100000&maxAmount=5000000&page=1
```

**Response (200 OK):**
```json
{
  "details": [
    {
      "id": "string",
      "baseAmount": 1500000,
      "discountAmount": 150000,
      "amount": 1350000,
      "bookingRoom": {
        "id": "br1",
        "room": { "roomNumber": "101", "floor": 1 },
        "roomType": { "name": "Deluxe" }
      },
      "serviceUsage": null,
      "transaction": {
        "id": "string",
        "type": "ROOM_CHARGE",
        "status": "COMPLETED",
        "booking": { "bookingCode": "BK..." }
      },
      "usedPromotions": [
        {
          "promotion": { "code": "SUMMER2025" },
          "discountAmount": 150000
        }
      ],
      "createdAt": "ISO datetime"
    }
  ],
  "pagination": { /* ... */ }
}
```

---

## 🎁 Promotion Management APIs

### 1. Create Promotion (Employee)
- **Method:** `POST`
- **Path:** `/employee/promotions`
- **Auth Required:** ✅ Yes (Employee)

**Request Body:**
```json
{
  "code": "string (required, unique, max 50)",
  "description": "string (optional)",
  "type": "PERCENTAGE | FIXED_AMOUNT (required)",
  "scope": "ROOM | SERVICE | ALL (default: ALL)",
  "value": "number (required)",
  "maxDiscount": "number (optional, for PERCENTAGE only)",
  "minBookingAmount": "number (optional, default: 0)",
  "startDate": "ISO datetime (required)",
  "endDate": "ISO datetime (required)",
  "totalQty": "number (optional, null = unlimited)",
  "perCustomerLimit": "number (optional, default: 1)"
}
```

**Example:**
```json
{
  "code": "SUMMER2025",
  "description": "Summer sale - 10% off",
  "type": "PERCENTAGE",
  "scope": "ALL",
  "value": 10,
  "maxDiscount": 500000,
  "minBookingAmount": 1000000,
  "startDate": "2025-06-01T00:00:00Z",
  "endDate": "2025-08-31T23:59:59Z",
  "totalQty": 100,
  "perCustomerLimit": 2
}
```

**Response (201 Created):**
```json
{
  "id": "string",
  "code": "SUMMER2025",
  "description": "Summer sale - 10% off",
  "type": "PERCENTAGE",
  "scope": "ALL",
  "value": 10,
  "maxDiscount": 500000,
  "minBookingAmount": 1000000,
  "startDate": "2025-06-01T00:00:00Z",
  "endDate": "2025-08-31T23:59:59Z",
  "totalQty": 100,
  "remainingQty": 100,
  "perCustomerLimit": 2,
  "disabledAt": null,
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

---

### 2. List Promotions (Employee)
- **Method:** `GET`
- **Path:** `/employee/promotions`
- **Auth Required:** ✅ Yes

**Query Parameters:**
```
GET /employee/promotions?code=SUMMER&description=sale&startDate=2025-01-01&endDate=2025-12-31&page=1&limit=10
```

**Response (200 OK):** List of promotions with counts

---

### 3. Update Promotion (Employee)
- **Method:** `PATCH`
- **Path:** `/employee/promotions/:id`
- **Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "code": "string (optional)",
  "description": "string (optional)",
  "value": "number (optional)",
  "maxDiscount": "number (optional)",
  "minBookingAmount": "number (optional)",
  "startDate": "ISO datetime (optional)",
  "endDate": "ISO datetime (optional)",
  "totalQty": "number (optional)",
  "remainingQty": "number (optional)",
  "perCustomerLimit": "number (optional)",
  "disabledAt": "ISO datetime (optional, to disable promotion)"
}
```

**Response (200 OK):** Updated promotion

---

### 4. Claim Promotion (Customer)
- **Method:** `POST`
- **Path:** `/customer/promotions/claim`
- **Auth Required:** ✅ Yes (Customer)

**Request Body:**
```json
{
  "promotionCode": "SUMMER2025"
}
```

**Response (201 Created):**
```json
{
  "id": "string",
  "customerId": "string",
  "promotionId": "string",
  "status": "AVAILABLE",
  "promotion": {
    "code": "SUMMER2025",
    "description": "Summer sale - 10% off",
    "type": "PERCENTAGE",
    "value": 10,
    "scope": "ALL"
  },
  "claimedAt": "ISO datetime",
  "usedAt": null,
  "createdAt": "ISO datetime"
}
```

**Validation:**
- Promotion active? (dates, disabled, remainingQty > 0)
- Customer claim limit <= perCustomerLimit
- Decrement remainingQty by 1

**Errors:**
- `404 Not Found` - Promotion not found
- `400 Bad Request` - Promotion expired, no qty left, customer limit exceeded

---

### 5. Get Customer Promotions
- **Method:** `GET`
- **Path:** `/customer/promotions`
- **Auth Required:** ✅ Yes (Customer)

**Query Parameters:**
```
GET /customer/promotions?page=1&limit=10
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "string",
      "status": "AVAILABLE | USED | EXPIRED",
      "promotion": {
        "code": "SUMMER2025",
        "description": "10% off",
        "type": "PERCENTAGE",
        "value": 10,
        "scope": "ALL"
      },
      "claimedAt": "ISO datetime",
      "usedAt": "ISO datetime or null",
      "createdAt": "ISO datetime"
    }
  ],
  "pagination": { /* ... */ }
}
```

---

## 📊 Activity Log APIs

### 1. List Activities
- **Method:** `GET`
- **Path:** `/employee/activities`
- **Auth Required:** ✅ Yes

**Query Parameters:**
```
GET /employee/activities?type=CHECKED_IN&customerId=xxx&employeeId=xxx&bookingRoomId=xxx&startDate=2025-01-01&endDate=2025-01-31&search=room%20101&page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

**Response (200 OK):**
```json
{
  "activities": [
    {
      "id": "string",
      "type": "CHECKED_IN | CHECKED_OUT | CREATE_BOOKING | CREATE_TRANSACTION",
      "description": "Guest John checked in room 101",
      "metadata": {
        "roomNumber": "101",
        "timestamp": "ISO datetime"
      },
      "customer": { "fullName": "John", "phone": "..." },
      "employee": { "name": "Staff1" },
      "bookingRoom": { "room": { "roomNumber": "101" } },
      "serviceUsage": null,
      "createdAt": "ISO datetime"
    }
  ],
  "pagination": { /* ... */ }
}
```

---

### 2. Get Activity by ID
- **Method:** `GET`
- **Path:** `/employee/activities/:activityId`
- **Auth Required:** ✅ Yes

**Response (200 OK):** Single activity with all related data

---

## 👥 Customer Profile & Search

### 1. Get Customer Profile
- **Method:** `GET`
- **Path:** `/customer/profile`
- **Auth Required:** ✅ Yes (Customer)

**Response (200 OK):**
```json
{
  "id": "string",
  "fullName": "string",
  "phone": "string",
  "email": "string or null",
  "idNumber": "string or null",
  "address": "string or null",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime",
  "activeBookings": [
    {
      "id": "string",
      "bookingCode": "BK...",
      "status": "CONFIRMED | CHECKED_IN",
      "checkInDate": "ISO datetime",
      "checkOutDate": "ISO datetime"
    }
  ],
  "claimedPromotions": [
    {
      "id": "string",
      "promotion": { "code": "SUMMER2025" },
      "status": "AVAILABLE | USED"
    }
  ]
}
```

---

### 2. Update Customer Profile
- **Method:** `PUT`
- **Path:** `/customer/profile`
- **Auth Required:** ✅ Yes (Customer)

**Request Body:**
```json
{
  "fullName": "string (optional)",
  "email": "string (optional)",
  "idNumber": "string (optional)",
  "address": "string (optional)"
}
```

**Response (200 OK):** Updated profile

**Note:** Phone and password cannot be updated via this endpoint

---

### 3. Search Available Rooms (Customer)
- **Method:** `GET`
- **Path:** `/customer/rooms`
- **Auth Required:** ✅ Yes (Customer)

**Query Parameters:**
```
GET /customer/rooms?search=101&floor=1&roomTypeId=xxx&minCapacity=2&maxCapacity=4&minPrice=1000000&maxPrice=2000000&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "data": {
    "data": [
      {
        "id": "string",
        "roomNumber": "101",
        "floor": 1,
        "status": "AVAILABLE",
        "roomType": {
          "id": "string",
          "name": "Deluxe",
          "capacity": 2,
          "pricePerNight": "1500000",
          "roomTypeTags": [
            { "id": "string", "name": "wifi" },
            { "id": "string", "name": "TV" }
          ]
        },
        "createdAt": "ISO datetime"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10
  }
}
```

---

## 📌 Key Points

1. **Base URL**: Tất cả APIs đều bắt đầu bằng `/api/v1`
2. **Authentication**: JWT Bearer token trong header `Authorization`
3. **Pagination**: Default limit=10, max limit=100
4. **Sorting**: Tất cả list APIs hỗ trợ `sortBy` + `sortOrder`
5. **Response format**: Lúc nào cũng có `code`, `message`, `data`
6. **Errors**: Tuân theo HTTP status codes (400, 401, 404, 409, etc.)
7. **Dates**: ISO 8601 format (2025-01-01T10:00:00Z)
8. **Currency**: VND (không có unit trong API, để FE format)

---

## 🧪 Testing Tips

1. **Check-in/out flow:**
   - Create booking → confirm with payment → check-in → check-out
   - Verify room status changes: RESERVED → OCCUPIED → AVAILABLE

2. **Payment with promotion:**
   - Create promotion → customer claim → apply during payment → check discount
   - Verify totalPaid updates on booking

3. **Walk-in service:**
   - Create service usage (no booking) → pay → no promotion
   - Only TransactionDetail created, no Transaction

4. **Partial operations:**
   - Booking with 3 rooms → check-in 2 → status should be CHECKED_IN (not PARTIALLY)
   - Check-out 1 room → status should be PARTIALLY_CHECKED_OUT
   - Check-out remaining 2 → status should be CHECKED_OUT

