package com.healthbuddy.dto.request;

import com.healthbuddy.entity.FamilyRelationship;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFamilyHistoryRequest {

    private FamilyRelationship relationship;

    @Size(min = 1, max = 255, message = "Condition must be between 1 and 255 characters")
    private String condition;

    @Min(value = 0, message = "Age of onset must be at least 0")
    @Max(value = 130, message = "Age of onset cannot exceed 130")
    private Integer ageOfOnset;

    private String notes;
}
