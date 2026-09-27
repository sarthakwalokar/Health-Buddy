# Health Buddy
> **Clinical Decision Support & Tele-Connectivity Platform**  
> *Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5 + Phase 6: Medication Management, Doses & Reminders*

---

## 1. Project Overview

**Health Buddy** is an enterprise-grade healthcare platform designed to connect Patients and Doctors with strict data ownership, medical license verification workflows, clinical decision-support data foundations, medical reports & document processing vaults, physiological vitals tracking, statistical trend analysis, a rule-based informational alert engine, and safe, patient-entered medication management with schedule tracking, dose recording, adherence analytics, and in-app reminders.

### Key Deliverables Completed:
- **Medication Management + Reminders (Phase 6)**:
  - Safe patient-entered medication tracking (`ACTIVE`, `PAUSED`, `COMPLETED`, `STOPPED`) with structured dosage, unit, route (`ORAL`, `TOPICAL`, `INJECTION`, `INHALATION`, etc.), and instructions.
  - Multi-type scheduling engine (`FIXED_TIME`, `INTERVAL`, `DAYS_OF_WEEK`, `AS_NEEDED`) with automatic upcoming dose generation.
  - Granular dose action tracking (`SCHEDULED`, `TAKEN`, `SKIPPED`, `MISSED`) with timestamp recording and notes.
  - Mathematically accurate adherence analytics (`taken / applicable scheduled doses`) with 30-day tracking, per-medication adherence, and timeline history.
  - In-app reminder system (`MedicationReminderScheduler`) generating proactive alerts for scheduled doses while strictly preventing duplicate reminders.
  - Non-prescribing medical safety guardrails: zero automatic dosage alterations, zero automatic discontinuation, clear professional medical consultation disclaimers.
  - Full Health Timeline and Patient Dashboard widget integration with Today's Medications summary.
- **Vitals, Health Monitoring & Trends (Phase 5)**:
  - Comprehensive measurement tracking: Blood Pressure (systolic/diastolic dual-value), Heart Rate (bpm), Blood Glucose (mg/dL with fasting/post-meal/random context), SpO2 (%), Body Temperature (°C), Weight (kg), and Height (cm).
  - Automatic, non-overrideable BMI calculation and snapshotting (`source = SYSTEM_CALCULATED`) based on profile height and recorded weight.
  - Configurable, explainable Clinical Rule Engine (`HealthRuleEngine`) evaluating physiological thresholds for Blood Pressure, Heart Rate, Glucose, SpO2, Temperature, and rapid Weight changes.
  - Informational safety alert architecture (`HealthAlert`) with severity levels (`INFO`, `LOW`, `MEDIUM`, `HIGH`, `EMERGENCY`) and cautious, professional-care recommendation language.
  - Time-series statistical trend analytics (latest, min, max, average, period-over-period change, descriptive summaries).
  - Professional Recharts-powered trend visualization with interactive period selectors (7 Days, 30 Days, 90 Days, 6 Months, 1 Year).
  - Traceable medical report integration (`source = MEDICAL_REPORT`, linking to `source_report_id`).
  - Full timeline & patient dashboard integration with alert count badges and action buttons.
- **Medical Reports & Secure Document Processing (Phase 4)**:
  - Multi-format secure document upload (PDF, PNG, JPG, JPEG) with strict file size and type validation (magic-byte header inspection + extension checking).
  - Pluggable file storage abstraction (`FileStorageService`) with path-traversal prevention, isolated filesystem repository, and clean extension hooks for Amazon S3 / MinIO.
  - Document processing & text extraction abstraction (`DocumentProcessingService`) supporting PDF extraction via Apache PDFBox and clinical parameter extraction heuristics (Lipids, Blood Glucose, HbA1c, Hemoglobin, BUN, Creatinine, TSH, Vit D, Platelets, etc.).
  - Structured parameter repository (`MedicalReportParameter`) tracking extraction confidence, provenance/source (`OCR`, `PDF_TEXT`, `MANUAL`), and patient verification status.
  - Interactive Patient Review & Verification workflow (`NOT_VERIFIED` -> `PATIENT_VERIFIED` / `DOCTOR_REVIEWED`) with full manual correction auditability.
  - Authenticated, ownership-verified document streaming preview and download endpoints (zero public direct file links).
  - Health Timeline and Patient Dashboard integration with real-time processing status tracking (`UPLOADED`, `PROCESSING`, `PROCESSED`, `FAILED`).
  - Public System Operational Status API (`GET /api/v1/system/status`) reporting real backend and database availability without leaking internal infrastructure details.
- **Patient Health Profile & Clinical History Vault (Phase 3)**:
  - Complete demographics (DOB, gender, occupation, marital status), body metrics (height cm, weight kg, blood group, informational BMI reference), emergency contact, and residential address.
  - Multi-allergy logging with severity, status, reactions, and clinical notes.
  - Medical & chronic conditions with diagnosis date, status, notes, and provenance tracking.
  - Surgical history with procedure dates, hospital/facility names, and operative notes.
  - Family medical history tracking hereditary factors and age of onset.
  - Lifestyle factors (smoking, alcohol, activity levels, diet, sleep, hydration) and health goals.
  - Health timeline foundation & deterministic completion indicator.
- **Core Security & Authentication (Phases 1 & 2)**:
  - Zero-Trust ownership & security context derived strictly from authenticated JWT claims.
  - Strict zero cross-patient data access (no IDOR).
  - Doctor credential registration, verification workflow, and administrative governance.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with modern healthcare palette (Dominant White `#FFFFFF`, Soft Background `#FFF7F3`, Primary Orange `#F97316` / `#EA580C`, Brand Dark Pink `#BE185D`, Critical Red `#DC2626`, Dark Charcoal `#171717`)
- **Visualizations**: Recharts Time-Series Charts & Statistical Analytics
- **Routing**: React Router DOM 6 (Role & Protected Route Guards)
- **State & Server Cache**: TanStack React Query v5 + Centralized Axios Client
- **Medication & Vitals UI**: Responsive medication cards, schedule builder, dose tracking, adherence analytics, and reminder center
- **Icons**: Lucide React

### Backend
- **Framework**: Spring Boot 3.3.4 (Java 17 / 21 LTS)
- **Security**: Spring Security 6 (Stateless JWT JJWT 0.12.6 + BCrypt 12-round hashing)
- **Clinical Rule Engine**: Modular, testable `HealthRuleEngine` and informational alert service
- **Reminder Engine**: Automated `MedicationReminderScheduler` for in-app reminders & dose generation
- **Document Processing**: Apache PDFBox 3.0.3 + Regex Parameter Extraction Engine
- **Persistence**: Spring Data JPA + Hibernate 6
- **Database**: PostgreSQL 16
- **Database Migrations**: Flyway (`V1__initial_schema.sql`, `V2__patient_health_profile.sql`, `V3__medical_reports.sql`, `V4__health_vitals.sql`, `V5__medications.sql`)
- **Documentation**: SpringDoc OpenAPI 3.0 / Swagger UI
- **Testing**: JUnit 5 + MockMvc + Spring Boot Test (65 Automated Tests Passing with 0 failures)

---

## 3. Monorepo Project Structure

```
/health-buddy
 ├── docs/
 │    ├── architecture.md             # System architecture & Phase 4 document processing design
 │    ├── authentication.md           # JWT & Auth mechanics
 │    ├── authorization.md            # Role-based access & permissions
 │    ├── security.md                 # Zero-trust ownership, document isolation & audit policy
 │    └── api.md                      # Comprehensive OpenAPI endpoint specifications
 ├── backend/
 │    ├── src/main/resources/db/migration/
 │    │    ├── V1__initial_schema.sql
 │    │    ├── V2__patient_health_profile.sql
 │    │    └── V3__medical_reports.sql
 │    ├── src/main/java/com/healthbuddy/
 │    │    ├── entity/                # MedicalReport, MedicalReportParameter, PatientProfile, etc.
 │    │    ├── repository/            # MedicalReportRepo, MedicalReportParameterRepo, etc.
 │    │    ├── service/               # MedicalReportService, FileStorageService, DocumentProcessingService
 │    │    ├── controller/            # REST Controllers (/api/v1/patient/reports, /api/v1/system/status)
 │    │    ├── dto/                   # Request & Response DTOs
 │    │    └── mapper/                # DTO mappers with completion calculation
 │    └── src/test/                   # 48 Comprehensive Integration & Security Tests
 └── frontend/
      └── src/
           ├── api/                   # Typed API client functions (reportApi.ts, systemApi.ts)
           ├── types/                 # TypeScript domain models (report.ts, system.ts)
           ├── components/
           │    ├── reports/          # UploadReportModal, ParameterTable, EditParameterModal, Preview
           │    ├── timeline/         # HealthTimeline foundation component
           │    ├── ui/               # Badge, Card, Input, Button, Alert
           │    └── feedback/         # LoadingState, ErrorState, EmptyState
           ├── layouts/               # Sidebar, Header, Footer, DashboardLayout
           └── pages/
                ├── LandingPage.tsx   # Modern healthcare landing page with live system status
                └── patient/
                     ├── MedicalReportsPage.tsx       # Document management list & upload trigger
                     ├── MedicalReportDetailPage.tsx   # Detailed report viewer, parameters & verification
                     ├── PatientHealthProfilePage.tsx # Demographic & biometric profile
                     ├── MedicalHistoryPage.tsx       # Tabbed Clinical History Vault
                     └── PatientDashboardPage.tsx     # Dashboard with Recent Medical Reports
```

---

## 4. Setup & Running Instructions

### Option A: Using Docker Compose

```bash
docker compose up --build
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:8080/api/v1`
- **Swagger Documentation**: `http://localhost:8080/swagger-ui.html`
- **System Status Endpoint**: `http://localhost:8080/api/v1/system/status`
- **Health Check Probe**: `http://localhost:8080/api/v1/health`

---

### Option B: Running Locally for Development

#### 1. Backend
```bash
cd backend
mvn clean spring-boot:run
```

#### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 5. Seed / Demo Accounts

| Role | Email | Password | Access / Features |
| :--- | :--- | :--- | :--- |
| **PATIENT** | `patient.test@healthbuddy.com` | `Password@123` | Patient Health Profile, Medical History Vault, Medical Reports & Parameters, Health Goals, Timeline |
| **DOCTOR** | `doctor.test@healthbuddy.com` | `Password@123` | Doctor Portal, License & Credential Status |
| **ADMIN** | `admin@healthbuddy.com` | `Admin@HealthBuddy2026!` | Admin Console, Doctor Verification, Audit Log Viewer |

---

## 6. Automated Testing Suite

To execute the automated test suite:
```bash
cd backend
mvn test
```

### Verified Test Suite (48 Tests Passing — 0 Failures / 0 Errors):
1. ✓ Patient registration & profile auto-creation
2. ✓ Doctor registration & verification status
3. ✓ Duplicate email conflict handling (409 Conflict)
4. ✓ Password validation constraints (400 Bad Request)
5. ✓ Patient, Doctor, and Admin login authentication
6. ✓ Bad credentials & Invalid JWT handling (401 Unauthorized)
7. ✓ Access token expiration & refresh token rotation
8. ✓ Role isolation (Patient -> Doctor, Doctor -> Patient, Doctor -> Admin) (403 Forbidden)
9. ✓ BCrypt 12-round password hashing
10. ✓ Secure logout & token revocation
11. ✓ Admin doctor approval/rejection workflows
12. ✓ Security audit logging
13. ✓ Public System Status endpoint (`/api/v1/system/status`)
14. ✓ Health check endpoint (`/api/v1/health`)
15. ✓ Patient health profile retrieval & demographic updates
16. ✓ Patient allergy creation, validation, update & deletion
17. ✓ Cross-patient allergy access rejection (404/403)
18. ✓ Patient condition creation, status updates & deletion
19. ✓ Future diagnosis date validation (400 Bad Request)
20. ✓ Patient surgical history CRUD operations
21. ✓ Patient family medical history CRUD operations
22. ✓ Patient lifestyle factor updates
23. ✓ Patient health goal creation, status transition & deletion
24. ✓ Complete health profile & history audit log verification
25. ✓ Medical report upload with file validation & storage key generation
26. ✓ Medical report PDF text extraction & structured parameter parsing
27. ✓ Medical report retrieval by ID & listing scoped to patient
28. ✓ Cross-patient report access rejection (404 Not Found)
29. ✓ Cross-patient report download rejection (404 Not Found)
30. ✓ Cross-patient parameter update rejection (404 Not Found)
31. ✓ Cross-patient report deletion rejection (404 Not Found)
32. ✓ Patient verification transition (`PATIENT_VERIFIED`)
33. ✓ Extracted parameter correction with provenance auditability
34. ✓ Unauthenticated access denial on medical report endpoints
35. ✓ Doctor access rejection on patient-scoped medical report endpoints
36. ✓ Report timeline event integration and audit logging
