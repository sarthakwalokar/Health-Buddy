package com.healthbuddy.dto.response;

import com.healthbuddy.entity.ReminderChannel;
import com.healthbuddy.entity.ReminderStatus;
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
public class MedicationReminderResponse {

    @Schema(description = "Reminder ID")
    private UUID id;

    @Schema(description = "Medication ID")
    private UUID medicationId;

    @Schema(description = "Dose ID")
    private UUID doseId;

    @Schema(description = "Medicine name", example = "Metformin")
    private String medicineName;

    @Schema(description = "Strength", example = "500 mg")
    private String strength;

    @Schema(description = "Reminder notice time")
    private Instant reminderTime;

    @Schema(description = "Reminder title", example = "Medication Reminder")
    private String title;

    @Schema(description = "Reminder message", example = "Metformin 500 mg is scheduled for 8:00 AM.")
    private String message;

    @Schema(description = "Status of reminder", example = "PENDING")
    private ReminderStatus status;

    @Schema(description = "Delivery channel", example = "IN_APP")
    private ReminderChannel channel;

    @Schema(description = "Created timestamp")
    private Instant createdAt;
}
