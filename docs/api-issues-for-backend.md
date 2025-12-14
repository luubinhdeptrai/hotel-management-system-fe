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

## Room APIs

### Implemented Endpoints

The following endpoints have been integrated for room management:

| Endpoint                    | Method | Status         | Notes                              |
| --------------------------- | ------ | -------------- | ---------------------------------- |
| `/v1/rooms`                 | GET    | ✅ Implemented | Get all rooms with filters         |
| `/v1/rooms`                 | POST   | ✅ Implemented | Create new room                    |
| `/v1/rooms/{roomId}`        | GET    | ✅ Implemented | Get room by ID                     |
| `/v1/rooms/{roomId}`        | PATCH  | ✅ Implemented | Update room                        |
| `/v1/rooms/{roomId}`        | DELETE | ✅ Implemented | Delete room                        |
| `/v1/rooms/{roomId}/status` | PATCH  | ✅ Implemented | Update room status                 |
| `/v1/rooms/available`       | GET    | ✅ Implemented | Get available rooms for date range |
| `/v1/rooms/availability`    | GET    | ✅ Implemented | Check room availability            |
| `/v1/rooms/types`           | GET    | ✅ Implemented | Get all room types                 |
| `/v1/rooms/types`           | POST   | ✅ Implemented | Create room type                   |
| `/v1/rooms/types/{id}`      | GET    | ✅ Implemented | Get room type by ID                |
| `/v1/rooms/types/{id}`      | PATCH  | ✅ Implemented | Update room type                   |
| `/v1/rooms/types/{id}`      | DELETE | ✅ Implemented | Delete room type                   |

### ⚠️ Notes for Backend Team

#### 1. Room Status Values

The frontend expects these status values from the API:

```typescript
type ApiRoomStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "OCCUPIED"
  | "CLEANING"
  | "MAINTENANCE"
  | "OUT_OF_ORDER";
```

The frontend maps these to Vietnamese labels for UI display.

#### 2. Room Response Schema

Expected room object structure:

```json
{
  "id": 1,
  "code": "301",
  "name": "Room 301",
  "floor": 3,
  "roomTypeId": 2,
  "status": "AVAILABLE",
  "notes": "Ocean view",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "roomType": {
    "id": 2,
    "code": "DLX",
    "name": "Deluxe Room",
    "baseCapacity": 2,
    "maxCapacity": 4,
    "amenities": "Air conditioning, WiFi, Mini bar",
    "rackRate": 1800000,
    "extraPersonFee": 400000,
    "description": "Luxurious room with premium amenities"
  }
}
```

#### 3. List Response Format

All list endpoints should return paginated responses:

```json
{
  "results": [...],
  "page": 1,
  "limit": 10,
  "totalPages": 5,
  "totalResults": 50
}
```

#### 4. Missing: Guest Information for Occupied Rooms

When a room is OCCUPIED, the frontend needs to display the current guest name. Please consider adding these fields to the room response:

- `currentGuestName`: string (name of the current guest)
- `currentFolioId`: number (folio ID for linking to billing)
- `currentStayRecordId`: number (stay record for check-out operations)

---

## Room Types APIs

### Implemented Endpoints

The following endpoints have been integrated for room type management:

| Endpoint                       | Method | Status         | Notes                          |
| ------------------------------ | ------ | -------------- | ------------------------------ |
| `/v1/rooms/types`              | GET    | ✅ Implemented | Get all room types (paginated) |
| `/v1/rooms/types`              | POST   | ✅ Implemented | Create room type               |
| `/v1/rooms/types/{roomTypeId}` | GET    | ✅ Implemented | Get room type by ID            |
| `/v1/rooms/types/{roomTypeId}` | PATCH  | ✅ Implemented | Update room type               |
| `/v1/rooms/types/{roomTypeId}` | DELETE | ✅ Implemented | Delete room type               |

### ⚠️ Missing Response Schemas in Swagger

#### `GET /v1/rooms/types` - Expected Response

```json
{
  "results": [
    {
      "id": 1,
      "code": "STD",
      "name": "Standard Room",
      "baseCapacity": 2,
      "maxCapacity": 4,
      "amenities": "WiFi, TV, Air conditioning, Refrigerator",
      "rackRate": 500000,
      "extraPersonFee": 100000,
      "description": "Comfortable standard room with essential amenities",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "totalResults": 5
}
```

#### `POST /v1/rooms/types` - Request Body

Based on swagger, the following fields are required:

```json
{
  "code": "DLX",
  "name": "Deluxe Room",
  "basePrice": 800000,
  "maxGuests": 2,
  "description": "Luxury room with premium amenities"
}
```

### ⚠️ Notes for Backend Team

#### 1. Field Name Discrepancy

The swagger spec uses `basePrice` for creation but the response uses `rackRate`. Please confirm:

- Should we use `basePrice` or `rackRate` for room rate?
- Is `rackRate` the same as `basePrice`?

#### 2. Capacity Fields

The swagger spec uses `maxGuests` for creation but the response schema shows:

- `baseCapacity` - minimum capacity
- `maxCapacity` - maximum capacity

Please clarify:

- Should we include both `baseCapacity` and `maxCapacity` in create/update requests?
- Or is `maxGuests` the only field needed?

#### 3. ID Mapping Requirement

The frontend UI uses room type `code` (e.g., "STD", "DLX") as identifiers for display. However, the API uses numeric `id` for updates and deletes.

**Request**: Please include the numeric `id` in the response so the frontend can map between code and ID for CRUD operations.

#### 4. Missing: Check Room Type In Use

Before deleting a room type, the frontend needs to verify it's not being used by any rooms. Please consider adding:

- Endpoint: `GET /v1/rooms/types/{roomTypeId}/in-use`
- Or include `inUse: boolean` or `roomCount: number` in the room type response

---

## Missing APIs or Data (To Be Discussed)

> [!IMPORTANT]
> Update this section as you discover issues during testing.

### Room-Related Issues

1. **Guest Information on Occupied Rooms**: The API does not include current guest information in the room response. Frontend needs `currentGuestName`, `currentFolioId`, or `currentStayRecordId` for occupied rooms to display guest details and link to folio.

### Currently No Issues Identified

All auth endpoints documented in swagger are available. Will update if issues arise during testing.

---

## Testing Checklist

Before testing the auth integration, please confirm:

- [ ] Backend server running on `localhost:3000`
- [ ] Test user created with known email/password
- [ ] CORS configured for frontend origin
- [ ] JWT tokens configured with reasonable expiry times
