package com.healthbuddy.dto.response;

import com.healthbuddy.entity.MeasurementContext;
import com.healthbuddy.entity.MeasurementSource;
import com.healthbuddy.entity.MeasurementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VitalResponse {
    private UUID id;
    private MeasurementType measurementType;
    private BigDecimal valueNumeric;
    private BigDecimal secondaryValueNumeric;
    private BigDecimal systolic;
    private BigDecimal diastolic;
    private String formattedValue;
    private String unit;
    private Instant measurementTime;
    private MeasurementSource source;
    private MeasurementContext measurementContext;
    private UUID sourceReportId;
    private String sourceReportName;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
