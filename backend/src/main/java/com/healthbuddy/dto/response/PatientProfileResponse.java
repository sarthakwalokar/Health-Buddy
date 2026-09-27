package com.healthbuddy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientProfileResponse {
    private UUID id;
    private UUID userId;
    private String email;
    private String fullName;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private BigDecimal heightCm;
    private BigDecimal weightKg;
    private String occupation;
    private String maritalStatus;
    private String profilePhotoUrl;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelationship;
    private String addressLine;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private int completionPercentage;
    private Instant createdAt;
    private Instant updatedAt;
}
