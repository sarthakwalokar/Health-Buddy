package com.healthbuddy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemStatusResponse {
    private String status;      // OPERATIONAL, DEGRADED, DOWN
    private String api;         // UP, DOWN
    private String database;    // UP, DOWN
    private Instant timestamp;
}
