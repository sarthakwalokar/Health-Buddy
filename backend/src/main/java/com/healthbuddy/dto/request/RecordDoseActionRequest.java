package com.healthbuddy.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordDoseActionRequest {

    @Schema(description = "Optional timestamp when dose was taken (defaults to current time if null)")
    private Instant takenAt;

    @Schema(description = "Optional patient notes regarding this dose (e.g. taken with breakfast, felt nauseous)", example = "Taken 10 minutes after dinner")
    private String notes;
}
