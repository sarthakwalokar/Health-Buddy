package com.healthbuddy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "patient_lifestyles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientLifestyle extends BaseEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false, unique = true)
    private PatientProfile patient;

    @Enumerated(EnumType.STRING)
    @Column(name = "smoking_status", length = 50, nullable = false)
    @Builder.Default
    private SmokingStatus smokingStatus = SmokingStatus.UNKNOWN;

    @Enumerated(EnumType.STRING)
    @Column(name = "alcohol_status", length = 50, nullable = false)
    @Builder.Default
    private AlcoholStatus alcoholStatus = AlcoholStatus.UNKNOWN;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_level", length = 50, nullable = false)
    @Builder.Default
    private ActivityLevel activityLevel = ActivityLevel.UNKNOWN;

    @Enumerated(EnumType.STRING)
    @Column(name = "dietary_preference", length = 50, nullable = false)
    @Builder.Default
    private DietaryPreference dietaryPreference = DietaryPreference.NOT_SPECIFIED;

    @Column(name = "sleep_hours", precision = 4, scale = 1)
    private BigDecimal sleepHours;

    @Column(name = "water_intake_liters", precision = 4, scale = 2)
    private BigDecimal waterIntakeLiters;

    @Column(name = "occupation_type", length = 100)
    private String occupationType;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
