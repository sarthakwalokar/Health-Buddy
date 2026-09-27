package com.healthbuddy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "health_measurements", indexes = {
        @Index(name = "idx_health_measurements_patient_id", columnList = "patient_id"),
        @Index(name = "idx_health_measurements_type_time", columnList = "patient_id, measurement_type, measurement_time"),
        @Index(name = "idx_health_measurements_time", columnList = "patient_id, measurement_time"),
        @Index(name = "idx_health_measurements_source_report", columnList = "source_report_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientProfile patient;

    @Enumerated(EnumType.STRING)
    @Column(name = "measurement_type", nullable = false, length = 50)
    private MeasurementType measurementType;

    @Column(name = "value_numeric", nullable = false, precision = 10, scale = 2)
    private BigDecimal valueNumeric;

    @Column(name = "secondary_value_numeric", precision = 10, scale = 2)
    private BigDecimal secondaryValueNumeric;

    @Column(name = "unit", nullable = false, length = 50)
    private String unit;

    @Column(name = "measurement_time", nullable = false)
    private Instant measurementTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false, length = 50)
    @Builder.Default
    private MeasurementSource source = MeasurementSource.MANUAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "measurement_context", length = 50)
    private MeasurementContext measurementContext;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_report_id")
    private MedicalReport sourceReport;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
