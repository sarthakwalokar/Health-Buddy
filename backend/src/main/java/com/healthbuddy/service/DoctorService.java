package com.healthbuddy.service;

import com.healthbuddy.dto.response.DoctorProfileResponse;

import java.util.List;

public interface DoctorService {
    DoctorProfileResponse getMyProfile();
    List<DoctorProfileResponse> getVerifiedDoctors();
}
