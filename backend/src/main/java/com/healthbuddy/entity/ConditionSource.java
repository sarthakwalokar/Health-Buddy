package com.healthbuddy.entity;

public enum ConditionSource {
    PATIENT_REPORTED,
    DOCTOR_REPORTED,
    IMPORTED;

    public String getDisplayLabel() {
        return switch (this) {
            case PATIENT_REPORTED -> "Patient reported";
            case DOCTOR_REPORTED -> "Doctor reviewed";
            case IMPORTED -> "Imported record";
        };
    }
}
