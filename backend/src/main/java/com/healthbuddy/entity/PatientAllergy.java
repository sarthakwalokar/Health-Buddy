package com.healthbuddy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "patient_allergies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientAllergy extends BaseEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientProfile patient;

    @Column(name = "allergen", length = 255, nullable = false)
    private String allergen;

    @Column(name = "reaction", length = 255)
    private String reaction;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", length = 50, nullable = false)
    @Builder.Default
    private AllergySeverity severity = AllergySeverity.UNKNOWN;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private AllergyStatus status = AllergyStatus.ACTIVE;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
