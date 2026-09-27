package com.healthbuddy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "patient_family_histories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientFamilyHistory extends BaseEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientProfile patient;

    @Enumerated(EnumType.STRING)
    @Column(name = "relationship", length = 50, nullable = false)
    private FamilyRelationship relationship;

    @Column(name = "condition", length = 255, nullable = false)
    private String condition;

    @Column(name = "age_of_onset")
    private Integer ageOfOnset;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
