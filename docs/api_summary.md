# API Summary & Developer Guide

This document provides a high-level overview of the frontend API services and their integration with the backend `roommaster-be`. It serves as a reference for future development tasks.

## 🔗 Connection Details

- **Base URL**: Configured via `API_BASE_URL` (typically `/api/v1` prefix).
- **Authentication**: JWT Bearer token required for most endpoints. Handled via `api.ts` interceptors.
- **Data unwrapping**: Backend responses are typically wrapped in `{ data: ... }`. Services generally unwrap this to return the core data structure to components.

## 🛠️ Service Architecture

The frontend services are located in `lib/services/` and map roughly to backend route modules.

### 👤 User & Access Management

| Service File            | Description               | Key Features                                                  |
| :---------------------- | :------------------------ | :------------------------------------------------------------ |
| `auth.service.ts`       | Authentication            | Login, Register, Refresh Token, Profile.                      |
| `user.service.ts`       | User Management           | List, Create, Update, Delete employees.                       |
| `role.service.ts`       | **[NEW]** Role Management | CRUD for Roles, Permission assignment.                        |
| `permission.service.ts` | **[UPDATED]** Permissions | List all permissions, Group by subject, Get User permissions. |

### 🏨 Core Operations

| Service File                 | Description            | Key Features                                                                                    |
| :--------------------------- | :--------------------- | :---------------------------------------------------------------------------------------------- |
| `room.service.ts`            | Room Management        | CRUD Rooms/Types. **[NEW]** Room Image Management (Upload, Reorder, Default).                   |
| `booking.service.ts`         | Booking Handlers       | Create/Update bookings, Check-in/out, Change Room. _Note: specific deprecated methods removed._ |
| `service-unified.service.ts` | **[UPDATED]** Services | Unified handler for Service & Surcharge items. **[NEW]** Image Management.                      |
| `customer.service.ts`        | Customer Management    | CRUD Customers, Rank management.                                                                |
| `activity.service.ts`        | Employee Logs          | Search/Filter activity logs.                                                                    |

### 💰 Finance & Transactions

| Service File                     | Description                   | Key Features                                                                        |
| :------------------------------- | :---------------------------- | :---------------------------------------------------------------------------------- |
| `transaction.service.ts`         | Payment Processing            | Create payments/refunds.                                                            |
| `transaction-details.service.ts` | **[NEW]** Transaction History | Search and filter simplified transaction records.                                   |
| `pricing-rule.service.ts`        | **[UPDATED]** Pricing Logic   | Dynamic pricing rules. **[FIXED]** Reorder payload matches backend (`newPosition`). |

### 📊 Analytics & Reporting

| Service File         | Description                     | Key Features                                                                                       |
| :------------------- | :------------------------------ | :------------------------------------------------------------------------------------------------- |
| `reports.service.ts` | **[NEW]** Comprehensive Reports | Room Availability, Occupancy Forecast, Revenue Stats, Employee Performance. Strict typing enabled. |

### ⚙️ Configuration

| Service File              | Description     | Key Features                            |
| :------------------------ | :-------------- | :-------------------------------------- |
| `app-settings.service.ts` | System Settings | Global configs (Deposit %, Hotel Info). |

## 🧩 Key Data Models & Types

Types are consolidated in `lib/types/`.

- **API Responses**: `ApiResponse<T>`, `PaginatedResponse<T>` (`lib/types/api.ts`)
- **Reporting**: `lib/types/report.ts` (Strictly typed filters and response shapes)
- **Unified Services**: `lib/types/service.ts` (Discriminated unions for Service/Surcharge/Penalty)

## ⚠️ Known Constraints & Notes

1.  **Pagination**: Most list endpoints accept `page` and `limit`. Query strings are built manually or via `URLSearchParams` in newer services.
2.  **Image Uploads**:
    - Rooms: `POST /employee/rooms/{id}/images` (FormData)
    - Services: `POST /employee/services/{id}/images` (FormData)
3.  **Booking Actions**:
    - `confirmBooking` is currently a **mock** on the frontend (Backend auto-confirms or manages state differently).
    - Cancellation previews are not supported by backend; cancellation is immediate.
4.  **Reordering**:
    - Pricing Rules uses `newPosition` (index-based).
    - Images usually use an array of IDs in the desired order.

## 🔄 Recent Synchronization Status (Jan 2026)

- **Completed**: Full synchronization of missing endpoints (Reports, Roles, Images).
- **Fixed**: Lints in `new-reservation-form-modal.tsx` (`SelectedRoom` types).
- **Fixed**: `booking.service.ts` deprecated methods cleaned up.
- **Fixed**: `activity.service.ts` removed heavy client-side fallback.
