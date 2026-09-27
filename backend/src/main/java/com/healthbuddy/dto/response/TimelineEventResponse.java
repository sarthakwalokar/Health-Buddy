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
public class TimelineEventResponse {
    private UUID id;
    private String eventType; // ALLERGY_RECORDED, CONDITION_RECORDED, SURGERY_RECORDED, PROFILE_UPDATED, GOAL_SET
    private String title;
    private String description;
    private String category; // CLINICAL, LIFESTYLE, ADMINISTRATIVE, DIAGNOSTIC
    private String sourceLabel; // "Patient reported", "Doctor reviewed", "System generated"
    private Instant eventDate;
}
