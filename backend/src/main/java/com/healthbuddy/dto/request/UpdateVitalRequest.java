package com.healthbuddy.dto.request;

import com.healthbuddy.entity.MeasurementContext;
import jakarta.validation.constraints.Size;
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
public class UpdateVitalRequest {

    private BigDecimal valueNumeric;

    private BigDecimal secondaryValueNumeric;

    private BigDecimal systolic;

    private BigDecimal diastolic;

    private String unit;

    private Instant measurementTime;

    private MeasurementContext measurementContext;

    @Size(max = 2000, message = "Notes cannot exceed 2000 characters")
    private String notes;

    public BigDecimal getEffectiveValueNumeric() {
        if (systolic != null) {
            return systolic;
        }
        return valueNumeric;
    }

    public BigDecimal getEffectiveSecondaryValueNumeric() {
        if (diastolic != null) {
            return diastolic;
        }
        return secondaryValueNumeric;
    }
}
