package com.healthbuddy.dto.request;

import com.healthbuddy.entity.HealthGoalStatus;
import com.healthbuddy.entity.HealthGoalType;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateHealthGoalRequest {

    private HealthGoalType goalType;

    @Size(min = 1, max = 500, message = "Description must be between 1 and 500 characters")
    private String description;

    @Size(max = 100, message = "Target value must be at most 100 characters")
    private String targetValue;

    @Size(max = 50, message = "Target unit must be at most 50 characters")
    private String targetUnit;

    private LocalDate targetDate;

    private HealthGoalStatus status;
}
