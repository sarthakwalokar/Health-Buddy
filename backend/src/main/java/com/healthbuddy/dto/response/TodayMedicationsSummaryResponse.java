package com.healthbuddy.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TodayMedicationsSummaryResponse {

    @Schema(description = "Total doses scheduled for today", example = "3")
    private long totalScheduledToday;

    @Schema(description = "Doses taken today", example = "1")
    private long takenToday;

    @Schema(description = "Upcoming remaining doses today", example = "2")
    private long upcomingToday;

    @Schema(description = "Missed doses today", example = "0")
    private long missedToday;

    @Schema(description = "Skipped doses today", example = "0")
    private long skippedToday;

    @Schema(description = "List of today's doses in chronological order")
    private List<MedicationDoseResponse> doses;

    @Schema(description = "Overall 30-day adherence rate percentage", example = "86.7")
    private double overallAdherenceRate;

    @Schema(description = "Count of currently active medications", example = "2")
    private long activeMedicationsCount;
}
