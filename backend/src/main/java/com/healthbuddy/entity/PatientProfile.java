package com.healthbuddy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "patient_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientProfile extends BaseEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "blood_group", length = 10)
    private String bloodGroup;

    @Column(name = "height_cm", precision = 5, scale = 2)
    private BigDecimal heightCm;

    @Column(name = "weight_kg", precision = 5, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "occupation", length = 255)
    private String occupation;

    @Column(name = "marital_status", length = 50)
    private String maritalStatus;

    @Column(name = "profile_photo_url", length = 1024)
    private String profilePhotoUrl;

    @Column(name = "emergency_contact_name", length = 255)
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 50)
    private String emergencyContactPhone;

    @Column(name = "emergency_contact_relationship", length = 100)
    private String emergencyContactRelationship;

    @Column(name = "address_line", length = 255)
    private String addressLine;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "postal_code", length = 50)
    private String postalCode;

    @Column(name = "country", length = 100)
    private String country;

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private PatientLifestyle lifestyle;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PatientAllergy> allergies = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PatientCondition> conditions = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PatientSurgery> surgeries = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PatientFamilyHistory> familyHistories = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PatientHealthGoal> healthGoals = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MedicalReport> medicalReports = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<HealthMeasurement> measurements = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<HealthAlert> alerts = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Medication> medications = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MedicationDose> medicationDoses = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MedicationReminder> medicationReminders = new ArrayList<>();
}
