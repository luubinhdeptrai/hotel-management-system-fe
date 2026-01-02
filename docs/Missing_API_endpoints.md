# Missing API Endpoints for Reservations

API endpoints required by the frontend reservations page but **not present in swagger.json**.

**Base URL:** `http://localhost:3000/v1`

---

## 1. GET /employee/bookings

**Purpose:** List all bookings with pagination and filtering.

### Request

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 10) |
| status | string | No | PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED |
| checkInDate | string | No | Filter check-in >= date (YYYY-MM-DD) |
| checkOutDate | string | No | Filter check-out <= date (YYYY-MM-DD) |
| roomTypeId | string | No | Filter by room type ID |
| search | string | No | Search booking code, customer name, phone |
| sortBy | string | No | createdAt, checkInDate, checkOutDate, status |
| sortOrder | string | No | asc, desc |

**Example:**

```
GET /employee/bookings?page=1&limit=10&status=CONFIRMED&checkInDate=2025-01-01
```

### Response

**Headers:**

```
Content-Type: application/json
```

**Status 200 - Success:**

```json
{
  "data": {
    "data": [
      {
        "id": "booking_id",
        "bookingCode": "BK20250101001",
        "status": "CONFIRMED",
        "primaryCustomerId": "customer_id",
        "checkInDate": "2025-01-15T14:00:00Z",
        "checkOutDate": "2025-01-17T12:00:00Z",
        "totalGuests": 2,
        "totalAmount": "1500000",
        "depositRequired": "500000",
        "balance": "1000000",
        "createdAt": "2025-01-01T10:00:00Z",
        "primaryCustomer": {
          "id": "customer_id",
          "fullName": "Nguyễn Văn A",
          "phone": "0901234567",
          "email": "customer@email.com"
        },
        "bookingRooms": [
          {
            "id": "booking_room_id",
            "roomId": "room_id",
            "roomTypeId": "room_type_id",
            "status": "CONFIRMED",
            "room": { "roomNumber": "101" },
            "roomType": { "name": "Deluxe" }
          }
        ]
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

**Status 401 - Unauthorized:**

```json
{ "code": 401, "message": "Please authenticate" }
```

---

## 2. POST /employee/bookings

**Purpose:** Create a new booking (employee-initiated).

### Request

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**

```json
{
  "customerId": "customer_id",
  "rooms": [{ "roomTypeId": "room_type_id", "count": 1 }],
  "checkInDate": "2025-01-15T14:00:00Z",
  "checkOutDate": "2025-01-17T12:00:00Z",
  "totalGuests": 2,
  "notes": "Optional notes"
}
```

### Response

**Headers:**

```
Content-Type: application/json
```

**Status 201 - Created:**

```json
{
  "data": {
    "bookingId": "booking_id",
    "bookingCode": "BK20250101001",
    "status": "PENDING",
    "totalAmount": 1500000,
    "depositRequired": 500000,
    "expiresAt": "2025-01-01T10:15:00Z"
  }
}
```

**Status 400 - Validation Error:**

```json
{
  "code": 400,
  "message": "Validation error",
  "errors": [{ "field": "checkInDate", "message": "Check-in date is required" }]
}
```

**Status 409 - Conflict:**

```json
{ "code": 409, "message": "Not enough available rooms" }
```

---

## 3. PATCH /employee/bookings/{id}/cancel

**Purpose:** Cancel a booking.

### Request

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Booking ID |

**Body:**

```json
{
  "reason": "Customer requested cancellation"
}
```

### Response

**Headers:**

```
Content-Type: application/json
```

**Status 200 - Success:**

```json
{
  "data": {
    "id": "booking_id",
    "bookingCode": "BK20250101001",
    "status": "CANCELLED",
    "cancelledAt": "2025-01-02T10:00:00Z",
    "cancelReason": "Customer requested cancellation"
  }
}
```

**Status 400 - Bad Request:**

```json
{ "code": 400, "message": "Cannot cancel a checked-in booking" }
```

**Status 404 - Not Found:**

```json
{ "code": 404, "message": "Booking not found" }
```

---

## 4. PATCH /employee/bookings/{id}/confirm

**Purpose:** Confirm a pending booking.

### Request

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Booking ID |

**Body:** _(empty or optional notes)_

```json
{}
```

### Response

**Headers:**

```
Content-Type: application/json
```

**Status 200 - Success:**

```json
{
  "data": {
    "id": "booking_id",
    "bookingCode": "BK20250101001",
    "status": "CONFIRMED",
    "confirmedAt": "2025-01-02T10:00:00Z"
  }
}
```

**Status 400 - Bad Request:**

```json
{ "code": 400, "message": "Booking is not in PENDING status" }
```

---

## 5. PATCH /employee/bookings/check-out

**Purpose:** Check out guests from booking rooms.

### Request

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**

```json
{
  "bookingRoomIds": ["booking_room_id_1", "booking_room_id_2"]
}
```

### Response

**Headers:**

```
Content-Type: application/json
```

**Status 200 - Success:**

```json
{
  "data": {
    "bookingRooms": [
      {
        "id": "booking_room_id_1",
        "status": "CHECKED_OUT",
        "actualCheckOut": "2025-01-17T11:30:00Z"
      }
    ],
    "booking": {
      "id": "booking_id",
      "status": "CHECKED_OUT"
    }
  }
}
```

**Status 400 - Bad Request:**

```json
{ "code": 400, "message": "Room is not checked in" }
```

---

## 6. GET /employee/rooms/available

**Purpose:** Search for available rooms by date range.

### Request

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| checkInDate | string | Yes | Check-in date (YYYY-MM-DD) |
| checkOutDate | string | Yes | Check-out date (YYYY-MM-DD) |
| roomTypeId | string | No | Filter by room type |

**Example:**

```
GET /employee/rooms/available?checkInDate=2025-01-15&checkOutDate=2025-01-17
```

### Response

**Headers:**

```
Content-Type: application/json
```

**Status 200 - Success:**

```json
{
  "data": [
    {
      "id": "room_id",
      "roomNumber": "101",
      "floor": 1,
      "status": "AVAILABLE",
      "roomType": {
        "id": "room_type_id",
        "name": "Deluxe",
        "capacity": 2,
        "pricePerNight": "500000"
      }
    }
  ]
}
```

---

## Summary

| Endpoint                          | Method | Priority |
| --------------------------------- | ------ | -------- |
| `/employee/bookings`              | GET    | HIGH     |
| `/employee/bookings`              | POST   | HIGH     |
| `/employee/bookings/{id}/cancel`  | PATCH  | HIGH     |
| `/employee/bookings/{id}/confirm` | PATCH  | MEDIUM   |
| `/employee/bookings/check-in`     | PATCH  | HIGH     |
| `/employee/bookings/check-out`    | PATCH  | HIGH     |
| `/employee/bookings/walk-in`      | POST   | MEDIUM   |
| `/employee/rooms/available`       | GET    | HIGH     |

---

# Check-in/Check-out Specific Endpoints

## 7. PATCH /employee/bookings/check-in

**Purpose:** Check-in guests for confirmed booking rooms.

### Request

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**

```json
{
  "checkInInfo": [
    {
      "bookingRoomId": "booking_room_id_1",
      "customerIds": ["customer_id_1", "customer_id_2"]
    },
    {
      "bookingRoomId": "booking_room_id_2",
      "customerIds": ["customer_id_3"]
    }
  ]
}
```

### Response

**Headers:**

```
Content-Type: application/json
```

**Status 200 - Success:**

```json
{
  "data": {
    "bookingRooms": [
      {
        "id": "booking_room_id_1",
        "status": "CHECKED_IN",
        "actualCheckIn": "2025-01-15T14:30:00Z"
      }
    ],
    "booking": {
      "id": "booking_id",
      "status": "CHECKED_IN"
    }
  }
}
```

**Status 400 - Bad Request:**

```json
{ "code": 400, "message": "Booking is not in CONFIRMED status" }
```

---

## 8. POST /employee/bookings/walk-in

**Purpose:** Create walk-in booking with immediate check-in (guest without prior reservation).

### Request

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**

```json
{
  "customer": {
    "fullName": "Nguyễn Văn Walk-in",
    "phone": "0901234567",
    "idNumber": "001234567890",
    "email": "walkin@example.com",
    "address": "123 Street"
  },
  "roomId": "room_id",
  "checkInDate": "2025-01-15T14:00:00Z",
  "checkOutDate": "2025-01-17T12:00:00Z",
  "totalGuests": 2,
  "notes": "Walk-in guest"
}
```

### Response

**Headers:**

```
Content-Type: application/json
```

**Status 201 - Created:**

```json
{
  "data": {
    "bookingId": "booking_id",
    "bookingCode": "WI20250115001",
    "bookingRoomId": "booking_room_id",
    "status": "CHECKED_IN",
    "message": "Walk-in booking created and checked in successfully"
  }
}
```

**Status 409 - Conflict:**

```json
{ "code": 409, "message": "Room is not available for the selected dates" }
```

---

# Services Management Endpoints

API endpoints required by the frontend services page but **not present in swagger.json**.

**Base URL:** `http://localhost:3000/v1`

---

## 9. GET /employee/services

**Purpose:** List all services with pagination and filtering.

### Request

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 10, max: 100) |
| search | string | No | Search by service name |
| isActive | boolean | No | Filter by active status |
| minPrice | number | No | Filter services with price >= minPrice |
| maxPrice | number | No | Filter services with price <= maxPrice |
| sortBy | string | No | name, price, unit, isActive, createdAt, updatedAt |
| sortOrder | string | No | asc, desc |

**Example:**

```
GET /employee/services?page=1&limit=10&isActive=true&sortBy=name&sortOrder=asc
```

### Response

**Headers:**

```
Content-Type: application/json
```

**Status 200 - Success:**

```json
{
  "data": {
    "data": [
      {
        "id": "service_id",
        "name": "Minibar - Nước suối",
        "price": "15000",
        "unit": "chai",
        "isActive": true,
        "createdAt": "2025-01-01T10:00:00Z",
        "updatedAt": "2025-01-01T10:00:00Z",
        "_count": {
          "serviceUsages": 5
        }
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

**Status 401 - Unauthorized:**

```json
{ "code": 401, "message": "Please authenticate" }
```

---

## 10. GET /employee/services/{serviceId}

**Purpose:** Get service details by ID.

### Request

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| serviceId | string | Yes | Service ID |

**Example:**

```
GET /employee/services/service_id_123
```

### Response

**Headers:**

```
Content-Type: application/json
```

**Status 200 - Success:**

```json
{
  "data": {
    "id": "service_id_123",
    "name": "Massage toàn thân",
    "price": "500000",
    "unit": "60 phút",
    "isActive": true,
    "createdAt": "2025-01-01T10:00:00Z",
    "updatedAt": "2025-01-01T10:00:00Z",
    "_count": {
      "serviceUsages": 10
    }
  }
}
```

**Status 404 - Not Found:**

```json
{ "code": 404, "message": "Service not found" }
```

---

## 11. POST /employee/services

**Purpose:** Create a new service.

### Request

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Giặt ủi áo sơ mi",
  "price": 30000,
  "unit": "cái",
  "isActive": true
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Service name |
| price | number | Yes | Service price |
| unit | string | No | Unit of measurement (default: "lần") |
| isActive | boolean | No | Active status (default: true) |

### Response

**Headers:**

```
Content-Type: application/json
```

**Status 201 - Created:**

```json
{
  "data": {
    "id": "service_id_new",
    "name": "Giặt ủi áo sơ mi",
    "price": "30000",
    "unit": "cái",
    "isActive": true,
    "createdAt": "2025-01-02T10:00:00Z",
    "updatedAt": "2025-01-02T10:00:00Z"
  }
}
```

**Status 400 - Validation Error:**

```json
{
  "code": 400,
  "message": "Validation error",
  "errors": [{ "field": "name", "message": "Service name is required" }]
}
```

---

## 12. PUT /employee/services/{serviceId}

**Purpose:** Update an existing service.

### Request

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| serviceId | string | Yes | Service ID |

**Body:**

```json
{
  "name": "Giặt ủi áo sơ mi (cập nhật)",
  "price": 35000,
  "unit": "cái",
  "isActive": true
}
```

**Body Parameters (all optional):**
| Parameter | Type | Description |
|-----------|------|-------------|
| name | string | Service name |
| price | number | Service price |
| unit | string | Unit of measurement |
| isActive | boolean | Active status |

### Response

**Headers:**

```
Content-Type: application/json
```

**Status 200 - Success:**

```json
{
  "data": {
    "id": "service_id",
    "name": "Giặt ủi áo sơ mi (cập nhật)",
    "price": "35000",
    "unit": "cái",
    "isActive": true,
    "createdAt": "2025-01-01T10:00:00Z",
    "updatedAt": "2025-01-02T11:00:00Z"
  }
}
```

**Status 400 - Validation Error:**

```json
{
  "code": 400,
  "message": "Validation error",
  "errors": [{ "field": "price", "message": "Price must be a positive number" }]
}
```

**Status 404 - Not Found:**

```json
{ "code": 404, "message": "Service not found" }
```

---

## 13. DELETE /employee/services/{serviceId}

**Purpose:** Delete a service.

### Request

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| serviceId | string | Yes | Service ID |

**Example:**

```
DELETE /employee/services/service_id_123
```

### Response

**Headers:**

```
Content-Type: application/json
```

**Status 204 - No Content:**

_(Empty response body)_

**Status 400 - Bad Request:**

```json
{ "code": 400, "message": "Cannot delete service with existing usage records" }
```

**Status 404 - Not Found:**

```json
{ "code": 404, "message": "Service not found" }
```

---

# Services Summary Table

| Endpoint                         | Method | Priority | Status                    |
| -------------------------------- | ------ | -------- | ------------------------- |
| `/employee/services`             | GET    | HIGH     | Missing from swagger.json |
| `/employee/services/{serviceId}` | GET    | MEDIUM   | Missing from swagger.json |
| `/employee/services`             | POST   | HIGH     | Missing from swagger.json |
| `/employee/services/{serviceId}` | PUT    | HIGH     | Missing from swagger.json |
| `/employee/services/{serviceId}` | DELETE | MEDIUM   | Missing from swagger.json |
