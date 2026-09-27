package com.healthbuddy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "patient_conditions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientCondition extends BaseEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientProfile patient;

    @Column(name = "condition_name", length = 255, nullable = false)
    private String conditionName;

    @Column(name = "diagnosed_date")
    private LocalDate diagnosedDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private ConditionStatus status = ConditionStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", length = 50, nullable = false)
    @Builder.Default
    private ConditionSource source = ConditionSource.PATIENT_REPORTED;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
