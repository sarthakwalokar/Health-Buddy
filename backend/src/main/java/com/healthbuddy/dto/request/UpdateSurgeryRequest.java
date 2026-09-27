package com.healthbuddy.dto.request;

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
public class UpdateSurgeryRequest {

    @Size(min = 1, max = 255, message = "Procedure name must be between 1 and 255 characters")
    private String procedureName;

    @PastOrPresent(message = "Date of surgery cannot be in the future")
    private LocalDate dateOfSurgery;

    @Size(max = 255, message = "Hospital name must be at most 255 characters")
    private String hospitalName;

    private String notes;
}
