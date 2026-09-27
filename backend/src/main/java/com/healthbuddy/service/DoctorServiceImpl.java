package com.healthbuddy.service;

import com.healthbuddy.dto.response.DoctorProfileResponse;
import com.healthbuddy.entity.DoctorProfile;
import com.healthbuddy.entity.DoctorVerificationStatus;
import com.healthbuddy.entity.User;
import com.healthbuddy.exception.ResourceNotFoundException;
import com.healthbuddy.mapper.DoctorProfileMapper;
import com.healthbuddy.repository.DoctorProfileRepository;
import com.healthbuddy.repository.UserRepository;
import com.healthbuddy.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;
    private final DoctorProfileMapper doctorProfileMapper;

    @Override
    @Transactional(readOnly = true)
    public DoctorProfileResponse getMyProfile() {
        UUID userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        DoctorProfile profile = doctorProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("DoctorProfile", "userId", userId));

        return doctorProfileMapper.toDoctorProfileResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorProfileResponse> getVerifiedDoctors() {
        return doctorProfileRepository.findByVerificationStatus(DoctorVerificationStatus.VERIFIED)
                .stream()
                .map(doctorProfileMapper::toDoctorProfileResponse)
                .collect(Collectors.toList());
    }
}
