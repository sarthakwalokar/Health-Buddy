package com.healthbuddy.controller;

import com.healthbuddy.dto.response.ApiResponse;
import com.healthbuddy.dto.response.DoctorProfileResponse;
import com.healthbuddy.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/doctor")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
@Tag(name = "Doctor Portal", description = "Endpoints restricted exclusively to authenticated DOCTOR users")
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping("/profile")
    @Operation(summary = "Get doctor profile", description = "Retrieves profile and verification status of authenticated doctor")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> getProfile() {
        DoctorProfileResponse profile = doctorService.getMyProfile();
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get doctor dashboard data", description = "Retrieves dashboard summary with verification status for doctor")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> getDashboard() {
        DoctorProfileResponse profile = doctorService.getMyProfile();
        return ResponseEntity.ok(ApiResponse.success("Doctor dashboard loaded", profile));
    }
}
