package com.healthbuddy.dto.request;

import com.healthbuddy.entity.DoctorVerificationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorVerificationRequest {

    @NotNull(message = "Doctor profile ID is required")
    private UUID doctorProfileId;

    @NotNull(message = "Verification status is required")
    private DoctorVerificationStatus status;

    private String rejectionReason;
}
