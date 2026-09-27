package com.healthbuddy.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ParameterSource {
    OCR("OCR Extraction"),
    PDF_TEXT("PDF Text Stream"),
    MANUAL("Manual Entry"),
    OTHER("Other Source");

    private final String displayLabel;
}
