package com.healthbuddy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "patient_surgeries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientSurgery extends BaseEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientProfile patient;

    @Column(name = "procedure_name", length = 255, nullable = false)
    private String procedureName;

    @Column(name = "date_of_surgery")
    private LocalDate dateOfSurgery;

    @Column(name = "hospital_name", length = 255)
    private String hospitalName;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
