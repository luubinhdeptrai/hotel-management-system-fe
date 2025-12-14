# API Issues & Notes for Backend Team

Generated: 2025-12-14

This document tracks API integration notes, missing endpoints, or response data discrepancies discovered during frontend implementation.

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
