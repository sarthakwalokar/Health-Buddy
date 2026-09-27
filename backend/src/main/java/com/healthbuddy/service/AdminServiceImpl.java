package com.healthbuddy.service;

import com.healthbuddy.dto.request.DoctorVerificationRequest;
import com.healthbuddy.dto.response.DoctorProfileResponse;
import com.healthbuddy.dto.response.UserResponse;
import com.healthbuddy.entity.DoctorProfile;
import com.healthbuddy.entity.DoctorVerificationStatus;
import com.healthbuddy.entity.User;
import com.healthbuddy.exception.ResourceNotFoundException;
import com.healthbuddy.mapper.DoctorProfileMapper;
import com.healthbuddy.mapper.UserMapper;
import com.healthbuddy.repository.DoctorProfileRepository;
import com.healthbuddy.repository.UserRepository;
import com.healthbuddy.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final UserMapper userMapper;
    private final DoctorProfileMapper doctorProfileMapper;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorProfileResponse> getDoctorsByStatus(DoctorVerificationStatus status) {
        List<DoctorProfile> list = (status == null) 
                ? doctorProfileRepository.findAll()
                : doctorProfileRepository.findByVerificationStatus(status);

        return list.stream()
                .map(doctorProfileMapper::toDoctorProfileResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DoctorProfileResponse verifyDoctor(DoctorVerificationRequest request) {
        UUID adminId = SecurityUtils.getCurrentUserId();
        String adminEmail = SecurityUtils.getCurrentUserEmail();

        DoctorProfile profile = doctorProfileRepository.findById(request.getDoctorProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("DoctorProfile", "id", request.getDoctorProfileId()));

        profile.setVerificationStatus(request.getStatus());
        if (request.getStatus() == DoctorVerificationStatus.VERIFIED) {
            profile.setVerifiedAt(Instant.now());
            profile.setVerifiedBy(adminId);
            profile.setRejectionReason(null);
        } else if (request.getStatus() == DoctorVerificationStatus.REJECTED) {
            profile.setRejectionReason(request.getRejectionReason());
        }

        DoctorProfile saved = doctorProfileRepository.save(profile);

        auditLogService.logEvent(
                adminId,
                adminEmail,
                "DOCTOR_VERIFICATION_STATUS_CHANGED",
                "/api/v1/admin/doctors/verify",
                "SUCCESS",
                "SYSTEM",
                "ADMIN_ACTION",
                "Doctor " + profile.getUser().getEmail() + " status updated to " + request.getStatus()
        );

        return doctorProfileMapper.toDoctorProfileResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse toggleUserStatus(UUID userId, boolean enabled) {
        UUID adminId = SecurityUtils.getCurrentUserId();
        String adminEmail = SecurityUtils.getCurrentUserEmail();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setEnabled(enabled);
        User saved = userRepository.save(user);

        auditLogService.logEvent(
                adminId,
                adminEmail,
                "USER_STATUS_TOGGLED",
                "/api/v1/admin/users/" + userId + "/status",
                "SUCCESS",
                "SYSTEM",
                "ADMIN_ACTION",
                "User " + user.getEmail() + " enabled=" + enabled
        );

        return userMapper.toUserResponse(saved);
    }
}
