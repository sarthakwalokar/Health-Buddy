package com.healthbuddy.controller;

import com.healthbuddy.dto.request.DoctorVerificationRequest;
import com.healthbuddy.dto.response.ApiResponse;
import com.healthbuddy.dto.response.DoctorProfileResponse;
import com.healthbuddy.dto.response.UserResponse;
import com.healthbuddy.entity.AuditLog;
import com.healthbuddy.entity.DoctorVerificationStatus;
import com.healthbuddy.service.AdminService;
import com.healthbuddy.service.AuditLogService;
import com.healthbuddy.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Portal", description = "Endpoints restricted exclusively to authenticated ADMIN users")
public class AdminController {

    private final AdminService adminService;
    private final AuthService authService;
    private final AuditLogService auditLogService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard overview", description = "Retrieves administrator profile and dashboard summary")
    public ResponseEntity<ApiResponse<UserResponse>> getDashboard() {
        UserResponse adminUser = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard loaded", adminUser));
    }

    @GetMapping("/users")
    @Operation(summary = "Get all users", description = "Retrieves all registered users across the platform")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/doctors")
    @Operation(summary = "Get doctors with status filter", description = "Filter doctor accounts by status (PENDING_VERIFICATION, VERIFIED, etc.)")
    public ResponseEntity<ApiResponse<List<DoctorProfileResponse>>> getDoctors(
            @RequestParam(required = false) DoctorVerificationStatus status) {
        List<DoctorProfileResponse> doctors = adminService.getDoctorsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }

    @PostMapping("/doctors/verify")
    @Operation(summary = "Verify doctor account", description = "Approve or reject a doctor's medical license credentials")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> verifyDoctor(
            @Valid @RequestBody DoctorVerificationRequest request) {
        DoctorProfileResponse result = adminService.verifyDoctor(request);
        return ResponseEntity.ok(ApiResponse.success("Doctor status updated successfully", result));
    }

    @PatchMapping("/users/{userId}/status")
    @Operation(summary = "Toggle user active status", description = "Enable or disable a user account")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(
            @PathVariable UUID userId,
            @RequestParam boolean enabled) {
        UserResponse response = adminService.toggleUserStatus(userId, enabled);
        return ResponseEntity.ok(ApiResponse.success("User account status updated", response));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get audit logs", description = "Paginated security and operation audit trail")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> auditLogs = auditLogService.getAllAuditLogs(pageable);
        return ResponseEntity.ok(ApiResponse.success(auditLogs));
    }
}
