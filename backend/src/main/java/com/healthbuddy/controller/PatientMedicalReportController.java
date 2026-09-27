package com.healthbuddy.controller;

import com.healthbuddy.dto.request.CreateParameterRequest;
import com.healthbuddy.dto.request.UpdateParameterRequest;
import com.healthbuddy.dto.response.ApiResponse;
import com.healthbuddy.dto.response.MedicalReportDetailResponse;
import com.healthbuddy.dto.response.MedicalReportParameterResponse;
import com.healthbuddy.dto.response.MedicalReportResponse;
import com.healthbuddy.entity.ProcessingStatus;
import com.healthbuddy.entity.ReportType;
import com.healthbuddy.service.MedicalReportService;
import com.healthbuddy.service.MedicalReportService.ReportFileDownload;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patient/reports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Patient Medical Reports", description = "Secure medical document upload, OCR parameter extraction, verification, and file retrieval")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAuthority('ROLE_PATIENT')")
public class PatientMedicalReportController {

    private final MedicalReportService medicalReportService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload medical report", description = "Uploads a PDF or image medical document for secure storage and automated parameter extraction")
    public ResponseEntity<ApiResponse<MedicalReportDetailResponse>> uploadReport(
            @Parameter(description = "Medical report file (PDF, PNG, JPG, JPEG)", required = true)
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "Report category type")
            @RequestParam(value = "reportType", required = false) ReportType reportType,
            @Parameter(description = "Optional clinical notes")
            @RequestParam(value = "notes", required = false) String notes
    ) {
        MedicalReportDetailResponse response = medicalReportService.uploadReport(file, reportType, notes);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Medical report uploaded and processed successfully", response));
    }

    @GetMapping
    @Operation(summary = "List medical reports", description = "Retrieves a list of medical reports for the authenticated patient with optional filters")
    public ResponseEntity<ApiResponse<List<MedicalReportResponse>>> getMyReports(
            @RequestParam(value = "reportType", required = false) ReportType reportType,
            @RequestParam(value = "status", required = false) ProcessingStatus status,
            @RequestParam(value = "search", required = false) String search
    ) {
        List<MedicalReportResponse> reports = medicalReportService.getMyReports(reportType, status, search);
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get report details", description = "Retrieves full report details including extracted clinical parameters and extracted document text")
    public ResponseEntity<ApiResponse<MedicalReportDetailResponse>> getReportById(
            @PathVariable("id") UUID id
    ) {
        MedicalReportDetailResponse report = medicalReportService.getReportById(id);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/{id}/file")
    @Operation(summary = "Download or stream report file", description = "Securely streams or downloads the original medical report file for the authorized owner")
    public ResponseEntity<Resource> downloadReportFile(
            @PathVariable("id") UUID id
    ) {
        ReportFileDownload download = medicalReportService.downloadReportFile(id);

        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(download.contentType());
        } catch (Exception e) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + download.filename() + "\"")
                .body(download.resource());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete medical report", description = "Permanently deletes a medical report, its extracted parameters, and its stored physical file")
    public ResponseEntity<ApiResponse<Void>> deleteReport(
            @PathVariable("id") UUID id
    ) {
        medicalReportService.deleteReport(id);
        return ResponseEntity.ok(ApiResponse.success("Medical report deleted successfully", null));
    }

    @PostMapping("/{id}/verify")
    @Operation(summary = "Verify medical report", description = "Marks the medical report and its extracted parameters as verified by the patient")
    public ResponseEntity<ApiResponse<MedicalReportDetailResponse>> verifyReport(
            @PathVariable("id") UUID id
    ) {
        MedicalReportDetailResponse response = medicalReportService.verifyReport(id);
        return ResponseEntity.ok(ApiResponse.success("Medical report verified successfully", response));
    }

    @GetMapping("/{id}/parameters")
    @Operation(summary = "Get report parameters", description = "Retrieves extracted structured health parameters for a specific report")
    public ResponseEntity<ApiResponse<List<MedicalReportParameterResponse>>> getParameters(
            @PathVariable("id") UUID id
    ) {
        List<MedicalReportParameterResponse> parameters = medicalReportService.getParameters(id);
        return ResponseEntity.ok(ApiResponse.success(parameters));
    }

    @PutMapping("/{id}/parameters/{parameterId}")
    @Operation(summary = "Update / correct parameter", description = "Updates or corrects an extracted health parameter, maintaining provenance and verification tracking")
    public ResponseEntity<ApiResponse<MedicalReportParameterResponse>> updateParameter(
            @PathVariable("id") UUID id,
            @PathVariable("parameterId") UUID parameterId,
            @Valid @RequestBody UpdateParameterRequest request
    ) {
        MedicalReportParameterResponse updated = medicalReportService.updateParameter(id, parameterId, request);
        return ResponseEntity.ok(ApiResponse.success("Report parameter updated successfully", updated));
    }

    @PostMapping("/{id}/parameters")
    @Operation(summary = "Add manual parameter", description = "Manually adds a health parameter to a medical report")
    public ResponseEntity<ApiResponse<MedicalReportParameterResponse>> addParameter(
            @PathVariable("id") UUID id,
            @Valid @RequestBody CreateParameterRequest request
    ) {
        MedicalReportParameterResponse created = medicalReportService.addParameter(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Health parameter added successfully", created));
    }
}
