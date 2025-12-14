# API Issues & Notes for Backend Team

Generated: 2025-12-14  
Last Updated: 2025-12-14

This document tracks API integration notes, missing endpoints, or response data discrepancies discovered during frontend implementation.

---

## Dashboard APIs

### Implemented Endpoints

The following endpoints have been integrated for the dashboard page:

| Endpoint                      | Method | Status         | Notes                                      |
| ----------------------------- | ------ | -------------- | ------------------------------------------ |
| `/v1/reports/dashboard`       | GET    | ✅ Implemented | **Response schema NOT defined in swagger** |
| `/v1/reservations/arrivals`   | GET    | ✅ Implemented | Today's arrivals, schema needed            |
| `/v1/reservations/departures` | GET    | ✅ Implemented | Today's departures, schema needed          |
| `/v1/rooms`                   | GET    | ✅ Implemented | Room list with status                      |
| `/v1/housekeeping/pending`    | GET    | ✅ Implemented | Housekeeping pending tasks                 |

### ⚠️ Missing Response Schemas in Swagger

The following endpoints exist in swagger but **lack detailed response schemas**. Please add these to the swagger documentation:

#### 1. `GET /v1/reports/dashboard` - Expected Response

```json
{
  "totalRooms": 20,
  "availableRooms": 7,
  "occupiedRooms": 10,
  "dirtyRooms": 3,
  "maintenanceRooms": 2,
  "todayArrivals": 5,
  "todayDepartures": 4,
  "currentGuests": 14,
  "occupancyRate": 65.0,
  "todayRevenue": 45500000
}
```

#### 2. `GET /v1/reservations/arrivals` - Expected Response

```json
{
  "results": [
    {
      "id": 1,
      "reservationId": 123,
      "guestName": "Nguyễn Văn An",
      "customerName": "Nguyễn Văn An",
      "roomNumber": "101",
      "roomTypeName": "Deluxe",
      "checkInDate": "2025-12-14T14:00:00.000Z",
      "checkInTime": "14:00",
      "numberOfGuests": 2,
      "specialRequests": "Late arrival",
      "status": "CONFIRMED"
    }
  ],
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "totalResults": 5
}
```

#### 3. `GET /v1/reservations/departures` - Expected Response

```json
{
  "results": [
    {
      "id": 1,
      "stayRecordId": 456,
      "guestName": "Trần Thị Bình",
      "customerName": "Trần Thị Bình",
      "roomNumber": "205",
      "roomTypeName": "Suite",
      "checkOutDate": "2025-12-14T12:00:00.000Z",
      "checkOutTime": "12:00",
      "totalAmount": 3200000,
      "balance": 0,
      "status": "DUE_OUT"
    }
  ],
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "totalResults": 4
}
```

#### 4. `GET /v1/housekeeping/pending` - Expected Response

```json
{
  "results": [
    {
      "id": 1,
      "roomId": 5,
      "roomCode": "103",
      "roomName": "Room 103",
      "floor": 1,
      "status": "PENDING",
      "priority": "HIGH",
      "assignedTo": {
        "id": 10,
        "name": "Nguyễn Văn C"
      },
      "stayRecordId": 789,
      "notes": "Checkout cleaning"
    }
  ],
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "totalResults": 3
}
```

---

## Authentication APIs

### Implemented Endpoints

The following endpoints have been integrated based on [swaggerdoc.json](../swaggerdoc.json):

| Endpoint                   | Method | Status         | Notes                         |
| -------------------------- | ------ | -------------- | ----------------------------- |
| `/v1/auth/login`           | POST   | ✅ Implemented | Uses email + password         |
| `/v1/auth/logout`          | POST   | ✅ Implemented | Requires refreshToken in body |
| `/v1/auth/refresh-tokens`  | POST   | ✅ Implemented | Returns new token pair        |
| `/v1/auth/change-password` | POST   | ✅ Implemented | Requires auth header          |
| `/v1/auth/me`              | GET    | ✅ Implemented | Returns Employee object       |

---

## Notes for Backend Team

### 1. Token Storage Strategy

The frontend stores tokens as follows:

- **Access Token**: localStorage + cookie (`auth-token`) for middleware
- **Refresh Token**: localStorage

> [!NOTE]
> If you need a different token storage strategy (e.g., httpOnly cookies only), please let us know.

### 2. Login Field Change

The frontend login form now uses **email** field instead of username, matching the swagger spec.

### 3. Error Response Format

The frontend expects error responses in this format:

```json
{
  "code": 401,
  "message": "Invalid email or password"
}
```

### 4. CORS Configuration

Please ensure the backend has CORS configured for:

- Origin: `http://localhost:3001` (Next.js dev server)
- Methods: `GET, POST, PATCH, DELETE, OPTIONS`
- Headers: `Content-Type, Authorization`

---

## Missing APIs or Data (To Be Discussed)

> [!IMPORTANT]
> Update this section as you discover issues during testing.

### Currently No Issues Identified

All auth endpoints documented in swagger are available. Will update if issues arise during testing.

---

## Testing Checklist

Before testing the auth integration, please confirm:

- [ ] Backend server running on `localhost:3000`
- [ ] Test user created with known email/password
- [ ] CORS configured for frontend origin
- [ ] JWT tokens configured with reasonable expiry times
