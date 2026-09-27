package com.healthbuddy.dto.response;

import com.healthbuddy.entity.MeasurementContext;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VitalTrendDataPoint {
    private Instant timestamp;
    private BigDecimal value;
    private BigDecimal secondaryValue; // For blood pressure diastolic
    private MeasurementContext context;
}
