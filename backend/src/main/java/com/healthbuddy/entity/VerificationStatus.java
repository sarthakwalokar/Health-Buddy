package com.healthbuddy.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum VerificationStatus {
    NOT_VERIFIED("Not Verified"),
    PATIENT_VERIFIED("Patient Verified"),
    DOCTOR_REVIEWED("Doctor Reviewed");

    private final String displayLabel;
}
