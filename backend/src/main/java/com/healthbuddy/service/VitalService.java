package com.healthbuddy.service;

import com.healthbuddy.dto.request.CreateVitalRequest;
import com.healthbuddy.dto.request.UpdateVitalRequest;
import com.healthbuddy.dto.response.HealthAlertResponse;
import com.healthbuddy.dto.response.VitalDashboardSummaryResponse;
import com.healthbuddy.dto.response.VitalResponse;
import com.healthbuddy.dto.response.VitalTrendResponse;
import com.healthbuddy.entity.AlertStatus;
import com.healthbuddy.entity.MeasurementType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.UUID;

public interface VitalService {

    VitalResponse recordVital(CreateVitalRequest request);

    VitalResponse updateVital(UUID id, UpdateVitalRequest request);

    void deleteVital(UUID id);

    VitalResponse getVitalById(UUID id);

    Page<VitalResponse> getVitals(MeasurementType type, Instant from, Instant to, Pageable pageable);

    VitalTrendResponse getVitalTrends(MeasurementType type, String period, Instant customStart, Instant customEnd);

    VitalDashboardSummaryResponse getDashboardSummary();

    Page<HealthAlertResponse> getAlerts(AlertStatus status, Pageable pageable);

    HealthAlertResponse acknowledgeAlert(UUID alertId);

    HealthAlertResponse markAlertRead(UUID alertId);

    long getUnreadAlertCount();
}
