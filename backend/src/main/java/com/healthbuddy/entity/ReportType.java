package com.healthbuddy.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ReportType {
    LAB_REPORT("Lab Report"),
    PRESCRIPTION("Prescription"),
    IMAGING_REPORT("Imaging / Radiology Report"),
    DISCHARGE_SUMMARY("Discharge Summary"),
    PATHOLOGY_REPORT("Pathology Report"),
    OTHER("Other Medical Document"),
    UNKNOWN("Uncategorized Document");

    private final String displayLabel;
}
