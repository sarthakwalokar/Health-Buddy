package com.healthbuddy.mapper;

import com.healthbuddy.dto.response.ConditionResponse;
import com.healthbuddy.entity.PatientCondition;
import org.springframework.stereotype.Component;

@Component
public class PatientConditionMapper {

    public ConditionResponse toConditionResponse(PatientCondition condition) {
        if (condition == null) return null;

        return ConditionResponse.builder()
                .id(condition.getId())
                .conditionName(condition.getConditionName())
                .diagnosedDate(condition.getDiagnosedDate())
                .status(condition.getStatus())
                .source(condition.getSource())
                .sourceLabel(condition.getSource() != null ? condition.getSource().getDisplayLabel() : "Patient reported")
                .notes(condition.getNotes())
                .createdAt(condition.getCreatedAt())
                .updatedAt(condition.getUpdatedAt())
                .build();
    }
}
