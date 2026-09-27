package com.healthbuddy.dto.response;

import com.healthbuddy.entity.ConditionSource;
import com.healthbuddy.entity.ConditionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConditionResponse {
    private UUID id;
    private String conditionName;
    private LocalDate diagnosedDate;
    private ConditionStatus status;
    private ConditionSource source;
    private String sourceLabel;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
