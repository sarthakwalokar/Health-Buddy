package com.healthbuddy.mapper;

import com.healthbuddy.dto.response.FamilyHistoryResponse;
import com.healthbuddy.entity.PatientFamilyHistory;
import org.springframework.stereotype.Component;

@Component
public class PatientFamilyHistoryMapper {

    public FamilyHistoryResponse toFamilyHistoryResponse(PatientFamilyHistory history) {
        if (history == null) return null;

        return FamilyHistoryResponse.builder()
                .id(history.getId())
                .relationship(history.getRelationship())
                .condition(history.getCondition())
                .ageOfOnset(history.getAgeOfOnset())
                .notes(history.getNotes())
                .createdAt(history.getCreatedAt())
                .updatedAt(history.getUpdatedAt())
                .build();
    }
}
