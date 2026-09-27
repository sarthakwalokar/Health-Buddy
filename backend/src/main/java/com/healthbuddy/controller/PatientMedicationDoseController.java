package com.healthbuddy.controller;

import com.healthbuddy.dto.request.RecordDoseActionRequest;
import com.healthbuddy.dto.response.ApiResponse;
import com.healthbuddy.dto.response.MedicationAdherenceResponse;
import com.healthbuddy.dto.response.MedicationDoseResponse;
import com.healthbuddy.dto.response.TodayMedicationsSummaryResponse;
import com.healthbuddy.entity.DoseStatus;
import com.healthbuddy.service.MedicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patient/medication-doses")
@RequiredArgsConstructor
@Tag(name = "Patient Medication Doses", description = "Endpoints for viewing scheduled doses, recording taken/skipped/missed status, and adherence analytics")
@PreAuthorize("hasRole('PATIENT')")
public class PatientMedicationDoseController {

    private final MedicationService medicationService;

    @GetMapping
    @Operation(summary = "Get medication dose history", description = "Retrieves paginated dose log with optional filters for medication ID, status, and date range.")
    public ResponseEntity<ApiResponse<Page<MedicationDoseResponse>>> getDoses(
            @RequestParam(required = false) UUID medicationId,
            @RequestParam(required = false) DoseStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "scheduledAt"));
        Page<MedicationDoseResponse> doses = medicationService.getDoses(medicationId, status, from, to, pageable);
        return ResponseEntity.ok(ApiResponse.success("Medication doses retrieved successfully", doses));
    }

    @GetMapping("/today")
    @Operation(summary = "Get today's medication doses", description = "Returns today's scheduled, taken, and upcoming doses for the dashboard and schedule tracker.")
    public ResponseEntity<ApiResponse<TodayMedicationsSummaryResponse>> getTodayDoses() {
        TodayMedicationsSummaryResponse response = medicationService.getTodayDoses();
        return ResponseEntity.ok(ApiResponse.success("Today's medication doses retrieved successfully", response));
    }

    @PostMapping("/{id}/taken")
    @Operation(summary = "Mark dose as taken", description = "Records a dose as taken with optional timestamp and personal intake notes.")
    public ResponseEntity<ApiResponse<MedicationDoseResponse>> markDoseTaken(
            @PathVariable UUID id,
            @RequestBody(required = false) RecordDoseActionRequest request
    ) {
        MedicationDoseResponse response = medicationService.markDoseTaken(id, request);
        return ResponseEntity.ok(ApiResponse.success("Dose recorded as taken", response));
    }

    @PostMapping("/{id}/skipped")
    @Operation(summary = "Mark dose as skipped", description = "Records a dose as skipped with optional explanatory notes.")
    public ResponseEntity<ApiResponse<MedicationDoseResponse>> markDoseSkipped(
            @PathVariable UUID id,
            @RequestBody(required = false) RecordDoseActionRequest request
    ) {
        MedicationDoseResponse response = medicationService.markDoseSkipped(id, request);
        return ResponseEntity.ok(ApiResponse.success("Dose recorded as skipped", response));
    }

    @PostMapping("/{id}/missed")
    @Operation(summary = "Mark dose as missed", description = "Records a dose as missed with optional notes.")
    public ResponseEntity<ApiResponse<MedicationDoseResponse>> markDoseMissed(
            @PathVariable UUID id,
            @RequestBody(required = false) RecordDoseActionRequest request
    ) {
        MedicationDoseResponse response = medicationService.markDoseMissed(id, request);
        return ResponseEntity.ok(ApiResponse.success("Dose marked as missed", response));
    }

    @GetMapping("/adherence")
    @Operation(summary = "Get overall adherence analytics", description = "Calculates overall patient adherence percentage across all active medications over a selected period.")
    public ResponseEntity<ApiResponse<MedicationAdherenceResponse>> getOverallAdherence(
            @RequestParam(defaultValue = "30_DAYS") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant end
    ) {
        MedicationAdherenceResponse response = medicationService.getAdherence(null, period, start, end);
        return ResponseEntity.ok(ApiResponse.success("Overall adherence analytics retrieved successfully", response));
    }
}
