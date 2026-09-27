package com.healthbuddy.controller;

import com.healthbuddy.dto.request.CreateMedicationRequest;
import com.healthbuddy.dto.request.UpdateMedicationRequest;
import com.healthbuddy.dto.request.UpdateReminderSettingsRequest;
import com.healthbuddy.dto.response.ApiResponse;
import com.healthbuddy.dto.response.MedicationAdherenceResponse;
import com.healthbuddy.dto.response.MedicationResponse;
import com.healthbuddy.entity.MedicationStatus;
import com.healthbuddy.service.MedicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patient/medications")
@RequiredArgsConstructor
@Tag(name = "Patient Medications", description = "Endpoints for recording, managing, pausing/resuming, and tracking patient medication regimens and schedules")
@PreAuthorize("hasRole('PATIENT')")
public class PatientMedicationController {

    private final MedicationService medicationService;

    @PostMapping
    @Operation(summary = "Record a new medication", description = "Adds a new medication entry with dosage, frequency, instructions, and schedules. Auto-generates upcoming scheduled doses.")
    public ResponseEntity<ApiResponse<MedicationResponse>> createMedication(@Valid @RequestBody CreateMedicationRequest request) {
        MedicationResponse response = medicationService.createMedication(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Medication recorded successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get patient medications", description = "Retrieves paginated list of patient medications with optional status and search filters.")
    public ResponseEntity<ApiResponse<Page<MedicationResponse>>> getMedications(
            @RequestParam(required = false) MedicationStatus status,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<MedicationResponse> medications = medicationService.getMedications(status, query, pageable);
        return ResponseEntity.ok(ApiResponse.success("Medications retrieved successfully", medications));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get medication by ID", description = "Retrieves complete medication information, schedules, and adherence statistics with ownership verification.")
    public ResponseEntity<ApiResponse<MedicationResponse>> getMedicationById(@PathVariable UUID id) {
        MedicationResponse response = medicationService.getMedicationById(id);
        return ResponseEntity.ok(ApiResponse.success("Medication retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update medication", description = "Updates an existing medication record belonging to the authenticated patient.")
    public ResponseEntity<ApiResponse<MedicationResponse>> updateMedication(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateMedicationRequest request
    ) {
        MedicationResponse response = medicationService.updateMedication(id, request);
        return ResponseEntity.ok(ApiResponse.success("Medication updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete medication", description = "Deletes a medication record belonging to the authenticated patient.")
    public ResponseEntity<ApiResponse<Void>> deleteMedication(@PathVariable UUID id) {
        medicationService.deleteMedication(id);
        return ResponseEntity.ok(ApiResponse.success("Medication record deleted successfully", null));
    }

    @PostMapping("/{id}/pause")
    @Operation(summary = "Pause medication tracking", description = "Marks a medication as PAUSED and cancels future scheduled doses.")
    public ResponseEntity<ApiResponse<MedicationResponse>> pauseMedication(@PathVariable UUID id) {
        MedicationResponse response = medicationService.pauseMedication(id);
        return ResponseEntity.ok(ApiResponse.success("Medication tracking paused successfully", response));
    }

    @PostMapping("/{id}/resume")
    @Operation(summary = "Resume medication tracking", description = "Resumes a PAUSED medication and regenerates upcoming scheduled doses.")
    public ResponseEntity<ApiResponse<MedicationResponse>> resumeMedication(@PathVariable UUID id) {
        MedicationResponse response = medicationService.resumeMedication(id);
        return ResponseEntity.ok(ApiResponse.success("Medication tracking resumed successfully", response));
    }

    @PostMapping("/{id}/stop")
    @Operation(summary = "Stop medication tracking", description = "Marks a medication as STOPPED and cancels future scheduled doses.")
    public ResponseEntity<ApiResponse<MedicationResponse>> stopMedication(@PathVariable UUID id) {
        MedicationResponse response = medicationService.stopMedication(id);
        return ResponseEntity.ok(ApiResponse.success("Medication tracking marked as stopped", response));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete medication regimen", description = "Marks a medication as COMPLETED upon finishing the course.")
    public ResponseEntity<ApiResponse<MedicationResponse>> completeMedication(@PathVariable UUID id) {
        MedicationResponse response = medicationService.completeMedication(id);
        return ResponseEntity.ok(ApiResponse.success("Medication regimen marked as completed", response));
    }

    @PutMapping("/{id}/reminders")
    @Operation(summary = "Update reminder settings", description = "Enables, disables, or adjusts notification lead time for this medication.")
    public ResponseEntity<ApiResponse<MedicationResponse>> updateReminderSettings(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateReminderSettingsRequest request
    ) {
        MedicationResponse response = medicationService.updateReminderSettings(id, request);
        return ResponseEntity.ok(ApiResponse.success("Reminder settings updated successfully", response));
    }

    @GetMapping("/{id}/adherence")
    @Operation(summary = "Get adherence statistics for medication", description = "Calculates adherence rate, taken vs missed doses, and period overview for this medication.")
    public ResponseEntity<ApiResponse<MedicationAdherenceResponse>> getMedicationAdherence(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "30_DAYS") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant end
    ) {
        MedicationAdherenceResponse response = medicationService.getAdherence(id, period, start, end);
        return ResponseEntity.ok(ApiResponse.success("Adherence statistics retrieved successfully", response));
    }
}
