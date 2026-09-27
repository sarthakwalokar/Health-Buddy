package com.healthbuddy.service;

import com.healthbuddy.dto.request.*;
import com.healthbuddy.dto.response.*;
import com.healthbuddy.entity.*;
import com.healthbuddy.exception.ResourceNotFoundException;
import com.healthbuddy.mapper.*;
import com.healthbuddy.repository.*;
import com.healthbuddy.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;
    private final PatientAllergyRepository allergyRepository;
    private final PatientConditionRepository conditionRepository;
    private final PatientSurgeryRepository surgeryRepository;
    private final PatientFamilyHistoryRepository familyHistoryRepository;
    private final PatientLifestyleRepository lifestyleRepository;
    private final PatientHealthGoalRepository healthGoalRepository;
    private final MedicalReportRepository medicalReportRepository;
    private final HealthMeasurementRepository healthMeasurementRepository;
    private final HealthAlertRepository healthAlertRepository;
    private final MedicationRepository medicationRepository;
    private final MedicationDoseRepository medicationDoseRepository;

    private final PatientProfileMapper patientProfileMapper;
    private final PatientAllergyMapper allergyMapper;
    private final PatientConditionMapper conditionMapper;
    private final PatientSurgeryMapper surgeryMapper;
    private final PatientFamilyHistoryMapper familyHistoryMapper;
    private final PatientLifestyleMapper lifestyleMapper;
    private final PatientHealthGoalMapper healthGoalMapper;

    private final AuditLogService auditLogService;

    // Helper: Authenticated Patient Profile Entity Scoped Resolution
    private PatientProfile getAuthenticatedPatientProfile() {
        UUID userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return patientProfileRepository.findByUser(user)
                .orElseGet(() -> {
                    PatientProfile newProfile = PatientProfile.builder().user(user).build();
                    return patientProfileRepository.save(newProfile);
                });
    }

    // ==========================================
    // 1. PATIENT PROFILE
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public PatientProfileResponse getMyProfile() {
        PatientProfile profile = getAuthenticatedPatientProfile();
        return patientProfileMapper.toPatientProfileResponse(profile);
    }

    @Override
    @Transactional
    public PatientProfileResponse updateMyProfile(UpdatePatientProfileRequest updateRequest) {
        PatientProfile profile = getAuthenticatedPatientProfile();
        UUID userId = profile.getUser().getId();
        String userEmail = profile.getUser().getEmail();

        if (updateRequest.getDateOfBirth() != null) profile.setDateOfBirth(updateRequest.getDateOfBirth());
        if (updateRequest.getGender() != null) profile.setGender(updateRequest.getGender());
        if (updateRequest.getBloodGroup() != null) profile.setBloodGroup(updateRequest.getBloodGroup());
        if (updateRequest.getHeightCm() != null) profile.setHeightCm(updateRequest.getHeightCm());
        if (updateRequest.getWeightKg() != null) profile.setWeightKg(updateRequest.getWeightKg());
        if (updateRequest.getOccupation() != null) profile.setOccupation(updateRequest.getOccupation());
        if (updateRequest.getMaritalStatus() != null) profile.setMaritalStatus(updateRequest.getMaritalStatus());
        if (updateRequest.getProfilePhotoUrl() != null) profile.setProfilePhotoUrl(updateRequest.getProfilePhotoUrl());
        if (updateRequest.getEmergencyContactName() != null) profile.setEmergencyContactName(updateRequest.getEmergencyContactName());
        if (updateRequest.getEmergencyContactPhone() != null) profile.setEmergencyContactPhone(updateRequest.getEmergencyContactPhone());
        if (updateRequest.getEmergencyContactRelationship() != null) profile.setEmergencyContactRelationship(updateRequest.getEmergencyContactRelationship());
        if (updateRequest.getAddressLine() != null) profile.setAddressLine(updateRequest.getAddressLine());
        if (updateRequest.getCity() != null) profile.setCity(updateRequest.getCity());
        if (updateRequest.getState() != null) profile.setState(updateRequest.getState());
        if (updateRequest.getPostalCode() != null) profile.setPostalCode(updateRequest.getPostalCode());
        if (updateRequest.getCountry() != null) profile.setCountry(updateRequest.getCountry());

        PatientProfile saved = patientProfileRepository.save(profile);

        auditLogService.logEvent(
                userId, userEmail, "PATIENT_PROFILE_UPDATED",
                "/api/v1/patient/profile", "SUCCESS",
                "LOCAL", "WEB", "Patient profile details updated"
        );

        return patientProfileMapper.toPatientProfileResponse(saved);
    }

    // ==========================================
    // 2. ALLERGIES
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<AllergyResponse> getAllergies() {
        PatientProfile patient = getAuthenticatedPatientProfile();
        return allergyRepository.findByPatientOrderByCreatedAtDesc(patient)
                .stream()
                .map(allergyMapper::toAllergyResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AllergyResponse createAllergy(CreateAllergyRequest request) {
        PatientProfile patient = getAuthenticatedPatientProfile();

        PatientAllergy allergy = PatientAllergy.builder()
                .patient(patient)
                .allergen(request.getAllergen().trim())
                .reaction(request.getReaction())
                .severity(request.getSeverity() != null ? request.getSeverity() : AllergySeverity.UNKNOWN)
                .status(request.getStatus() != null ? request.getStatus() : AllergyStatus.ACTIVE)
                .notes(request.getNotes())
                .build();

        PatientAllergy saved = allergyRepository.save(allergy);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "ALLERGY_CREATED",
                "/api/v1/patient/allergies/" + saved.getId(), "SUCCESS",
                "LOCAL", "WEB", "Allergy created: " + saved.getAllergen()
        );

        return allergyMapper.toAllergyResponse(saved);
    }

    @Override
    @Transactional
    public AllergyResponse updateAllergy(UUID allergyId, UpdateAllergyRequest request) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        PatientAllergy allergy = allergyRepository.findByIdAndPatient(allergyId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("Allergy", "id", allergyId));

        if (request.getAllergen() != null && !request.getAllergen().isBlank()) {
            allergy.setAllergen(request.getAllergen().trim());
        }
        if (request.getReaction() != null) allergy.setReaction(request.getReaction());
        if (request.getSeverity() != null) allergy.setSeverity(request.getSeverity());
        if (request.getStatus() != null) allergy.setStatus(request.getStatus());
        if (request.getNotes() != null) allergy.setNotes(request.getNotes());

        PatientAllergy updated = allergyRepository.save(allergy);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "ALLERGY_UPDATED",
                "/api/v1/patient/allergies/" + updated.getId(), "SUCCESS",
                "LOCAL", "WEB", "Allergy updated: " + updated.getAllergen()
        );

        return allergyMapper.toAllergyResponse(updated);
    }

    @Override
    @Transactional
    public void deleteAllergy(UUID allergyId) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        PatientAllergy allergy = allergyRepository.findByIdAndPatient(allergyId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("Allergy", "id", allergyId));

        allergyRepository.delete(allergy);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "ALLERGY_DELETED",
                "/api/v1/patient/allergies/" + allergyId, "SUCCESS",
                "LOCAL", "WEB", "Allergy record deleted"
        );
    }

    // ==========================================
    // 3. CHRONIC CONDITIONS
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<ConditionResponse> getConditions() {
        PatientProfile patient = getAuthenticatedPatientProfile();
        return conditionRepository.findByPatientOrderByDiagnosedDateDesc(patient)
                .stream()
                .map(conditionMapper::toConditionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ConditionResponse createCondition(CreateConditionRequest request) {
        PatientProfile patient = getAuthenticatedPatientProfile();

        PatientCondition condition = PatientCondition.builder()
                .patient(patient)
                .conditionName(request.getConditionName().trim())
                .diagnosedDate(request.getDiagnosedDate())
                .status(request.getStatus() != null ? request.getStatus() : ConditionStatus.ACTIVE)
                .source(request.getSource() != null ? request.getSource() : ConditionSource.PATIENT_REPORTED)
                .notes(request.getNotes())
                .build();

        PatientCondition saved = conditionRepository.save(condition);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "CONDITION_CREATED",
                "/api/v1/patient/conditions/" + saved.getId(), "SUCCESS",
                "LOCAL", "WEB", "Condition recorded: " + saved.getConditionName()
        );

        return conditionMapper.toConditionResponse(saved);
    }

    @Override
    @Transactional
    public ConditionResponse updateCondition(UUID conditionId, UpdateConditionRequest request) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        PatientCondition condition = conditionRepository.findByIdAndPatient(conditionId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("Condition", "id", conditionId));

        if (request.getConditionName() != null && !request.getConditionName().isBlank()) {
            condition.setConditionName(request.getConditionName().trim());
        }
        if (request.getDiagnosedDate() != null) condition.setDiagnosedDate(request.getDiagnosedDate());
        if (request.getStatus() != null) condition.setStatus(request.getStatus());
        if (request.getSource() != null) condition.setSource(request.getSource());
        if (request.getNotes() != null) condition.setNotes(request.getNotes());

        PatientCondition updated = conditionRepository.save(condition);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "CONDITION_UPDATED",
                "/api/v1/patient/conditions/" + updated.getId(), "SUCCESS",
                "LOCAL", "WEB", "Condition updated: " + updated.getConditionName()
        );

        return conditionMapper.toConditionResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCondition(UUID conditionId) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        PatientCondition condition = conditionRepository.findByIdAndPatient(conditionId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("Condition", "id", conditionId));

        conditionRepository.delete(condition);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "CONDITION_DELETED",
                "/api/v1/patient/conditions/" + conditionId, "SUCCESS",
                "LOCAL", "WEB", "Condition deleted: " + condition.getConditionName()
        );
    }

    // ==========================================
    // 4. SURGICAL HISTORY
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<SurgeryResponse> getSurgeries() {
        PatientProfile patient = getAuthenticatedPatientProfile();
        return surgeryRepository.findByPatientOrderByDateOfSurgeryDesc(patient)
                .stream()
                .map(surgeryMapper::toSurgeryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SurgeryResponse createSurgery(CreateSurgeryRequest request) {
        PatientProfile patient = getAuthenticatedPatientProfile();

        PatientSurgery surgery = PatientSurgery.builder()
                .patient(patient)
                .procedureName(request.getProcedureName().trim())
                .dateOfSurgery(request.getDateOfSurgery())
                .hospitalName(request.getHospitalName())
                .notes(request.getNotes())
                .build();

        PatientSurgery saved = surgeryRepository.save(surgery);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "SURGERY_CREATED",
                "/api/v1/patient/surgeries/" + saved.getId(), "SUCCESS",
                "LOCAL", "WEB", "Surgery recorded: " + saved.getProcedureName()
        );

        return surgeryMapper.toSurgeryResponse(saved);
    }

    @Override
    @Transactional
    public SurgeryResponse updateSurgery(UUID surgeryId, UpdateSurgeryRequest request) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        PatientSurgery surgery = surgeryRepository.findByIdAndPatient(surgeryId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("Surgery", "id", surgeryId));

        if (request.getProcedureName() != null && !request.getProcedureName().isBlank()) {
            surgery.setProcedureName(request.getProcedureName().trim());
        }
        if (request.getDateOfSurgery() != null) surgery.setDateOfSurgery(request.getDateOfSurgery());
        if (request.getHospitalName() != null) surgery.setHospitalName(request.getHospitalName());
        if (request.getNotes() != null) surgery.setNotes(request.getNotes());

        PatientSurgery updated = surgeryRepository.save(surgery);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "SURGERY_UPDATED",
                "/api/v1/patient/surgeries/" + updated.getId(), "SUCCESS",
                "LOCAL", "WEB", "Surgery updated: " + updated.getProcedureName()
        );

        return surgeryMapper.toSurgeryResponse(updated);
    }

    @Override
    @Transactional
    public void deleteSurgery(UUID surgeryId) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        PatientSurgery surgery = surgeryRepository.findByIdAndPatient(surgeryId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("Surgery", "id", surgeryId));

        surgeryRepository.delete(surgery);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "SURGERY_DELETED",
                "/api/v1/patient/surgeries/" + surgeryId, "SUCCESS",
                "LOCAL", "WEB", "Surgery record deleted"
        );
    }

    // ==========================================
    // 5. FAMILY MEDICAL HISTORY
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<FamilyHistoryResponse> getFamilyHistories() {
        PatientProfile patient = getAuthenticatedPatientProfile();
        return familyHistoryRepository.findByPatientOrderByCreatedAtDesc(patient)
                .stream()
                .map(familyHistoryMapper::toFamilyHistoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FamilyHistoryResponse createFamilyHistory(CreateFamilyHistoryRequest request) {
        PatientProfile patient = getAuthenticatedPatientProfile();

        PatientFamilyHistory history = PatientFamilyHistory.builder()
                .patient(patient)
                .relationship(request.getRelationship())
                .condition(request.getCondition().trim())
                .ageOfOnset(request.getAgeOfOnset())
                .notes(request.getNotes())
                .build();

        PatientFamilyHistory saved = familyHistoryRepository.save(history);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "FAMILY_HISTORY_CREATED",
                "/api/v1/patient/family-history/" + saved.getId(), "SUCCESS",
                "LOCAL", "WEB", "Family history added: " + saved.getRelationship() + " - " + saved.getCondition()
        );

        return familyHistoryMapper.toFamilyHistoryResponse(saved);
    }

    @Override
    @Transactional
    public FamilyHistoryResponse updateFamilyHistory(UUID historyId, UpdateFamilyHistoryRequest request) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        PatientFamilyHistory history = familyHistoryRepository.findByIdAndPatient(historyId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("FamilyHistory", "id", historyId));

        if (request.getRelationship() != null) history.setRelationship(request.getRelationship());
        if (request.getCondition() != null && !request.getCondition().isBlank()) {
            history.setCondition(request.getCondition().trim());
        }
        if (request.getAgeOfOnset() != null) history.setAgeOfOnset(request.getAgeOfOnset());
        if (request.getNotes() != null) history.setNotes(request.getNotes());

        PatientFamilyHistory updated = familyHistoryRepository.save(history);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "FAMILY_HISTORY_UPDATED",
                "/api/v1/patient/family-history/" + updated.getId(), "SUCCESS",
                "LOCAL", "WEB", "Family history updated: " + updated.getCondition()
        );

        return familyHistoryMapper.toFamilyHistoryResponse(updated);
    }

    @Override
    @Transactional
    public void deleteFamilyHistory(UUID historyId) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        PatientFamilyHistory history = familyHistoryRepository.findByIdAndPatient(historyId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("FamilyHistory", "id", historyId));

        familyHistoryRepository.delete(history);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "FAMILY_HISTORY_DELETED",
                "/api/v1/patient/family-history/" + historyId, "SUCCESS",
                "LOCAL", "WEB", "Family history record deleted"
        );
    }

    // ==========================================
    // 6. LIFESTYLE INFORMATION
    // ==========================================

    @Override
    @Transactional
    public LifestyleResponse getLifestyle() {
        PatientProfile patient = getAuthenticatedPatientProfile();
        PatientLifestyle lifestyle = lifestyleRepository.findByPatient(patient)
                .orElseGet(() -> {
                    PatientLifestyle newLifestyle = PatientLifestyle.builder().patient(patient).build();
                    return lifestyleRepository.save(newLifestyle);
                });

        return lifestyleMapper.toLifestyleResponse(lifestyle);
    }

    @Override
    @Transactional
    public LifestyleResponse updateLifestyle(UpdateLifestyleRequest request) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        PatientLifestyle lifestyle = lifestyleRepository.findByPatient(patient)
                .orElseGet(() -> PatientLifestyle.builder().patient(patient).build());

        if (request.getSmokingStatus() != null) lifestyle.setSmokingStatus(request.getSmokingStatus());
        if (request.getAlcoholStatus() != null) lifestyle.setAlcoholStatus(request.getAlcoholStatus());
        if (request.getActivityLevel() != null) lifestyle.setActivityLevel(request.getActivityLevel());
        if (request.getDietaryPreference() != null) lifestyle.setDietaryPreference(request.getDietaryPreference());
        if (request.getSleepHours() != null) lifestyle.setSleepHours(request.getSleepHours());
        if (request.getWaterIntakeLiters() != null) lifestyle.setWaterIntakeLiters(request.getWaterIntakeLiters());
        if (request.getOccupationType() != null) lifestyle.setOccupationType(request.getOccupationType());
        if (request.getNotes() != null) lifestyle.setNotes(request.getNotes());

        PatientLifestyle saved = lifestyleRepository.save(lifestyle);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "LIFESTYLE_UPDATED",
                "/api/v1/patient/lifestyle", "SUCCESS",
                "LOCAL", "WEB", "Patient lifestyle profile updated"
        );

        return lifestyleMapper.toLifestyleResponse(saved);
    }

    // ==========================================
    // 7. HEALTH GOALS
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<HealthGoalResponse> getHealthGoals() {
        PatientProfile patient = getAuthenticatedPatientProfile();
        return healthGoalRepository.findByPatientOrderByCreatedAtDesc(patient)
                .stream()
                .map(healthGoalMapper::toHealthGoalResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HealthGoalResponse createHealthGoal(CreateHealthGoalRequest request) {
        PatientProfile patient = getAuthenticatedPatientProfile();

        PatientHealthGoal goal = PatientHealthGoal.builder()
                .patient(patient)
                .goalType(request.getGoalType())
                .description(request.getDescription().trim())
                .targetValue(request.getTargetValue())
                .targetUnit(request.getTargetUnit())
                .targetDate(request.getTargetDate())
                .status(request.getStatus() != null ? request.getStatus() : HealthGoalStatus.ACTIVE)
                .build();

        PatientHealthGoal saved = healthGoalRepository.save(goal);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "HEALTH_GOAL_CREATED",
                "/api/v1/patient/health-goals/" + saved.getId(), "SUCCESS",
                "LOCAL", "WEB", "Health goal created: " + saved.getGoalType()
        );

        return healthGoalMapper.toHealthGoalResponse(saved);
    }

    @Override
    @Transactional
    public HealthGoalResponse updateHealthGoal(UUID goalId, UpdateHealthGoalRequest request) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        PatientHealthGoal goal = healthGoalRepository.findByIdAndPatient(goalId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("HealthGoal", "id", goalId));

        if (request.getGoalType() != null) goal.setGoalType(request.getGoalType());
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            goal.setDescription(request.getDescription().trim());
        }
        if (request.getTargetValue() != null) goal.setTargetValue(request.getTargetValue());
        if (request.getTargetUnit() != null) goal.setTargetUnit(request.getTargetUnit());
        if (request.getTargetDate() != null) goal.setTargetDate(request.getTargetDate());
        if (request.getStatus() != null) goal.setStatus(request.getStatus());

        PatientHealthGoal updated = healthGoalRepository.save(goal);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "HEALTH_GOAL_UPDATED",
                "/api/v1/patient/health-goals/" + updated.getId(), "SUCCESS",
                "LOCAL", "WEB", "Health goal updated: " + updated.getGoalType()
        );

        return healthGoalMapper.toHealthGoalResponse(updated);
    }

    @Override
    @Transactional
    public void deleteHealthGoal(UUID goalId) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        PatientHealthGoal goal = healthGoalRepository.findByIdAndPatient(goalId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("HealthGoal", "id", goalId));

        healthGoalRepository.delete(goal);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "HEALTH_GOAL_DELETED",
                "/api/v1/patient/health-goals/" + goalId, "SUCCESS",
                "LOCAL", "WEB", "Health goal deleted"
        );
    }

    // ==========================================
    // 8. HEALTH TIMELINE FOUNDATION
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<TimelineEventResponse> getTimelineEvents() {
        PatientProfile patient = getAuthenticatedPatientProfile();
        List<TimelineEventResponse> events = new ArrayList<>();

        // Profile Created event
        if (patient.getCreatedAt() != null) {
            events.add(TimelineEventResponse.builder()
                    .id(UUID.randomUUID())
                    .eventType("PROFILE_INITIALIZED")
                    .title("Health Buddy Account Initialized")
                    .description("Patient health vault created on the platform")
                    .category("ADMINISTRATIVE")
                    .sourceLabel("System generated")
                    .eventDate(patient.getCreatedAt())
                    .build());
        }

        // Surgeries
        for (PatientSurgery s : patient.getSurgeries()) {
            events.add(TimelineEventResponse.builder()
                    .id(s.getId())
                    .eventType("SURGERY_RECORDED")
                    .title("Surgical Procedure: " + s.getProcedureName())
                    .description(s.getHospitalName() != null ? "Hospital: " + s.getHospitalName() : "Surgical history recorded")
                    .category("CLINICAL")
                    .sourceLabel("Patient reported")
                    .eventDate(s.getDateOfSurgery() != null ? s.getDateOfSurgery().atStartOfDay().toInstant(ZoneOffset.UTC) : s.getCreatedAt())
                    .build());
        }

        // Conditions
        for (PatientCondition c : patient.getConditions()) {
            events.add(TimelineEventResponse.builder()
                    .id(c.getId())
                    .eventType("CONDITION_RECORDED")
                    .title("Chronic Condition: " + c.getConditionName())
                    .description("Status: " + c.getStatus())
                    .category("CLINICAL")
                    .sourceLabel(c.getSource() != null ? c.getSource().getDisplayLabel() : "Patient reported")
                    .eventDate(c.getDiagnosedDate() != null ? c.getDiagnosedDate().atStartOfDay().toInstant(ZoneOffset.UTC) : c.getCreatedAt())
                    .build());
        }

        // Allergies
        for (PatientAllergy a : patient.getAllergies()) {
            events.add(TimelineEventResponse.builder()
                    .id(a.getId())
                    .eventType("ALLERGY_RECORDED")
                    .title("Allergy Added: " + a.getAllergen())
                    .description("Severity: " + a.getSeverity() + (a.getReaction() != null ? " (" + a.getReaction() + ")" : ""))
                    .category("CLINICAL")
                    .sourceLabel("Patient reported")
                    .eventDate(a.getCreatedAt())
                    .build());
        }

        // Medical Reports
        List<MedicalReport> reports = medicalReportRepository.findByPatientOrderByUploadedAtDesc(patient);
        for (MedicalReport r : reports) {
            // Report Uploaded Event
            events.add(TimelineEventResponse.builder()
                    .id(UUID.randomUUID())
                    .eventType("MEDICAL_REPORT_UPLOADED")
                    .title("Medical Report Uploaded: " + r.getOriginalFileName())
                    .description("Report Type: " + (r.getReportType() != null ? r.getReportType().getDisplayLabel() : "Uncategorized"))
                    .category("DIAGNOSTIC")
                    .sourceLabel("Document Vault")
                    .eventDate(r.getUploadedAt())
                    .build());

            // Report Verified Event (if verified)
            if (r.getVerificationStatus() == VerificationStatus.PATIENT_VERIFIED && r.getVerifiedAt() != null) {
                events.add(TimelineEventResponse.builder()
                        .id(UUID.randomUUID())
                        .eventType("MEDICAL_REPORT_VERIFIED")
                        .title("Report Verified: " + r.getOriginalFileName())
                        .description("Patient verified extracted clinical parameters")
                        .category("DIAGNOSTIC")
                        .sourceLabel("Patient Verified")
                        .eventDate(r.getVerifiedAt())
                        .build());
            }
        }

        // Vitals & Health Measurements
        List<HealthMeasurement> measurements = healthMeasurementRepository.findByPatientOrderByMeasurementTimeDesc(
                patient, org.springframework.data.domain.PageRequest.of(0, 30)).getContent();
        for (HealthMeasurement m : measurements) {
            String valueDesc;
            if (m.getMeasurementType() == MeasurementType.BLOOD_PRESSURE && m.getSecondaryValueNumeric() != null) {
                valueDesc = String.format("%.0f/%.0f %s", m.getValueNumeric().doubleValue(), m.getSecondaryValueNumeric().doubleValue(), m.getUnit());
            } else {
                valueDesc = String.format("%.1f %s", m.getValueNumeric().doubleValue(), m.getUnit());
            }

            String sourceStr = switch (m.getSource()) {
                case MEDICAL_REPORT -> "Medical Report";
                case SYSTEM_CALCULATED -> "System Calculated";
                case DEVICE -> "Connected Device";
                case IMPORTED -> "Imported";
                default -> "Patient reported";
            };

            events.add(TimelineEventResponse.builder()
                    .id(m.getId())
                    .eventType("VITAL_RECORDED")
                    .title(m.getMeasurementType().name().replace('_', ' ') + ": " + valueDesc)
                    .description(m.getNotes() != null ? m.getNotes() : "Recorded measurement")
                    .category("CLINICAL")
                    .sourceLabel(sourceStr)
                    .eventDate(m.getMeasurementTime())
                    .build());
        }

        // Health Alerts (Acknowledged / Active)
        List<HealthAlert> alerts = healthAlertRepository.findTop5ByPatientAndStatusInOrderByCreatedAtDesc(
                patient, List.of(AlertStatus.UNREAD, AlertStatus.READ, AlertStatus.ACKNOWLEDGED));
        for (HealthAlert alert : alerts) {
            events.add(TimelineEventResponse.builder()
                    .id(alert.getId())
                    .eventType("HEALTH_ALERT_GENERATED")
                    .title("Health Notice: " + alert.getTitle())
                    .description("Severity: " + alert.getSeverity() + " — Status: " + alert.getStatus())
                    .category("CLINICAL")
                    .sourceLabel("Rule Engine")
                    .eventDate(alert.getCreatedAt())
                    .build());
        }

        // Medications
        List<Medication> medications = medicationRepository.findByPatientOrderByCreatedAtDesc(patient);
        for (Medication med : medications) {
            String strengthStr = med.getStrength() != null ? " (" + med.getStrength() + ")" : "";
            events.add(TimelineEventResponse.builder()
                    .id(med.getId())
                    .eventType("MEDICATION_RECORDED")
                    .title("Medication Added: " + med.getMedicineName() + strengthStr)
                    .description("Status: " + med.getStatus() + (med.getInstructions() != null ? " — " + med.getInstructions() : ""))
                    .category("MEDICATION")
                    .sourceLabel(med.getSource() != null ? med.getSource().name().replace('_', ' ') : "Patient entered")
                    .eventDate(med.getCreatedAt())
                    .build());
        }

        // Recent Medication Doses Taken or Skipped
        List<MedicationDose> recentDoses = medicationDoseRepository.findByPatientAndScheduledAtBetweenOrderByScheduledAtAsc(
                patient, java.time.Instant.now().minus(7, java.time.temporal.ChronoUnit.DAYS), java.time.Instant.now());
        for (MedicationDose d : recentDoses) {
            if (d.getStatus() == DoseStatus.TAKEN || d.getStatus() == DoseStatus.SKIPPED) {
                events.add(TimelineEventResponse.builder()
                        .id(d.getId())
                        .eventType(d.getStatus() == DoseStatus.TAKEN ? "MEDICATION_DOSE_TAKEN" : "MEDICATION_DOSE_SKIPPED")
                        .title("Dose " + d.getStatus() + ": " + d.getMedication().getMedicineName())
                        .description(d.getNotes() != null ? d.getNotes() : "Scheduled dose recorded")
                        .category("MEDICATION")
                        .sourceLabel("Patient recorded")
                        .eventDate(d.getTakenAt() != null ? d.getTakenAt() : d.getScheduledAt())
                        .build());
            }
        }

        // Sort descending by event date
        events.sort((a, b) -> b.getEventDate().compareTo(a.getEventDate()));

        return events;
    }
}
