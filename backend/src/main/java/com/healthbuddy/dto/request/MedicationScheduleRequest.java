package com.healthbuddy.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.healthbuddy.entity.ScheduleType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationScheduleRequest {

    @Schema(description = "Schedule type", example = "FIXED_TIME")
    private ScheduleType scheduleType;

    @Schema(description = "Time of day (HH:mm:ss or HH:mm)", example = "08:00:00")
    @JsonFormat(pattern = "HH:mm[:ss]")
    private LocalTime timeOfDay;

    @Schema(description = "Comma-separated days of week for weekly schedules", example = "MONDAY,WEDNESDAY,FRIDAY")
    private String daysOfWeek;

    @Schema(description = "Interval in hours for interval-based schedules", example = "8")
    private Integer intervalHours;

    @Schema(description = "Specific dose amount for this time", example = "1.0")
    private BigDecimal doseAmount;

    @Schema(description = "Specific dose unit for this time", example = "tablet")
    private String doseUnit;
}
