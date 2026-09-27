package com.healthbuddy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "doctor_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorProfile extends BaseEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "specialization", length = 255, nullable = false)
    private String specialization;

    @Column(name = "qualification", length = 255, nullable = false)
    private String qualification;

    @Column(name = "license_number", length = 100, nullable = false)
    private String licenseNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", length = 50, nullable = false)
    @Builder.Default
    private DoctorVerificationStatus verificationStatus = DoctorVerificationStatus.PENDING_VERIFICATION;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "verified_by")
    private UUID verifiedBy;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
}
