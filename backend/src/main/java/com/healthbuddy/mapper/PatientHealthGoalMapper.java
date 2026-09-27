package com.healthbuddy.mapper;

import com.healthbuddy.dto.response.HealthGoalResponse;
import com.healthbuddy.entity.PatientHealthGoal;
import org.springframework.stereotype.Component;

@Component
public class PatientHealthGoalMapper {

    public HealthGoalResponse toHealthGoalResponse(PatientHealthGoal goal) {
        if (goal == null) return null;

        return HealthGoalResponse.builder()
                .id(goal.getId())
                .goalType(goal.getGoalType())
                .description(goal.getDescription())
                .targetValue(goal.getTargetValue())
                .targetUnit(goal.getTargetUnit())
                .targetDate(goal.getTargetDate())
                .status(goal.getStatus())
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }
}
