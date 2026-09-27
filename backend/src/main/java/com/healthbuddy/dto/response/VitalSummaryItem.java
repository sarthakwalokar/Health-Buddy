package com.healthbuddy.dto.response;

import com.healthbuddy.entity.MeasurementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VitalSummaryItem {
    private MeasurementType measurementType;
    private VitalResponse latestReading;
    private BigDecimal previousValue;
    private BigDecimal change;
    private String statusNote;
}
