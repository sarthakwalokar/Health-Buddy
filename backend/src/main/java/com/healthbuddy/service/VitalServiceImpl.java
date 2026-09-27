package com.healthbuddy.service;

import com.healthbuddy.dto.request.CreateVitalRequest;
import com.healthbuddy.dto.request.UpdateVitalRequest;
import com.healthbuddy.dto.response.HealthAlertResponse;
import com.healthbuddy.dto.response.VitalDashboardSummaryResponse;
import com.healthbuddy.dto.response.VitalResponse;
import com.healthbuddy.dto.response.VitalTrendResponse;
import com.healthbuddy.entity.*;
import com.healthbuddy.exception.AppException;
import com.healthbuddy.exception.ResourceNotFoundException;
import com.healthbuddy.mapper.VitalMapper;
import com.healthbuddy.repository.HealthAlertRepository;
import com.healthbuddy.repository.HealthMeasurementRepository;
import com.healthbuddy.repository.MedicalReportRepository;
import com.healthbuddy.repository.PatientProfileRepository;
import com.healthbuddy.repository.UserRepository;
import com.healthbuddy.rules.HealthRuleEngine;
import com.healthbuddy.rules.HealthRuleResult;
import com.healthbuddy.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VitalServiceImpl implements VitalService {

    private final HealthMeasurementRepository measurementRepository;
    private final HealthAlertRepository alertRepository;
    private final MedicalReportRepository medicalReportRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;
    private final HealthTrendService healthTrendService;
    private final HealthRuleEngine healthRuleEngine;
    private final VitalMapper vitalMapper;
    private final AuditLogService auditLogService;

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

    @Override
    @Transactional
    public VitalResponse recordVital(CreateVitalRequest request) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        UUID userId = patient.getUser().getId();
        String userEmail = patient.getUser().getEmail();

        validateVitalPayload(request.getMeasurementType(), request.getEffectiveValueNumeric(),
                request.getEffectiveSecondaryValueNumeric(), request.getMeasurementTime());

        MedicalReport sourceReport = null;
        MeasurementSource source = MeasurementSource.MANUAL;
        if (request.getSourceReportId() != null) {
            sourceReport = medicalReportRepository.findByIdAndPatient(request.getSourceReportId(), patient)
                    .orElseThrow(() -> new ResourceNotFoundException("MedicalReport", "id", request.getSourceReportId()));
            source = MeasurementSource.MEDICAL_REPORT;
        }

        HealthMeasurement measurement = vitalMapper.toEntity(request, patient, sourceReport, source);
        HealthMeasurement savedMeasurement = measurementRepository.save(measurement);

        // Auto-calculate BMI if Weight is recorded and PatientProfile has heightCm
        if (request.getMeasurementType() == MeasurementType.WEIGHT && patient.getHeightCm() != null && patient.getHeightCm().doubleValue() > 0) {
            calculateAndPersistBmi(patient, savedMeasurement.getValueNumeric(), savedMeasurement.getMeasurementTime());
        }

        // Run Rule Engine on the new measurement and recent history
        List<HealthMeasurement> recentHistory = measurementRepository
                .findTop10ByPatientAndMeasurementTypeOrderByMeasurementTimeDesc(patient, request.getMeasurementType());
        List<HealthRuleResult> triggeredRules = healthRuleEngine.evaluate(savedMeasurement, recentHistory);

        for (HealthRuleResult ruleResult : triggeredRules) {
            HealthAlert alert = HealthAlert.builder()
                    .patient(patient)
                    .measurement(savedMeasurement)
                    .alertType(ruleResult.getAlertType())
                    .severity(ruleResult.getSeverity())
                    .title(ruleResult.getTitle())
                    .message(ruleResult.getMessage())
                    .status(AlertStatus.UNREAD)
                    .build();
            alertRepository.save(alert);

            auditLogService.logEvent(
                    userId, userEmail, "HEALTH_ALERT_GENERATED",
                    "/api/v1/patient/alerts", "SUCCESS",
                    "LOCAL", "WEB", "Health alert generated: " + ruleResult.getTitle() + " (Severity: " + ruleResult.getSeverity() + ")"
            );
        }

        auditLogService.logEvent(
                userId, userEmail, "VITAL_CREATED",
                "/api/v1/patient/vitals/" + savedMeasurement.getId(), "SUCCESS",
                "LOCAL", "WEB", "Vital recorded: " + savedMeasurement.getMeasurementType() + " = " + savedMeasurement.getValueNumeric()
        );

        return vitalMapper.toVitalResponse(savedMeasurement);
    }

    @Override
    @Transactional
    public VitalResponse updateVital(UUID id, UpdateVitalRequest request) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        UUID userId = patient.getUser().getId();
        String userEmail = patient.getUser().getEmail();

        HealthMeasurement measurement = measurementRepository.findByIdAndPatient(id, patient)
                .orElseThrow(() -> new ResourceNotFoundException("HealthMeasurement", "id", id));

        BigDecimal effectiveValue = request.getEffectiveValueNumeric() != null ? request.getEffectiveValueNumeric() : measurement.getValueNumeric();
        BigDecimal effectiveSecValue = request.getEffectiveSecondaryValueNumeric() != null ? request.getEffectiveSecondaryValueNumeric() : measurement.getSecondaryValueNumeric();
        Instant effectiveTime = request.getMeasurementTime() != null ? request.getMeasurementTime() : measurement.getMeasurementTime();

        validateVitalPayload(measurement.getMeasurementType(), effectiveValue, effectiveSecValue, effectiveTime);

        if (request.getEffectiveValueNumeric() != null) {
            measurement.setValueNumeric(request.getEffectiveValueNumeric());
        }
        if (request.getEffectiveSecondaryValueNumeric() != null) {
            measurement.setSecondaryValueNumeric(request.getEffectiveSecondaryValueNumeric());
        }
        if (request.getUnit() != null && !request.getUnit().isBlank()) {
            measurement.setUnit(request.getUnit().trim());
        }
        if (request.getMeasurementTime() != null) {
            measurement.setMeasurementTime(request.getMeasurementTime());
        }
        if (request.getMeasurementContext() != null) {
            measurement.setMeasurementContext(request.getMeasurementContext());
        }
        if (request.getNotes() != null) {
            measurement.setNotes(request.getNotes());
        }

        HealthMeasurement updated = measurementRepository.save(measurement);

        // Re-calculate BMI if weight was updated
        if (updated.getMeasurementType() == MeasurementType.WEIGHT && patient.getHeightCm() != null && patient.getHeightCm().doubleValue() > 0) {
            calculateAndPersistBmi(patient, updated.getValueNumeric(), updated.getMeasurementTime());
        }

        // Re-evaluate rules
        List<HealthMeasurement> recentHistory = measurementRepository
                .findTop10ByPatientAndMeasurementTypeOrderByMeasurementTimeDesc(patient, updated.getMeasurementType());
        List<HealthRuleResult> triggeredRules = healthRuleEngine.evaluate(updated, recentHistory);
        for (HealthRuleResult ruleResult : triggeredRules) {
            HealthAlert alert = HealthAlert.builder()
                    .patient(patient)
                    .measurement(updated)
                    .alertType(ruleResult.getAlertType())
                    .severity(ruleResult.getSeverity())
                    .title(ruleResult.getTitle())
                    .message(ruleResult.getMessage())
                    .status(AlertStatus.UNREAD)
                    .build();
            alertRepository.save(alert);
        }

        auditLogService.logEvent(
                userId, userEmail, "VITAL_UPDATED",
                "/api/v1/patient/vitals/" + id, "SUCCESS",
                "LOCAL", "WEB", "Vital updated: " + updated.getMeasurementType()
        );

        return vitalMapper.toVitalResponse(updated);
    }

    @Override
    @Transactional
    public void deleteVital(UUID id) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        UUID userId = patient.getUser().getId();
        String userEmail = patient.getUser().getEmail();

        HealthMeasurement measurement = measurementRepository.findByIdAndPatient(id, patient)
                .orElseThrow(() -> new ResourceNotFoundException("HealthMeasurement", "id", id));

        measurementRepository.delete(measurement);

        auditLogService.logEvent(
                userId, userEmail, "VITAL_DELETED",
                "/api/v1/patient/vitals/" + id, "SUCCESS",
                "LOCAL", "WEB", "Vital deleted: " + measurement.getMeasurementType()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public VitalResponse getVitalById(UUID id) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        HealthMeasurement measurement = measurementRepository.findByIdAndPatient(id, patient)
                .orElseThrow(() -> new ResourceNotFoundException("HealthMeasurement", "id", id));

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "VITAL_VIEWED",
                "/api/v1/patient/vitals/" + id, "SUCCESS",
                "LOCAL", "WEB", "Vital viewed: " + measurement.getMeasurementType()
        );

        return vitalMapper.toVitalResponse(measurement);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VitalResponse> getVitals(MeasurementType type, Instant from, Instant to, Pageable pageable) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        return measurementRepository.searchMeasurements(patient, type, from, to, pageable)
                .map(vitalMapper::toVitalResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public VitalTrendResponse getVitalTrends(MeasurementType type, String period, Instant customStart, Instant customEnd) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        return healthTrendService.calculateTrend(patient, type, period, customStart, customEnd);
    }

    @Override
    @Transactional(readOnly = true)
    public VitalDashboardSummaryResponse getDashboardSummary() {
        PatientProfile patient = getAuthenticatedPatientProfile();
        return healthTrendService.getDashboardSummary(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HealthAlertResponse> getAlerts(AlertStatus status, Pageable pageable) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        if (status != null) {
            return alertRepository.findByPatientAndStatusOrderByCreatedAtDesc(patient, status, pageable)
                    .map(vitalMapper::toAlertResponse);
        }
        return alertRepository.findByPatientOrderByCreatedAtDesc(patient, pageable)
                .map(vitalMapper::toAlertResponse);
    }

    @Override
    @Transactional
    public HealthAlertResponse acknowledgeAlert(UUID alertId) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        HealthAlert alert = alertRepository.findByIdAndPatient(alertId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("HealthAlert", "id", alertId));

        alert.setStatus(AlertStatus.ACKNOWLEDGED);
        alert.setAcknowledgedAt(Instant.now());
        HealthAlert saved = alertRepository.save(alert);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "HEALTH_ALERT_ACKNOWLEDGED",
                "/api/v1/patient/alerts/" + alertId + "/acknowledge", "SUCCESS",
                "LOCAL", "WEB", "Health alert acknowledged: " + alert.getTitle()
        );

        return vitalMapper.toAlertResponse(saved);
    }

    @Override
    @Transactional
    public HealthAlertResponse markAlertRead(UUID alertId) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        HealthAlert alert = alertRepository.findByIdAndPatient(alertId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("HealthAlert", "id", alertId));

        if (alert.getStatus() == AlertStatus.UNREAD) {
            alert.setStatus(AlertStatus.READ);
            alert = alertRepository.save(alert);
        }

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "HEALTH_ALERT_READ",
                "/api/v1/patient/alerts/" + alertId + "/read", "SUCCESS",
                "LOCAL", "WEB", "Health alert marked as read"
        );

        return vitalMapper.toAlertResponse(alert);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadAlertCount() {
        PatientProfile patient = getAuthenticatedPatientProfile();
        return alertRepository.countByPatientAndStatus(patient, AlertStatus.UNREAD);
    }

    private void calculateAndPersistBmi(PatientProfile patient, BigDecimal weightKg, Instant measurementTime) {
        try {
            double weight = weightKg.doubleValue();
            double heightMeters = patient.getHeightCm().doubleValue() / 100.0;
            if (heightMeters <= 0) return;

            double bmiVal = weight / (heightMeters * heightMeters);
            BigDecimal bmi = BigDecimal.valueOf(bmiVal).setScale(1, RoundingMode.HALF_UP);

            HealthMeasurement bmiMeasurement = HealthMeasurement.builder()
                    .patient(patient)
                    .measurementType(MeasurementType.BMI)
                    .valueNumeric(bmi)
                    .unit("kg/m²")
                    .measurementTime(measurementTime != null ? measurementTime : Instant.now())
                    .source(MeasurementSource.SYSTEM_CALCULATED)
                    .notes(String.format("Calculated from Weight (%.1f kg) and Profile Height (%.1f cm)", weight, patient.getHeightCm().doubleValue()))
                    .build();

            measurementRepository.save(bmiMeasurement);
        } catch (Exception e) {
            log.warn("Failed to auto-calculate BMI for patient {}: {}", patient.getId(), e.getMessage());
        }
    }

    private void validateVitalPayload(MeasurementType type, BigDecimal val, BigDecimal secVal, Instant time) {
        if (val == null) {
            throw new AppException("Primary measurement value is required", HttpStatus.BAD_REQUEST);
        }

        if (time != null) {
            Instant fiveMinutesInFuture = Instant.now().plus(5, ChronoUnit.MINUTES);
            if (time.isAfter(fiveMinutesInFuture)) {
                throw new AppException("Measurement timestamp cannot be in the future", HttpStatus.BAD_REQUEST);
            }
        }

        double v = val.doubleValue();
        switch (type) {
            case BLOOD_PRESSURE -> {
                if (secVal == null) {
                    throw new AppException("Diastolic blood pressure value is required", HttpStatus.BAD_REQUEST);
                }
                double diastolic = secVal.doubleValue();
                if (v < 40 || v > 300) {
                    throw new AppException("Systolic blood pressure must be between 40 and 300 mmHg", HttpStatus.BAD_REQUEST);
                }
                if (diastolic < 30 || diastolic > 200) {
                    throw new AppException("Diastolic blood pressure must be between 30 and 200 mmHg", HttpStatus.BAD_REQUEST);
                }
            }
            case HEART_RATE -> {
                if (v < 20 || v > 300) {
                    throw new AppException("Heart rate must be between 20 and 300 bpm", HttpStatus.BAD_REQUEST);
                }
            }
            case BLOOD_GLUCOSE -> {
                if (v < 10 || v > 1500) {
                    throw new AppException("Blood glucose must be between 10 and 1500 mg/dL", HttpStatus.BAD_REQUEST);
                }
            }
            case TEMPERATURE -> {
                if (v < 25.0 || v > 45.0) {
                    throw new AppException("Body temperature must be between 25.0 and 45.0 °C", HttpStatus.BAD_REQUEST);
                }
            }
            case SPO2 -> {
                if (v < 1.0 || v > 100.0) {
                    throw new AppException("SpO2 oxygen saturation percentage must be between 1% and 100%", HttpStatus.BAD_REQUEST);
                }
            }
            case WEIGHT -> {
                if (v < 0.5 || v > 600.0) {
                    throw new AppException("Weight must be between 0.5 and 600.0 kg", HttpStatus.BAD_REQUEST);
                }
            }
            case HEIGHT -> {
                if (v < 20.0 || v > 300.0) {
                    throw new AppException("Height must be between 20.0 and 300.0 cm", HttpStatus.BAD_REQUEST);
                }
            }
            case BMI -> {
                if (v < 5.0 || v > 150.0) {
                    throw new AppException("BMI must be between 5.0 and 150.0", HttpStatus.BAD_REQUEST);
                }
            }
        }
    }
}
