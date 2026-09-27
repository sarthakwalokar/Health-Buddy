package com.healthbuddy.controller;

import com.healthbuddy.dto.request.*;
import com.healthbuddy.dto.response.ApiResponse;
import com.healthbuddy.dto.response.AuthResponse;
import com.healthbuddy.dto.response.TokenRefreshResponse;
import com.healthbuddy.dto.response.UserResponse;
import com.healthbuddy.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication, registration, token refresh, and session management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/patient")
    @Operation(summary = "Patient registration", description = "Register a new patient account with validation")
    public ResponseEntity<ApiResponse<AuthResponse>> registerPatient(
            @Valid @RequestBody PatientRegisterRequest request,
            HttpServletRequest httpRequest) {
        
        AuthResponse response = authService.registerPatient(
                request,
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent")
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Patient registered successfully", response));
    }

    @PostMapping("/register/doctor")
    @Operation(summary = "Doctor registration", description = "Register a new doctor account (status: PENDING_VERIFICATION)")
    public ResponseEntity<ApiResponse<AuthResponse>> registerDoctor(
            @Valid @RequestBody DoctorRegisterRequest request,
            HttpServletRequest httpRequest) {

        AuthResponse response = authService.registerDoctor(
                request,
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent")
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Doctor registered successfully. Account is pending verification.", response));
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate using email and password, returns JWT and user role")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        AuthResponse response = authService.login(
                request,
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent")
        );
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Obtain a fresh access token using a valid refresh token")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request,
            HttpServletRequest httpRequest) {

        TokenRefreshResponse response = authService.refreshToken(
                request,
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent")
        );
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Invalidate active refresh token and end session")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody(required = false) RefreshTokenRequest request,
            HttpServletRequest httpRequest) {

        String token = (request != null) ? request.getRefreshToken() : null;
        authService.logout(token, httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @GetMapping("/me")
    @Operation(summary = "Current user profile", description = "Retrieve authenticated user's minimal identity information")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        UserResponse response = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password", description = "Change password for the currently authenticated user")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletRequest httpRequest) {

        authService.changePassword(
                request,
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent")
        );
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
}
