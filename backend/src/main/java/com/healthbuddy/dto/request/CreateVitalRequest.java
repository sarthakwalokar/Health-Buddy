package com.healthbuddy.dto.request;

import com.healthbuddy.entity.MeasurementContext;
import com.healthbuddy.entity.MeasurementType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
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
public class CreateVitalRequest {

    @NotNull(message = "Measurement type is required")
    private MeasurementType measurementType;

    private BigDecimal valueNumeric;

    private BigDecimal secondaryValueNumeric;

    // Direct aliases for Blood Pressure to improve ergonomics
    private BigDecimal systolic;

    private BigDecimal diastolic;

    private String unit;

    @NotNull(message = "Measurement timestamp is required")
    private Instant measurementTime;

    private MeasurementContext measurementContext;

    private UUID sourceReportId;

    @Size(max = 2000, message = "Notes cannot exceed 2000 characters")
    private String notes;

    public BigDecimal getEffectiveValueNumeric() {
        if (measurementType == MeasurementType.BLOOD_PRESSURE && systolic != null) {
            return systolic;
        }
        return valueNumeric;
    }

    public BigDecimal getEffectiveSecondaryValueNumeric() {
        if (measurementType == MeasurementType.BLOOD_PRESSURE && diastolic != null) {
            return diastolic;
        }
        return secondaryValueNumeric;
    }
}
