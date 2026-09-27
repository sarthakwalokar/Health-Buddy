package com.healthbuddy.controller;

import com.healthbuddy.dto.response.ApiResponse;
import com.healthbuddy.dto.response.HealthAlertResponse;
import com.healthbuddy.entity.AlertStatus;
import com.healthbuddy.service.VitalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patient/alerts")
@RequiredArgsConstructor
@Tag(name = "Patient Health Alerts", description = "Endpoints for viewing and acknowledging informational rule-based safety and trend alerts")
@PreAuthorize("hasRole('PATIENT')")
public class PatientAlertController {

    private final VitalService vitalService;

    @GetMapping
    @Operation(summary = "Get patient health alerts", description = "Retrieves paginated informational health alerts for the authenticated patient.")
    public ResponseEntity<ApiResponse<Page<HealthAlertResponse>>> getAlerts(
            @RequestParam(required = false) AlertStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<HealthAlertResponse> alerts = vitalService.getAlerts(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Health alerts retrieved successfully", alerts));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread health alert count", description = "Returns the count of unread health alerts for notification badges.")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadAlertCount() {
        long count = vitalService.getUnreadAlertCount();
        return ResponseEntity.ok(ApiResponse.success("Unread alert count retrieved", Map.of("unreadCount", count)));
    }

    @PostMapping("/{id}/acknowledge")
    @Operation(summary = "Acknowledge health alert", description = "Marks a health alert as acknowledged by the patient.")
    public ResponseEntity<ApiResponse<HealthAlertResponse>> acknowledgeAlert(@PathVariable UUID id) {
        HealthAlertResponse alert = vitalService.acknowledgeAlert(id);
        return ResponseEntity.ok(ApiResponse.success("Health alert acknowledged", alert));
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Mark health alert as read", description = "Marks a health alert as read.")
    public ResponseEntity<ApiResponse<HealthAlertResponse>> markAlertRead(@PathVariable UUID id) {
        HealthAlertResponse alert = vitalService.markAlertRead(id);
        return ResponseEntity.ok(ApiResponse.success("Health alert marked as read", alert));
    }
}
