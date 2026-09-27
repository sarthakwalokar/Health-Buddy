package com.healthbuddy.dto.request;

import com.healthbuddy.entity.AllergySeverity;
import com.healthbuddy.entity.AllergyStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAllergyRequest {

    @Size(min = 1, max = 255, message = "Allergen must be between 1 and 255 characters")
    private String allergen;

    @Size(max = 255, message = "Reaction description must be at most 255 characters")
    private String reaction;

    private AllergySeverity severity;

    private AllergyStatus status;

    private String notes;
}
