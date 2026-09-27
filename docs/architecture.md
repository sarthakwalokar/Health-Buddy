# Health Buddy — Architecture Documentation

## 1. System Overview

**Health Buddy** is an enterprise-grade clinical decision support and tele-connectivity platform engineered with strict role isolation between **Patients**, **Doctors**, and **Administrators**.

```
+-------------------------------------------------------------------------------+
|                                Frontend (SPA)                                 |
|          React 18 + TypeScript + Tailwind CSS + TanStack Query + Axios        |
|                                                                               |
|  [ Public Landing Page ]     [ Patient Portal ]        [ Doctor / Admin ]     |
|   / (with real System Status)  /patient/reports          /doctor/dashboard    |
|                                /patient/reports/:id      /admin/dashboard     |
|                                /patient/health-profile                        |
|                                /patient/medical-history                       |
+---------------------------------------+---------------------------------------+
                                        | (REST over JSON / Authenticated JWT Bearer)
                                        v
+-------------------------------------------------------------------------------+
|                            Backend Application Layer                          |
|                       Spring Boot 3.3.4 (Java 17/21 LTS)                      |
|                                                                               |
|  +---------------------+   +---------------------+   +---------------------+  |
|  |   Spring Security   |   |   JWT Filter Layer  |   | Rate Limiting & Net |  |
|  |     Authorities     |   |    (JJWT 0.12.6)    |   |     Validation      |  |
|  +----------+----------+   +----------+----------+   +----------+----------+  |
|             |                         |                         |             |
|             v                         v                         v             |
|  +-------------------------------------------------------------------------+  |
|  |                         Thin Controller Layer                           |  |
|  |   /api/v1/auth   |   /api/v1/patient/*  |   /api/v1/system/status  | ...    |  |
|  +------------------------------------+------------------------------------+  |
|                                       |                                       |
|                                       v                                       |
|  +-------------------------------------------------------------------------+  |
|  |                         Business Service Layer                          |  |
|  |   MedicalReportService  | FileStorageService | DocumentProcessingService|  |
|  |   PatientService        | AuthService        | DoctorService            |  |
|  +-------------------+----------------+-------------------+----------------+  |
|                      |                |                   |                   |
|                      v                v                   v                   |
|  +-----------------------+  +-------------------+  +-----------------------+  |
|  | Local / S3 File Store |  | PDFBox / OCR Eng. |  | Spring Data JPA / ORM |  |
|  |  (Encrypted Storage)  |  | (Param Extractor) |  |   (Hibernate 6)       |  |
|  +-----------------------+  +-------------------+  +-----------+-----------+  |
+----------------------------------------------------------------|--------------+
                                                                 | (JDBC / Hikari)
                                                                 v
+-------------------------------------------------------------------------------+
|                           Data Persistence & Schema                           |
|                    PostgreSQL 16 + Flyway Versioned Migrations                |
|       (medical_reports, medical_report_parameters, patient_profiles, ...)    |
+-------------------------------------------------------------------------------+
```

---

## 2. Phase 4: Medical Reports & Document Processing Architecture

### 2.1 Database Models & Entity Relations

#### `MedicalReport`
Represents an uploaded health document belonging to an authenticated patient.
- `id` (UUID, Primary Key)
- `patient_id` (UUID, Foreign Key referencing `patient_profiles.id`, indexed)
- `original_file_name` (VARCHAR): Sanitized original client filename.
- `stored_file_name` (VARCHAR): Internal collision-resistant UUID filename.
- `file_type` (VARCHAR): Validated MIME type (`application/pdf`, `image/png`, `image/jpeg`).
- `file_size` (BIGINT): File size in bytes.
- `storage_key` (VARCHAR): Abstract storage reference key used by `FileStorageService`.
- `report_type` (Enum): `LAB_REPORT`, `PRESCRIPTION`, `IMAGING_REPORT`, `DISCHARGE_SUMMARY`, `PATHOLOGY_REPORT`, `OTHER`, `UNKNOWN`.
- `processing_status` (Enum): `UPLOADED`, `PROCESSING`, `PROCESSED`, `FAILED`.
- `verification_status` (Enum): `NOT_VERIFIED`, `PATIENT_VERIFIED`, `DOCTOR_REVIEWED`.
- `extracted_text` (TEXT): Full raw text extracted via OCR or PDF parsing.
- `uploaded_at`, `processed_at`, `verified_at`, `created_at`, `updated_at`.

#### `MedicalReportParameter`
Represents structured clinical observations extracted from a medical report.
- `id` (UUID, Primary Key)
- `report_id` (UUID, Foreign Key referencing `medical_reports.id`, indexed)
- `parameter_name` (VARCHAR): Clinical parameter name (e.g. `Total Cholesterol`, `Hemoglobin`, `HbA1c`).
- `parameter_code` (VARCHAR): Standardized LOINC or internal clinical parameter code.
- `value_numeric` (NUMERIC): Parsed numeric measurement value where applicable.
- `value_text` (VARCHAR): Raw or non-numeric observation text.
- `unit` (VARCHAR): Measurement unit (e.g. `mg/dL`, `g/dL`, `%`, `ng/mL`).
- `reference_range` (VARCHAR): Standard biological reference interval.
- `observation_date` (DATE): Observed collection or test date if detected in document.
- `extraction_confidence` (DOUBLE PRECISION): 0.0–1.0 confidence score of extraction.
- `source` (Enum): `OCR`, `PDF_TEXT`, `MANUAL`, `OTHER`.
- `patient_verified` (BOOLEAN): Flag indicating patient review and confirmation.
- `created_at`, `updated_at`.

---

### 2.2 Secure File Storage Architecture (`FileStorageService`)

Uploaded clinical files contain highly sensitive protected health information (PHI). Health Buddy enforces the following file security principles:

1. **No Public Static File Serving**: Uploaded documents are never exposed in public static web roots (such as `/uploads/*` or public CDN buckets).
2. **Abstract Storage Key**: The database stores an opaque `storage_key` rather than physical disk paths or public URLs.
3. **Pluggable Interface**:
   ```java
   public interface FileStorageService {
       String store(MultipartFile file, String subDirectory);
       Resource retrieve(String storageKey);
       void delete(String storageKey);
       boolean exists(String storageKey);
   }
   ```
4. **Current Implementation**: `LocalFileSystemStorageService` stores documents in an isolated, configured application directory with path-traversal prevention (`Path.normalize()`, `startsWith()`), safe randomized UUID filenames, and file header validation.
5. **Future Cloud Extension**: The interface cleanly supports Drop-in implementations for **Amazon S3**, **MinIO**, or **Google Cloud Storage** with server-side encryption (SSE-KMS / SSE-S3).

---

### 2.3 Document Processing & Text Extraction Architecture (`DocumentProcessingService`)

The document processing pipeline is decoupled from controllers:

```
Patient Uploads File
       ↓
File Validation (Mime Type, Size, Magic Bytes)
       ↓
FileStorageService.store() -> Storage Key Generated
       ↓
Create MedicalReport (Status = UPLOADED)
       ↓
DocumentProcessingService.extractText(storageKey, fileType)
       ├── PDFBox 3.0 Parser (for application/pdf)
       └── Future Python OCR / Tesseract Service (for images/scanned PDFs)
       ↓
DocumentProcessingService.extractParameters(extractedText, reportType)
       ├── Regex & NLP Clinical Parameter Matcher
       └── Extraction Confidence & Range Normalization
       ↓
Persist MedicalReportParameters & Update MedicalReport (Status = PROCESSED)
       ↓
Emit Health Timeline Event & Security Audit Log
```

#### Replaceable OCR & Microservice Integration
For scanned documents and images in future phases, `DocumentProcessingService` will delegate to a specialized Python OCR service (Tesseract / PaddleOCR / AWS Textract / Cloud Vision) over gRPC/REST without modifying the core domain logic.

---

### 2.4 Patient Verification & Provenance Workflow

Because automated OCR and heuristics can misread low-resolution documents:
1. All newly extracted parameters default to `patient_verified = false` and report status `NOT_VERIFIED`.
2. The Patient reviews the extracted parameters side-by-side with the original document preview.
3. Patients can edit any parameter (value, unit, reference range) or add missing parameters.
4. When a parameter is manually corrected, its `source` transitions to `MANUAL` and `patient_verified = true` with audit log traceability.
5. Upon confirmation, the report transitions to `PATIENT_VERIFIED` with `verified_at` timestamp.

---

### 2.5 Strict Ownership & Zero Cross-Patient Access

- Every report endpoint (`/api/v1/patient/reports/**`) resolves the authenticated `PatientProfile` via Spring Security JWT context.
- All query lookups use `findByIdAndPatient(reportId, patient)`.
- If Patient A attempts to view, download, edit, or delete Patient B's report or parameter, the application returns `404 Not Found` (preventing IDOR and information leakage).
- Unauthenticated requests receive `401 Unauthorized`.
- Doctor and Admin roles attempting to invoke patient report endpoints receive `403 Forbidden`.

---

## 3. System Status Architecture

To provide genuine public system availability information on the landing page without revealing internal infrastructure secrets:
- Endpoint: `GET /api/v1/system/status` (Public)
- Checks live backend uptime and executes a lightweight JPA database connectivity test (`SELECT 1`).
- Returns standardized status:
  - `status`: `"OPERATIONAL"` | `"DEGRADED"`
  - `api`: `"UP"`
  - `database`: `"UP"` | `"DOWN"`
  - `timestamp`: Current ISO-8601 UTC timestamp.
- Never reveals database usernames, hostnames, connection pool internals, or stack traces.

---

## 4. Phase 3: Patient Health Profile & Medical History Architecture

- **`PatientProfile`**: One-to-one with `User`. Stores physical demographics (DOB, gender, blood group, height in cm, weight in kg, occupation, marital status), emergency contact, and address.
- **`PatientAllergy`**: Many-to-one with `PatientProfile`. Stores allergen, severity (`MILD`, `MODERATE`, `SEVERE`, `UNKNOWN`), status (`ACTIVE`, `RESOLVED`, `UNKNOWN`), reaction, and notes.
- **`PatientCondition`**: Many-to-one with `PatientProfile`. Stores condition name, diagnosed date, status (`ACTIVE`, `RESOLVED`, `HISTORICAL`, `UNKNOWN`), source (`PATIENT_REPORTED`, `DOCTOR_REPORTED`, `IMPORTED`), and notes.
- **`PatientSurgery`**: Many-to-one with `PatientProfile`. Stores procedure name, date of surgery, hospital name, and operative notes.
- **`PatientFamilyHistory`**: Many-to-one with `PatientProfile`. Stores relationship, condition, age of onset, and notes.
- **`PatientLifestyle`**: One-to-one with `PatientProfile`. Stores smoking status, alcohol status, activity level, dietary preferences, sleep hours, water intake, occupation type, and notes.
- **`PatientHealthGoal`**: Many-to-one with `PatientProfile`. Stores self-management goals with goal type, description, target value, target unit, target date, and status (`ACTIVE`, `COMPLETED`, `CANCELLED`).

---

---

## 5. Phase 5: Vitals, Health Monitoring & Trends Architecture

### 5.1 Health Measurement & Alert Data Model

#### `HealthMeasurement`
Represents an individual physiological measurement or clinical observation recorded by or for a patient:
- `id` (UUID, Primary Key)
- `patient_id` (UUID, Foreign Key referencing `patient_profiles.id`, indexed)
- `measurement_type` (Enum): `BLOOD_PRESSURE`, `HEART_RATE`, `BLOOD_GLUCOSE`, `TEMPERATURE`, `SPO2`, `WEIGHT`, `HEIGHT`, `BMI`
- `value_numeric` (NUMERIC): Primary numeric reading (e.g., Systolic BP, Heart Rate, Glucose, SpO2, Weight, Temp, BMI).
- `secondary_value_numeric` (NUMERIC): Secondary reading where medically appropriate (Diastolic BP for `BLOOD_PRESSURE`, otherwise `NULL`).
- `unit` (VARCHAR): Standardized measurement unit (`mmHg`, `bpm`, `mg/dL`, `°C`, `%`, `kg`, `cm`, `kg/m²`).
- `measurement_context` (Enum, Optional): Context of reading (`FASTING`, `POST_MEAL`, `RANDOM`, `RESTING`, `POST_EXERCISE`, `OTHER`).
- `source` (Enum): Provenance tracking (`MANUAL`, `MEDICAL_REPORT`, `DEVICE`, `IMPORTED`, `SYSTEM_CALCULATED`).
- `source_report_id` (UUID, Optional): Traceability reference to originating `medical_reports.id` if extracted from a verified lab report.
- `measurement_time` (TIMESTAMP WITH TIME ZONE): Date and time of measurement observation.
- `notes` (TEXT): Optional contextual observation notes.
- `created_at`, `updated_at`.

#### `HealthAlert`
Informational clinical safety alerts generated from rule evaluations:
- `id` (UUID, Primary Key)
- `patient_id` (UUID, Foreign Key referencing `patient_profiles.id`, indexed)
- `measurement_id` (UUID, Foreign Key referencing `health_measurements.id`, indexed)
- `alert_type` (VARCHAR): Rule identifier (e.g. `BP_ELEVATED_STAGE2`, `GLUCOSE_HYPOGLYCEMIA_RISK`, `SPO2_DESATURATION_URGENT`).
- `severity` (Enum): `INFO`, `LOW`, `MEDIUM`, `HIGH`, `EMERGENCY`.
- `title` (VARCHAR): Clear, non-diagnostic headline.
- `message` (TEXT): Informational description with cautious, professional-care recommendation language.
- `status` (Enum): `UNREAD`, `READ`, `ACKNOWLEDGED`, `RESOLVED`.
- `created_at`, `acknowledged_at`, `updated_at`.

---

### 5.2 Configurable Clinical Rule Engine (`HealthRuleEngine`)

To ensure testability, safety, and non-diagnostic transparency:
1. **Rule Interface (`HealthRule`)**: Evaluates a specific vital measurement against patient historical context and returns a `HealthRuleResult` (triggered boolean, severity, alert type, title, message).
2. **Dedicated Modular Rules**:
   - `BloodPressureRule`: Detects severe elevated readings (systolic >= 180 or diastolic >= 120), high blood pressure ranges (systolic >= 140 or diastolic >= 90), and hypotension (< 90 / 60 mmHg).
   - `BloodGlucoseRule`: Detects potential hypoglycemia (< 70 mg/dL) and acute hyperglycemia (> 250 mg/dL).
   - `SpO2Rule`: Identifies acute desaturation (<= 89%) and low saturation (90-94%).
   - `HeartRateRule`: Flags extreme bradycardia (< 45 bpm) or tachycardia (> 130 bpm).
   - `TemperatureRule`: Identifies high hyperthermia (>= 39.5 °C) and hypothermia (<= 35.0 °C).
   - `WeightTrendRule`: Identifies rapid weight gain or loss (> 3.0 kg within 7 days).
3. **Safe, Informational Messaging**: All rules use neutral, informational language (e.g. *"Notable reading detected. If you are experiencing symptoms, consider consulting your healthcare provider."*) without providing medical diagnoses or drug prescriptions.

---

### 5.3 Automated BMI Calculation
When a patient records their `WEIGHT`, the system checks for the patient's existing height in `PatientProfile`. If present, it automatically calculates and stores a corresponding `BMI` record with `source = SYSTEM_CALCULATED` and a calculation note referencing the height and weight used.

---

### 5.4 Medical Report Extraction Integration
When lab reports in Phase 4 are processed and verified, compatible extracted parameters (such as Blood Glucose, Cholesterol, Hemoglobin, etc.) can be systematically linked into `HealthMeasurement` with `source = MEDICAL_REPORT` and `source_report_id` populated, maintaining end-to-end clinical data provenance.

---

### 5.5 Future Wearable & Device Extension Points
The `MeasurementSource.DEVICE` enum and `source` field architecture provide clean hooks for upcoming integrations (Apple HealthKit, Google Health Connect, Bluetooth BLE pulse oximeters, smart scales) via secured ingestion gateways without altering the core domain model.

---

## 6. Clinical Safety & Non-Autonomous Medical Diagnosis Declaration

- **Health Buddy does NOT make automated clinical diagnoses**: Stored profiles, vitals, trend lines, and rule alerts are strictly for informational organization and clinical communication.
- **No Treatment or Prescription Decisions**: The platform never suggests or dispenses medications or treatments.
- **Safety Disclaimers**: *"Health Buddy trend analytics and alerts are informational and do not replace professional clinical evaluation. For urgent symptoms, seek emergency medical care."*
- **Physician Decision Authority**: All medical interpretations remain exclusively with licensed healthcare practitioners.

---

## 7. Phase 6: Medication Management, Schedules, Doses & Reminders Architecture

### 7.1 Data Models & Entity Relations

```
+-----------------------------------------------------------------------------------+
|                                 PatientProfile                                    |
+-----------------------------------------+-----------------------------------------+
                                          | 1:N
                                          v
+-----------------------------------------------------------------------------------+
|                                   Medication                                      |
| - id (UUID, PK)                                                                   |
| - patient_id (FK -> patient_profiles.id)                                          |
| - medicine_name, generic_name, strength, dosage_amount, dosage_unit                |
| - route: ORAL, TOPICAL, INJECTION, INHALATION, OPHTHALMIC, OTIC, NASAL, OTHER     |
| - frequency_type: ONCE_DAILY, TWICE_DAILY, THREE_TIMES_DAILY, EVERY_X_HOURS, etc. |
| - status: ACTIVE, PAUSED, COMPLETED, STOPPED                                      |
| - source: PATIENT_ENTERED, DOCTOR_ENTERED, IMPORTED, OTHER                        |
| - reminder_enabled (BOOLEAN), reminder_minutes_before (INTEGER)                    |
| - start_date, end_date, instructions, reason, prescribed_by, notes                |
+-------------------+---------------------------------------+-----------------------+
                    | 1:N                                   | 1:N
                    v                                       v
+-----------------------------------+   +-------------------------------------------+
|        MedicationSchedule         |   |              MedicationDose               |
| - id (UUID, PK)                   |   | - id (UUID, PK)                           |
| - medication_id (FK)              |   | - medication_id (FK)                      |
| - schedule_type: FIXED_TIME,      |   | - scheduled_at (TIMESTAMPTZ)              |
|   INTERVAL, DAYS_OF_WEEK,         |   | - taken_at (TIMESTAMPTZ)                  |
|   AS_NEEDED                       |   | - status: SCHEDULED, TAKEN, SKIPPED,      |
| - time_of_day (TIME)              |   |   MISSED, CANCELLED                       |
| - days_of_week (VARCHAR)          |   | - notes (TEXT)                            |
| - interval_hours (INTEGER)        |   +-------------------------------------------+
| - dose_amount, dose_unit          |
+-----------------------------------+
```

### 7.2 Dosage & Route Structures
- **Dosage**: Numeric amount + specific clinical unit (e.g. `500 mg`, `10 mL`, `1 tablet`, `2 capsules`), accompanied by optional human-readable instructions.
- **Route**: Strictly modeled enum (`ORAL`, `TOPICAL`, `INJECTION`, `INHALATION`, `OPHTHALMIC`, `OTIC`, `NASAL`, `OTHER`, `UNKNOWN`).

### 7.3 Scheduling Engine & Dose Generation
- Schedulers run automatically to populate a rolling 7-day window of scheduled doses based on active medication schedules.
- `FIXED_TIME`: Doses created for specific clock times (e.g., 08:00, 20:00).
- `DAYS_OF_WEEK`: Doses scheduled on specified days (e.g., Mon, Wed, Fri).
- `INTERVAL`: Doses computed every N hours starting from reference times.
- `AS_NEEDED`: Doses are recorded dynamically upon patient ingestion, without mandatory advance scheduled alarms.

### 7.4 In-App Reminder Engine (`MedicationReminderScheduler`)
- Background scheduled daemon periodically checks for active medications with `reminder_enabled = true`.
- Evaluates upcoming scheduled doses within the configured reminder window (`scheduled_at - reminder_minutes_before`).
- Generates idempotent `MedicationReminder` records in `UNREAD` state and broadcasts real-time notifications.
- Automatically marks overdue doses as `MISSED` after configurable grace windows without patient action.

### 7.5 Adherence Calculation Formula
Adherence rate over a given evaluation window (default 30 days) is computed as:
$$\text{Adherence Rate (\%)} = \left( \frac{\text{Total TAKEN Doses}}{\text{Applicable Scheduled Doses (TAKEN + MISSED + SKIPPED)}} \right) \times 100$$
- Doses marked as `CANCELLED` are excluded from the denominator.
- Adherence is transparently presented with the exact date range and dosage counts.

### 7.6 Medical Safety Guardrails
- **Non-Prescribing Principle**: Health Buddy records patient-reported medication information. It does not prescribe, change dosages, automatically discontinue regimens, or suggest doubling missed doses.
- **Explicit Disclaimers**: Clear guidance is rendered on all medication tracking surfaces reminding patients to consult healthcare professionals before making any medication adjustments.

