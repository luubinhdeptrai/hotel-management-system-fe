# Comprehensive Guide: Implementing Permissions in the Frontend

This guide explains how to implement role-based permissions in your frontend, including which permissions each role should have and how to use them for UI and access control.

---

## 1. Roles and Their Permissions

### ADMIN
- **Description:** Full system access - can manage everything
- **Screens:** All screens
- **Actions:** All actions

### RECEPTIONIST
- **Description:** Front desk operations - bookings, customers, transactions
- **Screens:**
  - Dashboard
  - Booking
  - Room
  - Customer
  - Service
  - Transaction
  - Report
- **Actions:**
  - booking:create, booking:read, booking:update, booking:checkIn, booking:checkOut, booking:cancel
  - room:read, room:updateStatus
  - customer:create, customer:read, customer:update
  - service:read
  - transaction:create, transaction:read
  - report:view

### HOUSEKEEPING
- **Description:** Room maintenance and cleaning
- **Screens:**
  - Dashboard
  - Room
  - Booking
- **Actions:**
  - room:read, room:updateStatus
  - booking:read

### STAFF
- **Description:** General staff with view-only access
- **Screens:**
  - Dashboard
  - Booking
  - Room
- **Actions:**
  - booking:read
  - room:read
  - customer:read
  - service:read

---

## 2. Fetching Permissions from Backend

Use the endpoint:
```
GET /v1/employee/auth/permissions
```
- Requires authentication (employee access token)
- Returns:
  - `actions`: List of action permissions (for UI logic)
  - `permissions`: CASL rules (for access control)

### Example (Axios):
```js
const res = await axios.get('/v1/employee/auth/permissions', {
  headers: { Authorization: `Bearer <token>` }
});
const { actions, permissions } = res.data;
```

---

## 3. Using Permissions in the Frontend

### Button/UI Visibility
Show or hide UI elements based on `actions`:
```js
if (actions.includes('booking:create')) {
  // Show create booking button
}
```

### CASL Integration
Use the `permissions` array to initialize CASL:
```js
import { Ability } from '@casl/ability';
const ability = new Ability(permissions);
if (ability.can('update', 'Room')) {
  // Show update room button
}
```

---

## 4. Example: Role-Based UI
```js
function canShowBookingCreate(actions) {
  return actions.includes('booking:create');
}

function canUpdateRoom(ability) {
  return ability.can('update', 'Room');
}
```

---

## 5. Summary Table
| Role         | Screens                                 | Actions (examples)                                  |
|--------------|-----------------------------------------|-----------------------------------------------------|
| ADMIN        | All                                     | All                                                 |
| RECEPTIONIST | Dashboard, Booking, Room, ...           | booking:create, room:read, customer:update, ...      |
| HOUSEKEEPING | Dashboard, Room, Booking                | room:updateStatus, booking:read                     |
| STAFF        | Dashboard, Booking, Room                | booking:read, room:read, customer:read, service:read|

---

## 6. Best Practices
- Always fetch permissions after login and store them in app state.
- Use `actions` for quick UI checks, and CASL for complex logic.
- Update permissions if the user role changes.

---

For more details, see backend: `src/routes/v1/employee/auth.route.ts` and `prisma/seeds/permissions.seed.ts`.
