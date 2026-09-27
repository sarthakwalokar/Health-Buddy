package com.healthbuddy.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateParameterRequest {

    @Size(max = 255, message = "Parameter name must not exceed 255 characters")
    private String parameterName;

    @Size(max = 100, message = "Parameter code must not exceed 100 characters")
    private String parameterCode;

    private BigDecimal valueNumeric;

    @Size(max = 255, message = "Value text must not exceed 255 characters")
    private String valueText;

    @Size(max = 50, message = "Unit must not exceed 50 characters")
    private String unit;

    @Size(max = 100, message = "Reference range must not exceed 100 characters")
    private String referenceRange;

    private LocalDate observationDate;

    private Boolean patientVerified;
}
