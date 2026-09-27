package com.healthbuddy.dto.response;

import com.healthbuddy.entity.FamilyRelationship;
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
public class FamilyHistoryResponse {
    private UUID id;
    private FamilyRelationship relationship;
    private String condition;
    private Integer ageOfOnset;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
