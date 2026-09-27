package com.healthbuddy.mapper;

import com.healthbuddy.dto.response.PatientProfileResponse;
import com.healthbuddy.entity.PatientProfile;
import org.springframework.stereotype.Component;

@Component
public class PatientProfileMapper {

    public PatientProfileResponse toPatientProfileResponse(PatientProfile profile) {
        if (profile == null) return null;

        return PatientProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                .email(profile.getUser() != null ? profile.getUser().getEmail() : null)
                .fullName(profile.getUser() != null ? profile.getUser().getFullName() : null)
                .phone(profile.getUser() != null ? profile.getUser().getPhone() : null)
                .dateOfBirth(profile.getDateOfBirth())
                .gender(profile.getGender())
                .bloodGroup(profile.getBloodGroup())
                .heightCm(profile.getHeightCm())
                .weightKg(profile.getWeightKg())
                .occupation(profile.getOccupation())
                .maritalStatus(profile.getMaritalStatus())
                .profilePhotoUrl(profile.getProfilePhotoUrl())
                .emergencyContactName(profile.getEmergencyContactName())
                .emergencyContactPhone(profile.getEmergencyContactPhone())
                .emergencyContactRelationship(profile.getEmergencyContactRelationship())
                .addressLine(profile.getAddressLine())
                .city(profile.getCity())
                .state(profile.getState())
                .postalCode(profile.getPostalCode())
                .country(profile.getCountry())
                .completionPercentage(calculateCompletionPercentage(profile))
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    public int calculateCompletionPercentage(PatientProfile profile) {
        if (profile == null) return 0;

        int score = 0;

        // 1. Basic Demographics (25 pts): DOB (10), Gender (10), Occupation (5)
        if (profile.getDateOfBirth() != null) score += 10;
        if (profile.getGender() != null && !profile.getGender().isBlank()) score += 10;
        if (profile.getOccupation() != null && !profile.getOccupation().isBlank()) score += 5;

        // 2. Body Metrics & Blood Group (25 pts): Blood Group (10), Height (8), Weight (7)
        if (profile.getBloodGroup() != null && !profile.getBloodGroup().isBlank()) score += 10;
        if (profile.getHeightCm() != null) score += 8;
        if (profile.getWeightKg() != null) score += 7;

        // 3. Emergency Contact (20 pts): Name (8), Phone (8), Relationship (4)
        if (profile.getEmergencyContactName() != null && !profile.getEmergencyContactName().isBlank()) score += 8;
        if (profile.getEmergencyContactPhone() != null && !profile.getEmergencyContactPhone().isBlank()) score += 8;
        if (profile.getEmergencyContactRelationship() != null && !profile.getEmergencyContactRelationship().isBlank()) score += 4;

        // 4. Address Details (15 pts): AddressLine (5), City (5), Country/State (5)
        if (profile.getAddressLine() != null && !profile.getAddressLine().isBlank()) score += 5;
        if (profile.getCity() != null && !profile.getCity().isBlank()) score += 5;
        if ((profile.getCountry() != null && !profile.getCountry().isBlank()) ||
            (profile.getState() != null && !profile.getState().isBlank())) score += 5;

        // 5. Lifestyle / Clinical records reviewed (15 pts)
        if (profile.getLifestyle() != null) score += 10;
        if ((profile.getAllergies() != null && !profile.getAllergies().isEmpty()) ||
            (profile.getConditions() != null && !profile.getConditions().isEmpty())) score += 5;

        return Math.min(100, score);
    }
}
