package com.healthbuddy.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.healthbuddy.entity.FrequencyType;
import com.healthbuddy.entity.MedicationRoute;
import com.healthbuddy.entity.MedicationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMedicationRequest {

    @NotBlank(message = "Medicine name is required")
    @Size(max = 255, message = "Medicine name cannot exceed 255 characters")
    @Schema(description = "Brand or primary name of the medication", example = "Metformin")
    private String medicineName;

    @Size(max = 255, message = "Generic name cannot exceed 255 characters")
    @Schema(description = "Generic chemical/compound name", example = "Metformin Hydrochloride")
    private String genericName;

    @Size(max = 100, message = "Strength description cannot exceed 100 characters")
    @Schema(description = "Strength per dose unit", example = "500 mg")
    private String strength;

    @DecimalMin(value = "0.01", message = "Dosage amount must be greater than zero")
    @Schema(description = "Numeric dose amount per intake", example = "1.0")
    private BigDecimal dosageAmount;

    @Size(max = 50, message = "Dosage unit cannot exceed 50 characters")
    @Schema(description = "Dosage unit", example = "tablet")
    private String dosageUnit;

    @Schema(description = "Route of administration", example = "ORAL")
    private MedicationRoute route;

    @NotNull(message = "Frequency type is required")
    @Schema(description = "Standard or custom frequency schedule", example = "TWICE_DAILY")
    private FrequencyType frequencyType;

    @Size(max = 100, message = "Frequency value cannot exceed 100 characters")
    @Schema(description = "Human-readable frequency value or interval detail", example = "Twice a day with meals")
    private String frequencyValue;

    @NotNull(message = "Start date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "Date medication regimen begins", example = "2026-09-01")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "Optional date medication regimen ends", example = "2026-12-31")
    private LocalDate endDate;

    @Schema(description = "Patient-facing intake directions", example = "Take 1 tablet in the morning and 1 tablet in the evening with meals")
    private String instructions;

    @Schema(description = "Reason or clinical indication", example = "Blood glucose management")
    private String reason;

    @Size(max = 255, message = "Prescribing provider name cannot exceed 255 characters")
    @Schema(description = "Doctor or clinic who prescribed this medication", example = "Dr. Robert Chen, MD")
    private String prescribedBy;

    @Schema(description = "Status of medication tracking", example = "ACTIVE")
    private MedicationStatus status;

    @Schema(description = "Whether in-app medication reminders are enabled", example = "true")
    private Boolean reminderEnabled;

    @Min(value = 0, message = "Reminder lead time cannot be negative")
    @Schema(description = "Minutes before scheduled time to trigger reminder notice", example = "15")
    private Integer reminderMinutesBefore;

    @Schema(description = "Personal or clinical notes", example = "Do not take on an empty stomach")
    private String notes;

    @Valid
    @Schema(description = "Updated structured schedules and dose times")
    private List<MedicationScheduleRequest> schedules;
}
