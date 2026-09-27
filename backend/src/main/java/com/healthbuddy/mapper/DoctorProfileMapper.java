package com.healthbuddy.mapper;

import com.healthbuddy.dto.response.DoctorProfileResponse;
import com.healthbuddy.entity.DoctorProfile;
import org.springframework.stereotype.Component;

@Component
public class DoctorProfileMapper {

    public DoctorProfileResponse toDoctorProfileResponse(DoctorProfile profile) {
        if (profile == null) return null;

        return DoctorProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                .email(profile.getUser() != null ? profile.getUser().getEmail() : null)
                .fullName(profile.getUser() != null ? profile.getUser().getFullName() : null)
                .phone(profile.getUser() != null ? profile.getUser().getPhone() : null)
                .specialization(profile.getSpecialization())
                .qualification(profile.getQualification())
                .licenseNumber(profile.getLicenseNumber())
                .verificationStatus(profile.getVerificationStatus() != null ? profile.getVerificationStatus().name() : null)
                .verifiedAt(profile.getVerifiedAt())
                .rejectionReason(profile.getRejectionReason())
                .createdAt(profile.getCreatedAt())
                .build();
    }
}
