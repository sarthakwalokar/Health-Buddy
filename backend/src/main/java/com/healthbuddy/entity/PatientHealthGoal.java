package com.healthbuddy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "patient_health_goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientHealthGoal extends BaseEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientProfile patient;

    @Enumerated(EnumType.STRING)
    @Column(name = "goal_type", length = 50, nullable = false)
    private HealthGoalType goalType;

    @Column(name = "description", length = 500, nullable = false)
    private String description;

    @Column(name = "target_value", length = 100)
    private String targetValue;

    @Column(name = "target_unit", length = 50)
    private String targetUnit;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private HealthGoalStatus status = HealthGoalStatus.ACTIVE;
}
