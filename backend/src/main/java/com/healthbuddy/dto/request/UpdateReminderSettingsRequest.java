package com.healthbuddy.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateReminderSettingsRequest {

    @NotNull(message = "Reminder enabled flag is required")
    @Schema(description = "Whether reminders are enabled for this medication", example = "true")
    private Boolean reminderEnabled;

    @Min(value = 0, message = "Reminder lead time cannot be negative")
    @Schema(description = "Minutes before scheduled dose to alert", example = "15")
    private Integer reminderMinutesBefore;
}
