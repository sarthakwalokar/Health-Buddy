package com.healthbuddy.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.healthbuddy.entity.ScheduleType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationScheduleResponse {

    @Schema(description = "Schedule ID")
    private UUID id;

    @Schema(description = "Schedule type", example = "FIXED_TIME")
    private ScheduleType scheduleType;

    @Schema(description = "Time of day", example = "08:00:00")
    @JsonFormat(pattern = "HH:mm[:ss]")
    private LocalTime timeOfDay;

    @Schema(description = "Comma-separated days of week", example = "MONDAY,WEDNESDAY,FRIDAY")
    private String daysOfWeek;

    @Schema(description = "Interval in hours", example = "8")
    private Integer intervalHours;

    @Schema(description = "Dose amount", example = "1.0")
    private BigDecimal doseAmount;

    @Schema(description = "Dose unit", example = "tablet")
    private String doseUnit;
}
