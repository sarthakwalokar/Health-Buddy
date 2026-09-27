package com.healthbuddy.dto.response;

import com.healthbuddy.entity.MeasurementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VitalDashboardSummaryResponse {
    @Builder.Default
    private Map<MeasurementType, VitalSummaryItem> vitals = new HashMap<>();
    private VitalResponse latestBmi;
    private long unreadAlertsCount;
    private long totalMeasurementsRecorded;
}
