package com.healthbuddy.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ProcessingStatus {
    UPLOADED("Uploaded"),
    PROCESSING("Processing"),
    PROCESSED("Processed"),
    FAILED("Processing Failed");

    private final String displayLabel;
}
