package com.healthbuddy.mapper;

import com.healthbuddy.dto.response.LifestyleResponse;
import com.healthbuddy.entity.PatientLifestyle;
import org.springframework.stereotype.Component;

@Component
public class PatientLifestyleMapper {

    public LifestyleResponse toLifestyleResponse(PatientLifestyle lifestyle) {
        if (lifestyle == null) return null;

        return LifestyleResponse.builder()
                .id(lifestyle.getId())
                .smokingStatus(lifestyle.getSmokingStatus())
                .alcoholStatus(lifestyle.getAlcoholStatus())
                .activityLevel(lifestyle.getActivityLevel())
                .dietaryPreference(lifestyle.getDietaryPreference())
                .sleepHours(lifestyle.getSleepHours())
                .waterIntakeLiters(lifestyle.getWaterIntakeLiters())
                .occupationType(lifestyle.getOccupationType())
                .notes(lifestyle.getNotes())
                .createdAt(lifestyle.getCreatedAt())
                .updatedAt(lifestyle.getUpdatedAt())
                .build();
    }
}
