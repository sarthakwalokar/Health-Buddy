package com.healthbuddy.dto.response;

import com.healthbuddy.entity.DoseStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationDoseResponse {

    @Schema(description = "Dose ID")
    private UUID id;

    @Schema(description = "Medication ID")
    private UUID medicationId;

    @Schema(description = "Medicine name", example = "Metformin")
    private String medicineName;

    @Schema(description = "Strength", example = "500 mg")
    private String strength;

    @Schema(description = "Dosage formatted", example = "1 tablet")
    private String formattedDosage;

    @Schema(description = "Instructions", example = "Take with food")
    private String instructions;

    @Schema(description = "Schedule ID if linked to recurring schedule")
    private UUID scheduleId;

    @Schema(description = "Scheduled date & time")
    private Instant scheduledAt;

    @Schema(description = "Recorded intake timestamp")
    private Instant takenAt;

    @Schema(description = "Current dose status", example = "SCHEDULED")
    private DoseStatus status;

    @Schema(description = "Patient or intake notes", example = "Taken on time")
    private String notes;
}
