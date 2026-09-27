package com.healthbuddy.service;

import com.healthbuddy.dto.response.VitalDashboardSummaryResponse;
import com.healthbuddy.dto.response.VitalTrendResponse;
import com.healthbuddy.entity.MeasurementType;
import com.healthbuddy.entity.PatientProfile;

import java.time.Instant;

public interface HealthTrendService {
    VitalTrendResponse calculateTrend(PatientProfile patient, MeasurementType type, String period, Instant customStart, Instant customEnd);
    VitalDashboardSummaryResponse getDashboardSummary(PatientProfile patient);
}
