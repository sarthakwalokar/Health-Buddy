package com.healthbuddy.dto.request;

import com.healthbuddy.entity.ConditionSource;
import com.healthbuddy.entity.ConditionStatus;
import jakarta.validation.constraints.PastOrPresent;
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
public class UpdateConditionRequest {

    @Size(min = 1, max = 255, message = "Condition name must be between 1 and 255 characters")
    private String conditionName;

    @PastOrPresent(message = "Diagnosed date cannot be in the future")
    private LocalDate diagnosedDate;

    private ConditionStatus status;

    private ConditionSource source;

    private String notes;
}
