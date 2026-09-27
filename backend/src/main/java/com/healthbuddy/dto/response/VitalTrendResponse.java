package com.healthbuddy.dto.response;

import com.healthbuddy.entity.MeasurementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VitalTrendResponse {
    private MeasurementType measurementType;
    private String unit;
    private String period;
    private BigDecimal latestValue;
    private BigDecimal latestSecondaryValue;
    private BigDecimal minValue;
    private BigDecimal maxValue;
    private BigDecimal averageValue;
    private BigDecimal minSecondaryValue;
    private BigDecimal maxSecondaryValue;
    private BigDecimal averageSecondaryValue;
    private BigDecimal changeFromPreviousPeriod;
    private String descriptiveSummary;
    private int totalReadings;
    @Builder.Default
    private List<VitalTrendDataPoint> dataPoints = new ArrayList<>();
}
