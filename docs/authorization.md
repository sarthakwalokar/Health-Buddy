# Health Buddy — Role-Based Authorization & Permission Model

## 1. Zero-Trust Role Security Principles

Health Buddy implements a strict zero-trust model where **frontend route guards alone are never relied upon for security**. Role boundaries are enforced at both layers:

1. **Backend Layer (Spring Security 6)**:
   - Filter chain intercepts every incoming HTTP request.
   - Decodes minimal JWT claims and validates signatures against 256-bit HMAC key.
   - Grants exact authorities: `ROLE_PATIENT`, `ROLE_DOCTOR`, `ROLE_ADMIN`.
   - Method security `@PreAuthorize("hasRole('PATIENT')")` / `@PreAuthorize("hasRole('DOCTOR')")` / `@PreAuthorize("hasRole('ADMIN')")`.
   - Any violation triggers an HTTP `403 FORBIDDEN` response and immediately logs a security audit record.

2. **Frontend Layer (React Router 6 + RoleRoute Guard)**:
   - Evaluates active role from backend token response.
   - Redirects unauthorized URL manipulation immediately to `/unauthorized`.

## 2. Role & Permission Matrix

| Resource / Endpoint | `ROLE_PATIENT` | `ROLE_DOCTOR` | `ROLE_ADMIN` | Unauthenticated |
| :--- | :---: | :---: | :---: | :---: |
| `GET /api/v1/health` | ✓ | ✓ | ✓ | ✓ |
| `POST /api/v1/auth/login` | ✓ | ✓ | ✓ | ✓ |
| `POST /api/v1/auth/register/**` | ✓ | ✓ | ✓ | ✓ |
| `GET /api/v1/auth/me` | ✓ (Self) | ✓ (Self) | ✓ (Self) | ✗ (401) |
| `POST /api/v1/auth/change-password` | ✓ (Self) | ✓ (Self) | ✓ (Self) | ✗ (401) |
| `GET /api/v1/patient/profile` | ✓ (Own Profile) | ✗ (403 Forbidden) | ✗ (403 Forbidden) | ✗ (401) |
| `PUT /api/v1/patient/profile` | ✓ (Own Profile) | ✗ (403 Forbidden) | ✗ (403 Forbidden) | ✗ (401) |
| `GET /api/v1/patient/dashboard` | ✓ | ✗ (403 Forbidden) | ✗ (403 Forbidden) | ✗ (401) |
| `GET /api/v1/doctor/profile` | ✗ (403 Forbidden) | ✓ (Own Profile) | ✗ (403 Forbidden) | ✗ (401) |
| `GET /api/v1/doctor/dashboard` | ✗ (403 Forbidden) | ✓ | ✗ (403 Forbidden) | ✗ (401) |
| `GET /api/v1/admin/dashboard` | ✗ (403 Forbidden) | ✗ (403 Forbidden) | ✓ | ✗ (401) |
| `GET /api/v1/admin/users` | ✗ (403 Forbidden) | ✗ (403 Forbidden) | ✓ | ✗ (401) |
| `POST /api/v1/admin/doctors/verify` | ✗ (403 Forbidden) | ✗ (403 Forbidden) | ✓ | ✗ (401) |
| `GET /api/v1/admin/audit-logs` | ✗ (403 Forbidden) | ✗ (403 Forbidden) | ✓ | ✗ (401) |

## 3. Strict Resource Ownership Enforcement

To eliminate horizontal privilege escalation (BOLA / IDOR):
- Protected patient and doctor profile endpoints do not accept client-provided user IDs in the request path (e.g., `/patient/profile/{id}`).
- The authenticated identity is always extracted from the server-side SecurityContext via `SecurityUtils.getCurrentUserId()`.

```java
UUID currentUserId = SecurityUtils.getCurrentUserId();
User user = userRepository.findById(currentUserId)
        .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));
```

## 4. Doctor Verification Status Lifecycle

```
[ Doctor Registration ]
          │
          ▼
   PENDING_VERIFICATION (Can access profile & basic dashboard)
          │
    Admin Action
   ┌──────┴──────┐
   ▼             ▼
VERIFIED      REJECTED (Reason recorded in audit trail)
```
