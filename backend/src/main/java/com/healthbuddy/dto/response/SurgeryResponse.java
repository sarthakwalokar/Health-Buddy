package com.healthbuddy.dto.response;

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
public class SurgeryResponse {
    private UUID id;
    private String procedureName;
    private LocalDate dateOfSurgery;
    private String hospitalName;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
