package com.healthbuddy.dto.response;

import com.healthbuddy.entity.HealthGoalStatus;
import com.healthbuddy.entity.HealthGoalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthGoalResponse {
    private UUID id;
    private HealthGoalType goalType;
    private String description;
    private String targetValue;
    private String targetUnit;
    private LocalDate targetDate;
    private HealthGoalStatus status;
    private Instant createdAt;
    private Instant updatedAt;
}
