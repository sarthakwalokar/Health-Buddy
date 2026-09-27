package com.healthbuddy.dto.response;

import com.healthbuddy.entity.AlertSeverity;
import com.healthbuddy.entity.AlertStatus;
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
public class HealthAlertResponse {
    private UUID id;
    private UUID measurementId;
    private String alertType;
    private AlertSeverity severity;
    private String title;
    private String message;
    private AlertStatus status;
    private Instant acknowledgedAt;
    private Instant createdAt;
}
