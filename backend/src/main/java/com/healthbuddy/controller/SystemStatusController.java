package com.healthbuddy.controller;

import com.healthbuddy.dto.response.SystemStatusResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;

@RestController
@RequestMapping("/api/v1/system")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "System Status", description = "Public system availability and operational health status")
public class SystemStatusController {

    private final DataSource dataSource;

    @GetMapping("/status")
    @Operation(summary = "Get public system status", description = "Provides real-time system operational status for the public landing page without revealing internal secrets")
    public ResponseEntity<SystemStatusResponse> getSystemStatus() {
        String dbStatus = "UP";
        try (Connection connection = dataSource.getConnection()) {
            if (!connection.isValid(2)) {
                dbStatus = "DOWN";
            }
        } catch (Exception e) {
            log.warn("Database status check failed: {}", e.getMessage());
            dbStatus = "DOWN";
        }

        String overallStatus = "UP".equals(dbStatus) ? "OPERATIONAL" : "DEGRADED";

        SystemStatusResponse response = SystemStatusResponse.builder()
                .status(overallStatus)
                .api("UP")
                .database(dbStatus)
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.ok(response);
    }
}
