package com.healthbuddy.mapper;

import com.healthbuddy.dto.request.CreateMedicationRequest;
import com.healthbuddy.dto.request.MedicationScheduleRequest;
import com.healthbuddy.dto.response.MedicationDoseResponse;
import com.healthbuddy.dto.response.MedicationReminderResponse;
import com.healthbuddy.dto.response.MedicationResponse;
import com.healthbuddy.dto.response.MedicationScheduleResponse;
import com.healthbuddy.entity.*;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class MedicationMapper {

    public MedicationResponse toMedicationResponse(Medication entity, Instant nextScheduledDose, Double adherenceRate) {
        if (entity == null) {
            return null;
        }

        List<MedicationScheduleResponse> scheduleResponses = entity.getSchedules() != null
                ? entity.getSchedules().stream().map(this::toScheduleResponse).collect(Collectors.toList())
                : Collections.emptyList();

        return MedicationResponse.builder()
                .id(entity.getId())
                .medicineName(entity.getMedicineName())
                .genericName(entity.getGenericName())
                .strength(entity.getStrength())
                .dosageAmount(entity.getDosageAmount())
                .dosageUnit(entity.getDosageUnit())
                .formattedDosage(formatDosage(entity))
                .route(entity.getRoute())
                .frequencyType(entity.getFrequencyType())
                .frequencyValue(entity.getFrequencyValue())
                .formattedFrequency(formatFrequency(entity))
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .instructions(entity.getInstructions())
                .reason(entity.getReason())
                .prescribedBy(entity.getPrescribedBy())
                .source(entity.getSource())
                .status(entity.getStatus())
                .reminderEnabled(entity.getReminderEnabled())
                .reminderMinutesBefore(entity.getReminderMinutesBefore())
                .notes(entity.getNotes())
                .schedules(scheduleResponses)
                .nextScheduledDose(nextScheduledDose)
                .adherenceRate(adherenceRate)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public MedicationScheduleResponse toScheduleResponse(MedicationSchedule entity) {
        if (entity == null) {
            return null;
        }
        return MedicationScheduleResponse.builder()
                .id(entity.getId())
                .scheduleType(entity.getScheduleType())
                .timeOfDay(entity.getTimeOfDay())
                .daysOfWeek(entity.getDaysOfWeek())
                .intervalHours(entity.getIntervalHours())
                .doseAmount(entity.getDoseAmount())
                .doseUnit(entity.getDoseUnit())
                .build();
    }

    public MedicationDoseResponse toDoseResponse(MedicationDose entity) {
        if (entity == null) {
            return null;
        }
        Medication med = entity.getMedication();
        return MedicationDoseResponse.builder()
                .id(entity.getId())
                .medicationId(med != null ? med.getId() : null)
                .medicineName(med != null ? med.getMedicineName() : "")
                .strength(med != null ? med.getStrength() : null)
                .formattedDosage(med != null ? formatDosage(med) : "")
                .instructions(med != null ? med.getInstructions() : null)
                .scheduleId(entity.getSchedule() != null ? entity.getSchedule().getId() : null)
                .scheduledAt(entity.getScheduledAt())
                .takenAt(entity.getTakenAt())
                .status(entity.getStatus())
                .notes(entity.getNotes())
                .build();
    }

    public MedicationReminderResponse toReminderResponse(MedicationReminder entity) {
        if (entity == null) {
            return null;
        }
        Medication med = entity.getMedication();
        return MedicationReminderResponse.builder()
                .id(entity.getId())
                .medicationId(med != null ? med.getId() : null)
                .doseId(entity.getDose() != null ? entity.getDose().getId() : null)
                .medicineName(med != null ? med.getMedicineName() : "")
                .strength(med != null ? med.getStrength() : null)
                .reminderTime(entity.getReminderTime())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .status(entity.getStatus())
                .channel(entity.getChannel())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public Medication toEntity(CreateMedicationRequest request, PatientProfile patient) {
        if (request == null) {
            return null;
        }
        return Medication.builder()
                .patient(patient)
                .medicineName(request.getMedicineName().trim())
                .genericName(request.getGenericName() != null ? request.getGenericName().trim() : null)
                .strength(request.getStrength() != null ? request.getStrength().trim() : null)
                .dosageAmount(request.getDosageAmount())
                .dosageUnit(request.getDosageUnit() != null ? request.getDosageUnit().trim() : null)
                .route(request.getRoute() != null ? request.getRoute() : MedicationRoute.UNKNOWN)
                .frequencyType(request.getFrequencyType() != null ? request.getFrequencyType() : FrequencyType.ONCE_DAILY)
                .frequencyValue(request.getFrequencyValue() != null ? request.getFrequencyValue().trim() : null)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .instructions(request.getInstructions() != null ? request.getInstructions().trim() : null)
                .reason(request.getReason() != null ? request.getReason().trim() : null)
                .prescribedBy(request.getPrescribedBy() != null ? request.getPrescribedBy().trim() : null)
                .source(request.getSource() != null ? request.getSource() : MedicationSource.PATIENT_ENTERED)
                .status(MedicationStatus.ACTIVE)
                .reminderEnabled(request.getReminderEnabled() != null ? request.getReminderEnabled() : true)
                .reminderMinutesBefore(request.getReminderMinutesBefore() != null ? request.getReminderMinutesBefore() : 0)
                .notes(request.getNotes() != null ? request.getNotes().trim() : null)
                .build();
    }

    public MedicationSchedule toScheduleEntity(MedicationScheduleRequest request, Medication medication) {
        if (request == null) {
            return null;
        }
        return MedicationSchedule.builder()
                .medication(medication)
                .scheduleType(request.getScheduleType() != null ? request.getScheduleType() : ScheduleType.FIXED_TIME)
                .timeOfDay(request.getTimeOfDay())
                .daysOfWeek(request.getDaysOfWeek())
                .intervalHours(request.getIntervalHours())
                .doseAmount(request.getDoseAmount() != null ? request.getDoseAmount() : medication.getDosageAmount())
                .doseUnit(request.getDoseUnit() != null ? request.getDoseUnit() : medication.getDosageUnit())
                .build();
    }

    public String formatDosage(Medication medication) {
        if (medication == null) return "";
        if (medication.getDosageAmount() != null && medication.getDosageUnit() != null) {
            if (medication.getDosageAmount().stripTrailingZeros().scale() <= 0) {
                return medication.getDosageAmount().intValue() + " " + medication.getDosageUnit();
            }
            return medication.getDosageAmount().toPlainString() + " " + medication.getDosageUnit();
        } else if (medication.getDosageAmount() != null) {
            return medication.getDosageAmount().toPlainString();
        } else if (medication.getDosageUnit() != null) {
            return medication.getDosageUnit();
        }
        return medication.getStrength() != null ? medication.getStrength() : "";
    }

    public String formatFrequency(Medication medication) {
        if (medication == null) return "";
        if (medication.getFrequencyValue() != null && !medication.getFrequencyValue().isBlank()) {
            return medication.getFrequencyValue();
        }
        if (medication.getFrequencyType() == null) return "";
        switch (medication.getFrequencyType()) {
            case ONCE_DAILY: return "Once daily";
            case TWICE_DAILY: return "Twice daily";
            case THREE_TIMES_DAILY: return "Three times daily";
            case FOUR_TIMES_DAILY: return "Four times daily";
            case EVERY_X_HOURS: return "Every few hours";
            case WEEKLY: return "Weekly";
            case AS_NEEDED: return "As needed (PRN)";
            case CUSTOM: return "Custom schedule";
            default: return medication.getFrequencyType().name().replace('_', ' ');
        }
    }
}
