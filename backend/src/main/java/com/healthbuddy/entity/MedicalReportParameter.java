package com.healthbuddy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "medical_report_parameters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalReportParameter extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_id", nullable = false)
    private MedicalReport report;

    @Column(name = "parameter_name", nullable = false)
    private String parameterName;

    @Column(name = "parameter_code", length = 100)
    private String parameterCode;

    @Column(name = "value_numeric", precision = 12, scale = 4)
    private BigDecimal valueNumeric;

    @Column(name = "value_text", nullable = false)
    private String valueText;

    @Column(name = "unit", length = 50)
    private String unit;

    @Column(name = "reference_range", length = 100)
    private String referenceRange;

    @Column(name = "observation_date")
    private LocalDate observationDate;

    @Column(name = "extraction_confidence", precision = 5, scale = 4)
    private BigDecimal extractionConfidence;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false, length = 50)
    @Builder.Default
    private ParameterSource source = ParameterSource.OCR;

    @Column(name = "patient_verified", nullable = false)
    @Builder.Default
    private Boolean patientVerified = false;

    @Column(name = "original_value_text")
    private String originalValueText;

    @Column(name = "corrected_by_patient", nullable = false)
    @Builder.Default
    private Boolean correctedByPatient = false;
}
