package com.healthbuddy.service;

import com.healthbuddy.dto.request.ChangePasswordRequest;
import com.healthbuddy.dto.request.DoctorRegisterRequest;
import com.healthbuddy.dto.request.LoginRequest;
import com.healthbuddy.dto.request.PatientRegisterRequest;
import com.healthbuddy.dto.request.RefreshTokenRequest;
import com.healthbuddy.dto.response.AuthResponse;
import com.healthbuddy.dto.response.TokenRefreshResponse;
import com.healthbuddy.dto.response.UserResponse;

public interface AuthService {
    AuthResponse registerPatient(PatientRegisterRequest request, String ipAddress, String userAgent);
    AuthResponse registerDoctor(DoctorRegisterRequest request, String ipAddress, String userAgent);
    AuthResponse login(LoginRequest request, String ipAddress, String userAgent);
    TokenRefreshResponse refreshToken(RefreshTokenRequest request, String ipAddress, String userAgent);
    void logout(String refreshToken, String ipAddress, String userAgent);
    void changePassword(ChangePasswordRequest request, String ipAddress, String userAgent);
    UserResponse getCurrentUser();
}
