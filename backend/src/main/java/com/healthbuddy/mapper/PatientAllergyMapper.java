package com.healthbuddy.mapper;

import com.healthbuddy.dto.response.AllergyResponse;
import com.healthbuddy.entity.PatientAllergy;
import org.springframework.stereotype.Component;

@Component
public class PatientAllergyMapper {

    public AllergyResponse toAllergyResponse(PatientAllergy allergy) {
        if (allergy == null) return null;

        return AllergyResponse.builder()
                .id(allergy.getId())
                .allergen(allergy.getAllergen())
                .reaction(allergy.getReaction())
                .severity(allergy.getSeverity())
                .status(allergy.getStatus())
                .notes(allergy.getNotes())
                .createdAt(allergy.getCreatedAt())
                .updatedAt(allergy.getUpdatedAt())
                .build();
    }
}
