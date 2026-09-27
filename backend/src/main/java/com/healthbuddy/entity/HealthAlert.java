package com.healthbuddy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "health_alerts", indexes = {
        @Index(name = "idx_health_alerts_patient_status", columnList = "patient_id, status"),
        @Index(name = "idx_health_alerts_patient_created", columnList = "patient_id, created_at"),
        @Index(name = "idx_health_alerts_measurement_id", columnList = "measurement_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientProfile patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "measurement_id")
    private HealthMeasurement measurement;

    @Column(name = "alert_type", nullable = false, length = 100)
    private String alertType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 50)
    @Builder.Default
    private AlertSeverity severity = AlertSeverity.INFO;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private AlertStatus status = AlertStatus.UNREAD;

    @Column(name = "acknowledged_at")
    private Instant acknowledgedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
