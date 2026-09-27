package com.healthbuddy.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationAdherenceSummary {

    @Schema(description = "Medication ID")
    private UUID medicationId;

    @Schema(description = "Medicine name", example = "Metformin")
    private String medicineName;

    @Schema(description = "Strength", example = "500 mg")
    private String strength;

    @Schema(description = "Total scheduled doses in period", example = "30")
    private long scheduledDoses;

    @Schema(description = "Total taken doses", example = "26")
    private long takenDoses;

    @Schema(description = "Total skipped doses", example = "2")
    private long skippedDoses;

    @Schema(description = "Total missed doses", example = "2")
    private long missedDoses;

    @Schema(description = "Adherence rate percentage (0.0 to 100.0)", example = "86.7")
    private double adherencePercentage;
}
