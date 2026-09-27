package com.healthbuddy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfileResponse {
    private UUID id;
    private UUID userId;
    private String email;
    private String fullName;
    private String phone;
    private String specialization;
    private String qualification;
    private String licenseNumber;
    private String verificationStatus;
    private Instant verifiedAt;
    private String rejectionReason;
    private Instant createdAt;
}
