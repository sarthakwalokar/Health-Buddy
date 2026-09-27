package com.healthbuddy.dto.response;

import com.healthbuddy.entity.AllergySeverity;
import com.healthbuddy.entity.AllergyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllergyResponse {
    private UUID id;
    private String allergen;
    private String reaction;
    private AllergySeverity severity;
    private AllergyStatus status;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
