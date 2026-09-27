package com.healthbuddy.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.healthbuddy.entity.FrequencyType;
import com.healthbuddy.entity.MedicationRoute;
import com.healthbuddy.entity.MedicationSource;
import com.healthbuddy.entity.MedicationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationResponse {

    @Schema(description = "Medication ID")
    private UUID id;

    @Schema(description = "Medicine name", example = "Metformin")
    private String medicineName;

    @Schema(description = "Generic chemical name", example = "Metformin Hydrochloride")
    private String genericName;

    @Schema(description = "Strength", example = "500 mg")
    private String strength;

    @Schema(description = "Dosage amount", example = "1.0")
    private BigDecimal dosageAmount;

    @Schema(description = "Dosage unit", example = "tablet")
    private String dosageUnit;

    @Schema(description = "Formatted dosage string", example = "1 tablet")
    private String formattedDosage;

    @Schema(description = "Route of intake", example = "ORAL")
    private MedicationRoute route;

    @Schema(description = "Frequency type", example = "TWICE_DAILY")
    private FrequencyType frequencyType;

    @Schema(description = "Frequency detail", example = "Twice daily with meals")
    private String frequencyValue;

    @Schema(description = "Formatted frequency headline", example = "Twice daily")
    private String formattedFrequency;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "Start date", example = "2026-09-01")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "End date", example = "2026-12-31")
    private LocalDate endDate;

    @Schema(description = "Instructions", example = "Take with meals")
    private String instructions;

    @Schema(description = "Clinical reason/indication", example = "Blood glucose management")
    private String reason;

    @Schema(description = "Prescribing provider", example = "Dr. Robert Chen, MD")
    private String prescribedBy;

    @Schema(description = "Data provenance", example = "PATIENT_ENTERED")
    private MedicationSource source;

    @Schema(description = "Tracking status", example = "ACTIVE")
    private MedicationStatus status;

    @Schema(description = "Whether reminders are enabled", example = "true")
    private Boolean reminderEnabled;

    @Schema(description = "Reminder lead time in minutes", example = "15")
    private Integer reminderMinutesBefore;

    @Schema(description = "Notes", example = "Do not take on an empty stomach")
    private String notes;

    @Schema(description = "Structured schedules")
    private List<MedicationScheduleResponse> schedules;

    @Schema(description = "Next scheduled dose timestamp")
    private Instant nextScheduledDose;

    @Schema(description = "Adherence rate percentage over the last 30 days (0.0 to 100.0)", example = "92.5")
    private Double adherenceRate;

    @Schema(description = "Created timestamp")
    private Instant createdAt;

    @Schema(description = "Updated timestamp")
    private Instant updatedAt;
}
