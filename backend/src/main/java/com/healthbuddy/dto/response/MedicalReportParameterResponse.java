package com.healthbuddy.dto.response;

import com.healthbuddy.entity.ParameterSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalReportParameterResponse {
    private UUID id;
    private UUID reportId;
    private String parameterName;
    private String parameterCode;
    private BigDecimal valueNumeric;
    private String valueText;
    private String unit;
    private String referenceRange;
    private LocalDate observationDate;
    private BigDecimal extractionConfidence;
    private ParameterSource source;
    private String sourceLabel;
    private Boolean patientVerified;
    private String originalValueText;
    private Boolean correctedByPatient;
    private Instant createdAt;
    private Instant updatedAt;
}
