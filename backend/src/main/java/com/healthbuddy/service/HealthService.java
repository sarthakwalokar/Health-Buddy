package com.healthbuddy.service;

import com.healthbuddy.dto.response.HealthResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;

@Service
@Slf4j
@RequiredArgsConstructor
public class HealthService {

    private final DataSource dataSource;

    public HealthResponse checkHealth() {
        String dbStatus = "DOWN";
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(2)) {
                dbStatus = "CONNECTED";
            }
        } catch (Exception e) {
            log.error("Database health check failed: {}", e.getMessage());
            dbStatus = "DISCONNECTED: " + e.getMessage();
        }

        return HealthResponse.builder()
                .status("UP")
                .service("Health Buddy API")
                .database(dbStatus)
                .timestamp(Instant.now())
                .build();
    }
}
