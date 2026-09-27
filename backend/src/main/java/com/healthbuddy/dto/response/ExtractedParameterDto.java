package com.healthbuddy.dto.response;

import com.healthbuddy.entity.ParameterSource;
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
public class ExtractedParameterDto {
    private String parameterName;
    private String parameterCode;
    private BigDecimal valueNumeric;
    private String valueText;
    private String unit;
    private String referenceRange;
    private LocalDate observationDate;
    private BigDecimal extractionConfidence;
    private ParameterSource source;
}
