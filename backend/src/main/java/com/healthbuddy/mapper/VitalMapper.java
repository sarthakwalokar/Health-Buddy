package com.healthbuddy.mapper;

import com.healthbuddy.dto.request.CreateVitalRequest;
import com.healthbuddy.dto.response.HealthAlertResponse;
import com.healthbuddy.dto.response.VitalResponse;
import com.healthbuddy.entity.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class VitalMapper {

    public VitalResponse toVitalResponse(HealthMeasurement entity) {
        if (entity == null) {
            return null;
        }

        BigDecimal systolic = null;
        BigDecimal diastolic = null;
        if (entity.getMeasurementType() == MeasurementType.BLOOD_PRESSURE) {
            systolic = entity.getValueNumeric();
            diastolic = entity.getSecondaryValueNumeric();
        }

        return VitalResponse.builder()
                .id(entity.getId())
                .measurementType(entity.getMeasurementType())
                .valueNumeric(entity.getValueNumeric())
                .secondaryValueNumeric(entity.getSecondaryValueNumeric())
                .systolic(systolic)
                .diastolic(diastolic)
                .formattedValue(formatValue(entity))
                .unit(entity.getUnit())
                .measurementTime(entity.getMeasurementTime())
                .source(entity.getSource())
                .measurementContext(entity.getMeasurementContext())
                .sourceReportId(entity.getSourceReport() != null ? entity.getSourceReport().getId() : null)
                .sourceReportName(entity.getSourceReport() != null ? entity.getSourceReport().getOriginalFileName() : null)
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public HealthMeasurement toEntity(CreateVitalRequest request, PatientProfile patient, MedicalReport sourceReport, MeasurementSource source) {
        if (request == null) {
            return null;
        }

        String unit = resolveDefaultUnit(request.getMeasurementType(), request.getUnit());

        return HealthMeasurement.builder()
                .patient(patient)
                .measurementType(request.getMeasurementType())
                .valueNumeric(request.getEffectiveValueNumeric())
                .secondaryValueNumeric(request.getEffectiveSecondaryValueNumeric())
                .unit(unit)
                .measurementTime(request.getMeasurementTime())
                .source(source != null ? source : MeasurementSource.MANUAL)
                .measurementContext(request.getMeasurementContext())
                .sourceReport(sourceReport)
                .notes(request.getNotes())
                .build();
    }

    public HealthAlertResponse toAlertResponse(HealthAlert alert) {
        if (alert == null) {
            return null;
        }

        return HealthAlertResponse.builder()
                .id(alert.getId())
                .measurementId(alert.getMeasurement() != null ? alert.getMeasurement().getId() : null)
                .alertType(alert.getAlertType())
                .severity(alert.getSeverity())
                .title(alert.getTitle())
                .message(alert.getMessage())
                .status(alert.getStatus())
                .acknowledgedAt(alert.getAcknowledgedAt())
                .createdAt(alert.getCreatedAt())
                .build();
    }

    public String resolveDefaultUnit(MeasurementType type, String requestedUnit) {
        if (requestedUnit != null && !requestedUnit.isBlank()) {
            return requestedUnit.trim();
        }

        return switch (type) {
            case BLOOD_PRESSURE -> "mmHg";
            case HEART_RATE -> "bpm";
            case BLOOD_GLUCOSE -> "mg/dL";
            case TEMPERATURE -> "°C";
            case SPO2 -> "%";
            case WEIGHT -> "kg";
            case HEIGHT -> "cm";
            case BMI -> "kg/m²";
        };
    }

    private String formatValue(HealthMeasurement m) {
        if (m.getValueNumeric() == null) {
            return "N/A";
        }

        return switch (m.getMeasurementType()) {
            case BLOOD_PRESSURE -> {
                if (m.getSecondaryValueNumeric() != null) {
                    yield String.format("%.0f/%.0f %s", m.getValueNumeric().doubleValue(), m.getSecondaryValueNumeric().doubleValue(), m.getUnit());
                }
                yield String.format("%.0f %s", m.getValueNumeric().doubleValue(), m.getUnit());
            }
            case HEART_RATE, SPO2 -> String.format("%.0f %s", m.getValueNumeric().doubleValue(), m.getUnit());
            case BLOOD_GLUCOSE, TEMPERATURE, WEIGHT, HEIGHT, BMI -> String.format("%.1f %s", m.getValueNumeric().doubleValue(), m.getUnit());
        };
    }
}
