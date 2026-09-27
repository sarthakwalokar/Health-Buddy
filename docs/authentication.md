# Health Buddy — Authentication & JWT Security

## 1. Authentication Lifecycle

```
[ Client ]                        [ Spring Security Filter ]           [ AuthService / Database ]
    |                                         |                                     |
    |---- 1. POST /api/v1/auth/login -------->|                                     |
    |       { email, password }               |                                     |
    |                                         |---- 2. Authenticate Credentials --->|
    |                                         |       BCrypt verify password hash   |
    |                                         |<--- 3. Return User Principal -------|
    |                                         |                                     |
    |                                         |---- 4. Generate Tokens ------------>|
    |                                         |       Access Token (15 min)         |
    |                                         |       Refresh Token (7 days)        |
    |<--- 5. Return AuthResponse -------------|                                     |
    |       { accessToken, refreshToken, role }                                     |
    |                                                                               |
    |---- 6. GET /api/v1/patient/profile ---->|                                     |
    |       Header: Bearer <accessToken>      |---- 7. Validate JWT Signature ----->|
    |                                         |       Check Expiration & Claims     |
    |                                         |---- 8. Set Security Context ------->|
    |<--- 9. Protected Data Response ---------|                                     |
```

## 2. JWT Claims Policy

To comply with HIPAA/GDPR health privacy standards:
- **Included Claims**:
  - `sub`: User UUID string
  - `email`: Authenticated email string
  - `roles`: Authority list (e.g. `["ROLE_PATIENT"]`)
  - `iat`: Timestamp issued
  - `exp`: Timestamp expiration (15 minutes)
- **Strictly Forbidden in JWT**:
  - Medical diagnoses, vitals, prescriptions, test results
  - Passwords or credentials
  - Personal identifiable health records

## 3. Password Security

- **Algorithm**: BCrypt with strength factor **12**.
- **Strength Policy**:
  - Minimum 8 characters.
  - At least 1 uppercase letter (`A-Z`).
  - At least 1 lowercase letter (`a-z`).
  - At least 1 number (`0-9`).
  - At least 1 special character (`@#$%^&+=!._-`).

## 4. Token Storage Tradeoffs

- **Access Token**: Short-lived (15 minutes).
- **Refresh Token**: Long-lived (7 days), stored securely and rotated on password change or explicit logout.
- **Revocation**: Logout immediately marks the refresh token record as revoked in PostgreSQL.
