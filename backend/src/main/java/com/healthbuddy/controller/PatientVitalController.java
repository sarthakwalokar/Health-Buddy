package com.healthbuddy.controller;

import com.healthbuddy.dto.request.CreateVitalRequest;
import com.healthbuddy.dto.request.UpdateVitalRequest;
import com.healthbuddy.dto.response.ApiResponse;
import com.healthbuddy.dto.response.VitalDashboardSummaryResponse;
import com.healthbuddy.dto.response.VitalResponse;
import com.healthbuddy.dto.response.VitalTrendResponse;
import com.healthbuddy.entity.MeasurementType;
import com.healthbuddy.service.VitalService;
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
@RequestMapping("/api/v1/patient/vitals")
@RequiredArgsConstructor
@Tag(name = "Patient Vitals & Health Monitoring", description = "Endpoints for logging, viewing, and analyzing patient health measurements, vitals, and trends")
@PreAuthorize("hasRole('PATIENT')")
public class PatientVitalController {

    private final VitalService vitalService;

    @PostMapping
    @Operation(summary = "Record a health measurement / vital", description = "Records a new vital observation (Blood Pressure, Heart Rate, Glucose, SpO2, Temperature, Weight). Auto-calculates BMI when weight is recorded and triggers safety rule evaluation.")
    public ResponseEntity<ApiResponse<VitalResponse>> recordVital(@Valid @RequestBody CreateVitalRequest request) {
        VitalResponse response = vitalService.recordVital(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Health measurement recorded successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get patient health measurements", description = "Retrieves paginated health measurements with optional filtering by measurement type and date range.")
    public ResponseEntity<ApiResponse<Page<VitalResponse>>> getVitals(
            @RequestParam(required = false) MeasurementType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "measurementTime"));
        Page<VitalResponse> vitals = vitalService.getVitals(type, from, to, pageable);
        return ResponseEntity.ok(ApiResponse.success("Health measurements retrieved successfully", vitals));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get vitals dashboard summary", description = "Returns the latest recorded values, recent changes, BMI, and active alerts summary for the patient dashboard.")
    public ResponseEntity<ApiResponse<VitalDashboardSummaryResponse>> getDashboardSummary() {
        VitalDashboardSummaryResponse summary = vitalService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.success("Vitals dashboard summary retrieved successfully", summary));
    }

    @GetMapping("/trends")
    @Operation(summary = "Get historical trends for a vital type via query parameter", description = "Returns chronological time-series data points, statistical summaries (min, max, average, change), and descriptive trend overview.")
    public ResponseEntity<ApiResponse<VitalTrendResponse>> getVitalTrendsQuery(
            @RequestParam(defaultValue = "BLOOD_PRESSURE") MeasurementType type,
            @RequestParam(defaultValue = "30_DAYS") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant end
    ) {
        VitalTrendResponse trend = vitalService.getVitalTrends(type, period, start, end);
        return ResponseEntity.ok(ApiResponse.success("Vital trend data retrieved successfully", trend));
    }

    @GetMapping("/trends/{type}")
    @Operation(summary = "Get historical trends for a vital type", description = "Returns chronological time-series data points, statistical summaries (min, max, average, change), and descriptive trend overview for charting.")
    public ResponseEntity<ApiResponse<VitalTrendResponse>> getVitalTrends(
            @PathVariable MeasurementType type,
            @RequestParam(defaultValue = "30_DAYS") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant end
    ) {
        VitalTrendResponse trend = vitalService.getVitalTrends(type, period, start, end);
        return ResponseEntity.ok(ApiResponse.success("Vital trend data retrieved successfully", trend));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get health measurement by ID", description = "Retrieves a single health measurement by ID with ownership verification.")
    public ResponseEntity<ApiResponse<VitalResponse>> getVitalById(@PathVariable UUID id) {
        VitalResponse vital = vitalService.getVitalById(id);
        return ResponseEntity.ok(ApiResponse.success("Health measurement retrieved successfully", vital));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a health measurement", description = "Updates an existing health measurement belonging to the authenticated patient.")
    public ResponseEntity<ApiResponse<VitalResponse>> updateVital(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateVitalRequest request
    ) {
        VitalResponse updated = vitalService.updateVital(id, request);
        return ResponseEntity.ok(ApiResponse.success("Health measurement updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a health measurement", description = "Deletes a health measurement belonging to the authenticated patient.")
    public ResponseEntity<ApiResponse<Void>> deleteVital(@PathVariable UUID id) {
        vitalService.deleteVital(id);
        return ResponseEntity.ok(ApiResponse.success("Health measurement deleted successfully", null));
    }

    // Specific Measurement Type Shortcut Endpoints

    @GetMapping("/blood-pressure")
    @Operation(summary = "Get blood pressure measurements")
    public ResponseEntity<ApiResponse<Page<VitalResponse>>> getBloodPressure(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "measurementTime"));
        return ResponseEntity.ok(ApiResponse.success("Blood pressure measurements retrieved",
                vitalService.getVitals(MeasurementType.BLOOD_PRESSURE, null, null, pageable)));
    }

    @GetMapping("/heart-rate")
    @Operation(summary = "Get heart rate measurements")
    public ResponseEntity<ApiResponse<Page<VitalResponse>>> getHeartRate(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "measurementTime"));
        return ResponseEntity.ok(ApiResponse.success("Heart rate measurements retrieved",
                vitalService.getVitals(MeasurementType.HEART_RATE, null, null, pageable)));
    }

    @GetMapping("/glucose")
    @Operation(summary = "Get blood glucose measurements")
    public ResponseEntity<ApiResponse<Page<VitalResponse>>> getGlucose(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "measurementTime"));
        return ResponseEntity.ok(ApiResponse.success("Blood glucose measurements retrieved",
                vitalService.getVitals(MeasurementType.BLOOD_GLUCOSE, null, null, pageable)));
    }

    @GetMapping("/temperature")
    @Operation(summary = "Get body temperature measurements")
    public ResponseEntity<ApiResponse<Page<VitalResponse>>> getTemperature(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "measurementTime"));
        return ResponseEntity.ok(ApiResponse.success("Temperature measurements retrieved",
                vitalService.getVitals(MeasurementType.TEMPERATURE, null, null, pageable)));
    }

    @GetMapping("/spo2")
    @Operation(summary = "Get oxygen saturation (SpO2) measurements")
    public ResponseEntity<ApiResponse<Page<VitalResponse>>> getSpO2(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "measurementTime"));
        return ResponseEntity.ok(ApiResponse.success("SpO2 measurements retrieved",
                vitalService.getVitals(MeasurementType.SPO2, null, null, pageable)));
    }

    @GetMapping("/weight")
    @Operation(summary = "Get weight measurements")
    public ResponseEntity<ApiResponse<Page<VitalResponse>>> getWeight(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "measurementTime"));
        return ResponseEntity.ok(ApiResponse.success("Weight measurements retrieved",
                vitalService.getVitals(MeasurementType.WEIGHT, null, null, pageable)));
    }
}
