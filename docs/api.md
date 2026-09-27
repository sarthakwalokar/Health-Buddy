# Health Buddy — API Reference & Specification

Base URL: `http://localhost:8080/api/v1`  
Interactive OpenAPI UI: `http://localhost:8080/swagger-ui.html`

---

## 1. System & Health

### `GET /api/v1/system/status`
Public endpoint returning current operational status of the platform and database connection without revealing internal infrastructure secrets.
- **Access**: Public
- **Response (200 OK)**:
```json
{
  "status": "OPERATIONAL",
  "api": "UP",
  "database": "UP",
  "timestamp": "2026-09-27T12:00:00Z"
}
```

### `GET /api/v1/health`
Lightweight actuator/health probe.
- **Access**: Public
- **Response**:
```json
{
  "status": "UP",
  "service": "Health Buddy API",
  "database": "CONNECTED",
  "timestamp": "2026-09-27T12:00:00Z"
}
```

---

## 2. Authentication (`/api/v1/auth`)

### `POST /api/v1/auth/register/patient`
Registers a new Patient account with automatic profile creation and JWT issuance.
- **Access**: Public

### `POST /api/v1/auth/register/doctor`
Registers a new Doctor account with initial status `PENDING_VERIFICATION`.
- **Access**: Public

### `POST /api/v1/auth/login`
Authenticates credentials and returns user role and tokens.
- **Access**: Public

### `POST /api/v1/auth/refresh`
Rotates access token using a valid refresh token.
- **Access**: Public

### `POST /api/v1/auth/logout`
Revokes active refresh token and logs out the user.
- **Access**: Authenticated

### `GET /api/v1/auth/me`
Returns authenticated user identity metadata.
- **Access**: Authenticated

### `POST /api/v1/auth/change-password`
Changes user password with BCrypt hashing and invalidates previous refresh tokens.
- **Access**: Authenticated

---

## 3. Phase 4: Medical Reports & Document Processing (`/api/v1/patient/reports`)

All endpoints in this section require authenticated `ROLE_PATIENT`. Strict ownership checks derive patient identity directly from the Spring Security context / JWT — never from client-supplied IDs.

### 3.1 `POST /api/v1/patient/reports`
Uploads a new medical report (PDF, PNG, JPG, JPEG) up to 25MB. Performs file validation, safe storage key assignment, initial metadata creation, and triggers automated text/parameter extraction.
- **Access**: `ROLE_PATIENT`
- **Content-Type**: `multipart/form-data`
- **Form Parameters**:
  - `file`: Multipart file binary
  - `reportType`: (Optional) `LAB_REPORT`, `PRESCRIPTION`, `IMAGING_REPORT`, `DISCHARGE_SUMMARY`, `PATHOLOGY_REPORT`, `OTHER`, `UNKNOWN`
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Medical report uploaded and processed successfully",
  "data": {
    "id": "7b7a13d8-5b4e-4b62-9599-4c123456789a",
    "originalFileName": "lipid_panel_2026.pdf",
    "fileType": "application/pdf",
    "fileSize": 1048576,
    "reportType": "LAB_REPORT",
    "uploadedAt": "2026-09-27T10:15:30Z",
    "processingStatus": "PROCESSED",
    "verificationStatus": "NOT_VERIFIED",
    "extractedText": "LIPID PANEL RESULTS\nTotal Cholesterol: 215 mg/dL\nTriglycerides: 160 mg/dL\nHDL: 48 mg/dL\nLDL: 135 mg/dL",
    "processedAt": "2026-09-27T10:15:32Z",
    "verifiedAt": null,
    "parameterCount": 4,
    "parameters": [
      {
        "id": "e4f1a23b-0123-4567-89ab-cdef01234567",
        "parameterName": "Total Cholesterol",
        "parameterCode": "CHOL_TOTAL",
        "valueNumeric": 215.0,
        "valueText": "215",
        "unit": "mg/dL",
        "referenceRange": "< 200 mg/dL",
        "observationDate": null,
        "extractionConfidence": 0.95,
        "source": "PDF_TEXT",
        "patientVerified": false
      }
    ]
  }
}
```

### 3.2 `GET /api/v1/patient/reports`
Retrieves all medical reports uploaded by the authenticated patient.
- **Access**: `ROLE_PATIENT`
- **Query Parameters**:
  - `reportType`: (Optional) Filter by type (`LAB_REPORT`, etc.)
  - `processingStatus`: (Optional) Filter by status (`PROCESSED`, etc.)
  - `verificationStatus`: (Optional) Filter by verification status (`NOT_VERIFIED`, etc.)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Medical reports retrieved successfully",
  "data": [ ... ]
}
```

### 3.3 `GET /api/v1/patient/reports/{id}`
Retrieves a specific medical report with full extracted text and parameters.
- **Access**: `ROLE_PATIENT`
- **Ownership**: Returns `404 Not Found` if report belongs to another patient or does not exist.

### 3.4 `GET /api/v1/patient/reports/{id}/file`
Securely streams the binary report document for preview or download.
- **Access**: `ROLE_PATIENT`
- **Ownership**: Returns `404 Not Found` if report belongs to another patient.
- **Headers Returned**:
  - `Content-Type`: Original validated MIME type
  - `Content-Disposition`: `inline; filename="original_filename.pdf"`

### 3.5 `DELETE /api/v1/patient/reports/{id}`
Deletes a medical report, its extracted parameters, and its stored physical file.
- **Access**: `ROLE_PATIENT`
- **Response (200 OK)**

### 3.6 `POST /api/v1/patient/reports/{id}/verify`
Confirms and marks the report as patient-reviewed and verified (`PATIENT_VERIFIED`).
- **Access**: `ROLE_PATIENT`
- **Response (200 OK)**

### 3.7 `GET /api/v1/patient/reports/{id}/parameters`
Lists all extracted parameters for a specific report.
- **Access**: `ROLE_PATIENT`

### 3.8 `POST /api/v1/patient/reports/{id}/parameters`
Adds a new manually documented parameter to the report.
- **Access**: `ROLE_PATIENT`
- **Request Body**:
  ```json
  {
    "parameterName": "Vitamin D, 25-OH",
    "parameterCode": "VIT_D",
    "valueNumeric": 34.2,
    "valueText": "34.2",
    "unit": "ng/mL",
    "referenceRange": "30 - 100 ng/mL",
    "observationDate": "2026-09-20"
  }
  ```

### 3.9 `PUT /api/v1/patient/reports/{id}/parameters/{parameterId}`
Updates an extracted parameter value or reference range, marking source as `MANUAL` and `patientVerified = true`.
- **Access**: `ROLE_PATIENT`
- **Request Body**:
  ```json
  {
    "parameterName": "Total Cholesterol",
    "valueNumeric": 210.0,
    "valueText": "210",
    "unit": "mg/dL",
    "referenceRange": "< 200 mg/dL",
    "patientVerified": true
  }
  ```

### 3.10 `DELETE /api/v1/patient/reports/{id}/parameters/{parameterId}`
Deletes an extracted parameter.
- **Access**: `ROLE_PATIENT`

---

## 4. Phase 3: Patient Health Profile & Medical History (`/api/v1/patient`)

### 4.1 Patient Health Profile
- `GET /api/v1/patient/profile`: Demographic, body metrics, emergency contact, address & completion %.
- `PUT /api/v1/patient/profile`: Update profile fields.

### 4.2 Allergies (`/api/v1/patient/allergies`)
- `GET /api/v1/patient/allergies`
- `POST /api/v1/patient/allergies`
- `PUT /api/v1/patient/allergies/{id}`
- `DELETE /api/v1/patient/allergies/{id}`

### 4.3 Medical Conditions (`/api/v1/patient/conditions`)
- `GET /api/v1/patient/conditions`
- `POST /api/v1/patient/conditions`
- `PUT /api/v1/patient/conditions/{id}`
- `DELETE /api/v1/patient/conditions/{id}`

### 4.4 Surgical History (`/api/v1/patient/surgeries`)
- `GET /api/v1/patient/surgeries`
- `POST /api/v1/patient/surgeries`
- `PUT /api/v1/patient/surgeries/{id}`
- `DELETE /api/v1/patient/surgeries/{id}`

### 4.5 Family Medical History (`/api/v1/patient/family-history`)
- `GET /api/v1/patient/family-history`
- `POST /api/v1/patient/family-history`
- `PUT /api/v1/patient/family-history/{id}`
- `DELETE /api/v1/patient/family-history/{id}`

### 4.6 Lifestyle & Habits (`/api/v1/patient/lifestyle`)
- `GET /api/v1/patient/lifestyle`
- `PUT /api/v1/patient/lifestyle`

### 4.7 Health Goals (`/api/v1/patient/health-goals`)
- `GET /api/v1/patient/health-goals`
- `POST /api/v1/patient/health-goals`
- `PUT /api/v1/patient/health-goals/{id}`
- `DELETE /api/v1/patient/health-goals/{id}`

### 4.8 Health Timeline (`/api/v1/patient/timeline`)
- `GET /api/v1/patient/timeline`: Aggregates clinical history and medical report events.

---

---

## 7. Phase 5: Vitals, Health Monitoring & Alerts (`/api/v1/patient/vitals` & `/api/v1/patient/alerts`)

All endpoints require `ROLE_PATIENT`. Identity is derived from JWT context with strict zero cross-patient access (IDOR protected).

### 7.1 Vitals Endpoints (`/api/v1/patient/vitals`)

- `POST /api/v1/patient/vitals`: Record a new health measurement (e.g. `BLOOD_PRESSURE`, `HEART_RATE`, `BLOOD_GLUCOSE`, `SPO2`, `TEMPERATURE`, `WEIGHT`). Dual values supported for Blood Pressure (`systolic` / `diastolic`). If weight is recorded and height is present in patient profile, BMI is automatically calculated and stored.
- `GET /api/v1/patient/vitals`: List paginated health measurements with optional `type`, `from`, and `to` date filters.
- `GET /api/v1/patient/vitals/{id}`: Retrieve a specific vital measurement by ID.
- `PUT /api/v1/patient/vitals/{id}`: Update an existing vital measurement.
- `DELETE /api/v1/patient/vitals/{id}`: Delete an existing vital measurement.
- `GET /api/v1/patient/vitals/summary`: Get latest readings, trends, changes, unread alerts count, and calculated BMI for dashboard.
- `GET /api/v1/patient/vitals/trends`: Get time-series trend data and statistical summary (min, max, average, change, count) for a specific measurement type over a period (`7_DAYS`, `30_DAYS`, `90_DAYS`, `6_MONTHS`, `1_YEAR`).
- `GET /api/v1/patient/vitals/blood-pressure`: Convenient blood pressure history endpoint.
- `GET /api/v1/patient/vitals/heart-rate`: Convenient heart rate history endpoint.
- `GET /api/v1/patient/vitals/glucose`: Convenient blood glucose history endpoint.
- `GET /api/v1/patient/vitals/temperature`: Convenient temperature history endpoint.
- `GET /api/v1/patient/vitals/spo2`: Convenient oxygen saturation history endpoint.
- `GET /api/v1/patient/vitals/weight`: Convenient weight history endpoint.

### 7.2 Health Alerts Endpoints (`/api/v1/patient/alerts`)

- `GET /api/v1/patient/alerts`: List patient's health alerts with optional `status` filter (`UNREAD`, `READ`, `ACKNOWLEDGED`, `RESOLVED`) and pagination.
- `GET /api/v1/patient/alerts/{id}`: Retrieve alert details by ID.
- `POST /api/v1/patient/alerts/{id}/read`: Mark alert as read.
- `POST /api/v1/patient/alerts/{id}/acknowledge`: Acknowledge alert notice with timestamp.

---

## 8. Phase 6: Medication Management, Doses & Reminders (`/api/v1/patient/medications`, `/api/v1/patient/medication-doses`, `/api/v1/patient/reminders`)

All endpoints strictly enforce `ROLE_PATIENT`. Identity is derived from JWT context with zero cross-patient data access.

### 8.1 Medication Endpoints (`/api/v1/patient/medications`)

- `POST /api/v1/patient/medications`: Record a new medication entry along with structured schedules (`FIXED_TIME`, `INTERVAL`, `DAYS_OF_WEEK`, `AS_NEEDED`).
- `GET /api/v1/patient/medications`: Paginated list of medications with optional `status` and `query` search filters.
- `GET /api/v1/patient/medications/{id}`: Retrieve detailed medication information, schedule times, reminder settings, and next scheduled dose.
- `PUT /api/v1/patient/medications/{id}`: Update medication details and schedule.
- `DELETE /api/v1/patient/medications/{id}`: Soft/Hard delete medication record.
- `POST /api/v1/patient/medications/{id}/pause`: Transition medication status to `PAUSED`.
- `POST /api/v1/patient/medications/{id}/resume`: Transition medication status to `ACTIVE`.
- `POST /api/v1/patient/medications/{id}/stop`: Transition medication status to `STOPPED` with confirmation semantics.
- `POST /api/v1/patient/medications/{id}/complete`: Transition medication status to `COMPLETED`.
- `GET /api/v1/patient/medications/{id}/adherence`: Retrieve adherence rate analytics for a specific medication over a date range (`from` / `to`).
- `PUT /api/v1/patient/medications/{id}/reminders`: Update reminder configuration (`reminderEnabled`, `reminderMinutesBefore`).

### 8.2 Medication Dose Endpoints (`/api/v1/patient/medication-doses`)

- `GET /api/v1/patient/medication-doses`: List historical and scheduled doses with optional date filters (`from`, `to`), `medicationId`, and `status`.
- `GET /api/v1/patient/medication-doses/today`: Retrieve all doses scheduled for today along with summary counts (total scheduled, taken, upcoming, missed).
- `POST /api/v1/patient/medication-doses/{id}/taken`: Mark a scheduled or ad-hoc dose as `TAKEN` with optional timestamp and notes.
- `POST /api/v1/patient/medication-doses/{id}/skipped`: Mark a scheduled dose as `SKIPPED` with reason/notes.
- `POST /api/v1/patient/medication-doses/{id}/missed`: Mark a scheduled dose as `MISSED`.

### 8.3 Medication Reminder Endpoints (`/api/v1/patient/reminders`)

- `GET /api/v1/patient/reminders`: List active in-app medication reminders for the authenticated patient with optional `status` filter (`UNREAD`, `READ`, `DISMISSED`, `SNOOZED`).
- `POST /api/v1/patient/reminders/{id}/read`: Mark reminder as read.
- `POST /api/v1/patient/reminders/{id}/dismiss`: Dismiss reminder.
- `POST /api/v1/patient/reminders/{id}/snooze`: Snooze reminder for a configurable number of minutes.


