package com.healthbuddy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "medication_schedules", indexes = {
        @Index(name = "idx_medication_schedules_med", columnList = "medication_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_id", nullable = false)
    private Medication medication;

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_type", nullable = false, length = 50)
    @Builder.Default
    private ScheduleType scheduleType = ScheduleType.FIXED_TIME;

    @Column(name = "time_of_day")
    private LocalTime timeOfDay;

    @Column(name = "days_of_week", length = 100)
    private String daysOfWeek;

    @Column(name = "interval_hours")
    private Integer intervalHours;

    @Column(name = "dose_amount", precision = 8, scale = 2)
    private BigDecimal doseAmount;

    @Column(name = "dose_unit", length = 50)
    private String doseUnit;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
