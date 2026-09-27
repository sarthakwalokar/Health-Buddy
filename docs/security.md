# Health Buddy — Security Architecture & Governance

## 1. Zero-Trust Access Control & Medical Record Isolation

### 1.1 Identity Resolution
- Patient identity is strictly resolved from the authenticated Spring Security `SecurityContext` / JWT token claims.
- Client-supplied `userId` or `patientId` query/path parameters are rejected for all personal health endpoints.
- Endpoints follow the self-scoping pattern:
  - `GET /api/v1/patient/reports`
  - `GET /api/v1/patient/profile`
  - `GET /api/v1/patient/allergies`

### 1.2 Cross-Patient Tampering & IDOR Prevention
- All mutation and retrieval operations for reports and parameters enforce repository-level ownership scoping:
  ```java
  MedicalReport report = medicalReportRepository.findByIdAndPatient(id, patient)
      .orElseThrow(() -> new ResourceNotFoundException("Medical report not found with id: " + id));
  ```
- Any attempt by Patient A to access, view, download, update parameters of, or delete Patient B's report results in `404 Not Found` without disclosing record existence or metadata.

### 1.3 Role Isolation & Separation of Duties
- **Patient**: Can manage their own profile, medical history, upload/verify/delete their own medical documents.
- **Doctor**: Unrestricted patient report browsing is explicitly blocked on patient-scoped endpoints. Doctor report access will be guarded by future Doctor-Patient Connection and Consent Management modules.
- **Administrator**: Restricted to user governance, doctor credential verification, and security audit log inspection. Unrestricted medical file downloads and personal clinical data browsing are prohibited.

---

## 2. File Storage Security & Document Protection

Medical files contain sensitive Protected Health Information (PHI). The following security measures are implemented:

1. **No Public Static Hosting**: Uploaded files are never placed in public directories (e.g. `/public`, `/uploads`) or exposed through direct static web URLs.
2. **Access Via Authenticated Stream**: Document downloads and previews (`/api/v1/patient/reports/{id}/file`) are streamed through Spring MVC after verifying JWT authentication and patient ownership.
3. **Storage Key Abstraction**: Database records store an opaque UUID storage key (`storage_key`), preventing external leakage of disk layout or physical storage structures.
4. **Path Traversal Protection**: File storage resolvers normalize paths and verify that resolved target files remain strictly inside the configured application storage root (`path.normalize().startsWith(storageRoot)`).
5. **Multi-Layer File Validation**:
   - MIME type validation against permitted types (`application/pdf`, `image/png`, `image/jpeg`).
   - Magic bytes header verification (`%PDF-`, `\x89PNG`, `\xFF\xD8\xFF`).
   - Strict file size limit enforcement (max 25MB).
   - Unsafe executable file extensions (`.exe`, `.sh`, `.bat`, `.js`, etc.) are unconditionally rejected.

---

## 3. Audit Trail & Compliance Logging

All interactions with medications, doses, reminders, vitals, medical reports and clinical parameters emit structured audit log records:
- `MEDICATION_CREATED` / `MEDICATION_VIEWED` / `MEDICATION_UPDATED` / `MEDICATION_PAUSED` / `MEDICATION_RESUMED` / `MEDICATION_STOPPED` / `MEDICATION_COMPLETED` / `MEDICATION_DELETED`
- `MEDICATION_DOSE_TAKEN` / `MEDICATION_DOSE_SKIPPED` / `MEDICATION_DOSE_MISSED`
- `MEDICATION_REMINDER_CREATED` / `MEDICATION_REMINDER_READ`
- `VITAL_CREATED` / `VITAL_UPDATED` / `VITAL_DELETED` / `VITAL_VIEWED`
- `HEALTH_ALERT_GENERATED` / `HEALTH_ALERT_READ` / `HEALTH_ALERT_ACKNOWLEDGED`
- `MEDICAL_REPORT_UPLOADED`
- `MEDICAL_REPORT_VIEWED`
- `MEDICAL_REPORT_DOWNLOADED`
- `MEDICAL_REPORT_PROCESSED`
- `MEDICAL_REPORT_VERIFIED`
- `MEDICAL_REPORT_DELETED`
- `MEDICAL_REPORT_PARAMETER_UPDATED`
- `PATIENT_PROFILE_CREATED` / `PATIENT_PROFILE_UPDATED`
- `ALLERGY_CREATED` / `ALLERGY_UPDATED` / `ALLERGY_DELETED`
- `CONDITION_CREATED` / `CONDITION_UPDATED` / `CONDITION_DELETED`

### Privacy & Redaction Rules
- Passwords, JWT tokens, and cryptographic secrets are never written to audit logs.
- Sensitive individual health values are not flooded into plain audit logs without necessity.
- Actual binary file contents and full raw OCR text dumps are excluded from audit logs.
- Audit logs capture: `userId`, `action`, `resourceName`, `resourceId`, `clientIp`, `status`, and `timestamp`.

---

## 4. Vitals & Clinical Alerts Security (Phase 5)

- **Strict Zero-Trust Ownership**: All vitals (`HealthMeasurement`) and alerts (`HealthAlert`) queries enforce `patient_id` matches from the authenticated SecurityContext.
- **IDOR Protection**: Requests targeting unowned vital or alert IDs return `404 Not Found`.
- **JWT Hygiene**: No health vitals, physiological metrics, or clinical alerts are stored in JWT claims.
- **Doctor & Admin Isolation**: Doctor and Admin roles attempting to call patient-scoped vital endpoints receive `403 Forbidden`.

---

## 5. Clinical Safety & Non-Autonomous Medical Diagnosis Declaration

- **No Autonomous Clinical Diagnoses**: Health Buddy does not make clinical diagnoses or therapeutic decisions based on vitals readings or extracted lab values.
- **Informational Alerts Only**: Safety alerts generated by the rule engine provide informational caution and encourage professional clinical consultation.
- **Patient Verification Checkpoint**: All OCR and heuristic parameter extractions require patient verification (`NOT_VERIFIED` -> `PATIENT_VERIFIED`).
- **AI Health Assistant Boundaries**: AI capabilities are restricted to explanatory summarization and patient comprehension assistance with explicit medical advice disclaimers.

