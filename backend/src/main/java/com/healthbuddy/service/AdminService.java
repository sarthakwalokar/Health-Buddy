package com.healthbuddy.service;

import com.healthbuddy.dto.request.DoctorVerificationRequest;
import com.healthbuddy.dto.response.DoctorProfileResponse;
import com.healthbuddy.dto.response.UserResponse;
import com.healthbuddy.entity.DoctorVerificationStatus;

import java.util.List;
import java.util.UUID;

public interface AdminService {
    List<UserResponse> getAllUsers();
    List<DoctorProfileResponse> getDoctorsByStatus(DoctorVerificationStatus status);
    DoctorProfileResponse verifyDoctor(DoctorVerificationRequest request);
    UserResponse toggleUserStatus(UUID userId, boolean enabled);
}
