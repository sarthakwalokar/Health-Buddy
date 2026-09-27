package com.healthbuddy.dto.request;

import com.healthbuddy.entity.ActivityLevel;
import com.healthbuddy.entity.AlcoholStatus;
import com.healthbuddy.entity.DietaryPreference;
import com.healthbuddy.entity.SmokingStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLifestyleRequest {

    private SmokingStatus smokingStatus;

    private AlcoholStatus alcoholStatus;

    private ActivityLevel activityLevel;

    private DietaryPreference dietaryPreference;

    @DecimalMin(value = "0.0", message = "Sleep hours cannot be negative")
    @DecimalMax(value = "24.0", message = "Sleep hours cannot exceed 24")
    private BigDecimal sleepHours;

    @DecimalMin(value = "0.0", message = "Water intake cannot be negative")
    @DecimalMax(value = "20.0", message = "Water intake cannot exceed 20 liters")
    private BigDecimal waterIntakeLiters;

    @Size(max = 100, message = "Occupation type must be at most 100 characters")
    private String occupationType;

    private String notes;
}
