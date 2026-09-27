package com.healthbuddy.dto.response;

import com.healthbuddy.entity.ActivityLevel;
import com.healthbuddy.entity.AlcoholStatus;
import com.healthbuddy.entity.DietaryPreference;
import com.healthbuddy.entity.SmokingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LifestyleResponse {
    private UUID id;
    private SmokingStatus smokingStatus;
    private AlcoholStatus alcoholStatus;
    private ActivityLevel activityLevel;
    private DietaryPreference dietaryPreference;
    private BigDecimal sleepHours;
    private BigDecimal waterIntakeLiters;
    private String occupationType;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
