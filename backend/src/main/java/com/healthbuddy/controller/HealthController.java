package com.healthbuddy.controller;

import com.healthbuddy.dto.response.HealthResponse;
import com.healthbuddy.service.HealthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/health")
@RequiredArgsConstructor
@Tag(name = "Health", description = "System and database health probe endpoints")
public class HealthController {

    private final HealthService healthService;

    @GetMapping
    @Operation(summary = "Health probe", description = "Checks service status and database connectivity")
    public ResponseEntity<HealthResponse> getHealth() {
        return ResponseEntity.ok(healthService.checkHealth());
    }
}
