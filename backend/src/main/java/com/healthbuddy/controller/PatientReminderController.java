package com.healthbuddy.controller;

import com.healthbuddy.dto.response.ApiResponse;
import com.healthbuddy.dto.response.MedicationReminderResponse;
import com.healthbuddy.entity.ReminderStatus;
import com.healthbuddy.service.MedicationService;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patient/reminders")
@RequiredArgsConstructor
@Tag(name = "Patient Medication Reminders", description = "Endpoints for viewing and acknowledging medication reminder notifications")
@PreAuthorize("hasRole('PATIENT')")
public class PatientReminderController {

    private final MedicationService medicationService;

    @GetMapping
    @Operation(summary = "Get medication reminders", description = "Retrieves paginated reminder notifications with optional status filtering.")
    public ResponseEntity<ApiResponse<Page<MedicationReminderResponse>>> getReminders(
            @RequestParam(required = false) ReminderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "reminderTime"));
        Page<MedicationReminderResponse> reminders = medicationService.getReminders(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Medication reminders retrieved successfully", reminders));
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Mark reminder as read", description = "Marks a medication reminder notification as READ.")
    public ResponseEntity<ApiResponse<MedicationReminderResponse>> markReminderRead(@PathVariable UUID id) {
        MedicationReminderResponse response = medicationService.markReminderRead(id);
        return ResponseEntity.ok(ApiResponse.success("Reminder marked as read", response));
    }
}
