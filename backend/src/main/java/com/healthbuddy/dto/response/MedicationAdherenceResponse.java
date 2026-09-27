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
public class MedicationAdherenceResponse {

    @Schema(description = "Evaluation period code", example = "30_DAYS")
    private String period;

    @Schema(description = "Descriptive period label", example = "Adherence over the last 30 days")
    private String periodLabel;

    @Schema(description = "Overall patient adherence percentage across all active medications", example = "86.7")
    private double overallAdherencePercentage;

    @Schema(description = "Total scheduled doses", example = "30")
    private long totalScheduledDoses;

    @Schema(description = "Total taken doses", example = "26")
    private long totalTakenDoses;

    @Schema(description = "Total skipped doses", example = "2")
    private long totalSkippedDoses;

    @Schema(description = "Total missed doses", example = "2")
    private long totalMissedDoses;

    @Schema(description = "Per-medication breakdown")
    private List<MedicationAdherenceSummary> medicationSummaries;

    @Schema(description = "Neutral descriptive statistical summary", example = "You have recorded 26 of 30 scheduled doses (86.7% adherence) over the last 30 days.")
    private String descriptiveSummary;
}
