package com.healthbuddy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "medications", indexes = {
        @Index(name = "idx_medications_patient_status", columnList = "patient_id, status"),
        @Index(name = "idx_medications_patient_start_date", columnList = "patient_id, start_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientProfile patient;

    @Column(name = "medicine_name", nullable = false)
    private String medicineName;

    @Column(name = "generic_name")
    private String genericName;

    @Column(name = "strength", length = 100)
    private String strength;

    @Column(name = "dosage_amount", precision = 8, scale = 2)
    private BigDecimal dosageAmount;

    @Column(name = "dosage_unit", length = 50)
    private String dosageUnit;

    @Enumerated(EnumType.STRING)
    @Column(name = "route", nullable = false, length = 50)
    @Builder.Default
    private MedicationRoute route = MedicationRoute.UNKNOWN;

    @Enumerated(EnumType.STRING)
    @Column(name = "frequency_type", nullable = false, length = 50)
    @Builder.Default
    private FrequencyType frequencyType = FrequencyType.ONCE_DAILY;

    @Column(name = "frequency_value", length = 100)
    private String frequencyValue;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "prescribed_by")
    private String prescribedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false, length = 50)
    @Builder.Default
    private MedicationSource source = MedicationSource.PATIENT_ENTERED;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private MedicationStatus status = MedicationStatus.ACTIVE;

    @Column(name = "reminder_enabled", nullable = false)
    @Builder.Default
    private Boolean reminderEnabled = true;

    @Column(name = "reminder_minutes_before", nullable = false)
    @Builder.Default
    private Integer reminderMinutesBefore = 0;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "medication", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MedicationSchedule> schedules = new ArrayList<>();

    @OneToMany(mappedBy = "medication", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MedicationDose> doses = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
