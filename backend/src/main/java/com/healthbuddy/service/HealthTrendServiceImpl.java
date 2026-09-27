package com.healthbuddy.service;

import com.healthbuddy.dto.response.*;
import com.healthbuddy.entity.*;
import com.healthbuddy.mapper.VitalMapper;
import com.healthbuddy.repository.HealthAlertRepository;
import com.healthbuddy.repository.HealthMeasurementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class HealthTrendServiceImpl implements HealthTrendService {

    private final HealthMeasurementRepository measurementRepository;
    private final HealthAlertRepository alertRepository;
    private final VitalMapper vitalMapper;

    @Override
    @Transactional(readOnly = true)
    public VitalTrendResponse calculateTrend(PatientProfile patient, MeasurementType type, String period, Instant customStart, Instant customEnd) {
        Instant now = Instant.now();
        Instant startTime;
        Instant endTime = (customEnd != null) ? customEnd : now;

        if (customStart != null) {
            startTime = customStart;
        } else {
            String periodKey = (period != null && !period.isBlank()) ? period.toUpperCase().trim() : "30_DAYS";
            startTime = switch (periodKey) {
                case "7_DAYS" -> now.minus(7, ChronoUnit.DAYS);
                case "90_DAYS" -> now.minus(90, ChronoUnit.DAYS);
                case "6_MONTHS" -> now.minus(180, ChronoUnit.DAYS);
                case "1_YEAR" -> now.minus(365, ChronoUnit.DAYS);
                case "ALL" -> Instant.EPOCH;
                default -> now.minus(30, ChronoUnit.DAYS); // 30_DAYS default
            };
        }

        List<HealthMeasurement> measurements = measurementRepository
                .findByPatientAndMeasurementTypeAndMeasurementTimeBetweenOrderByMeasurementTimeAsc(
                        patient, type, startTime, endTime);

        String unit = vitalMapper.resolveDefaultUnit(type, null);
        if (!measurements.isEmpty() && measurements.get(0).getUnit() != null) {
            unit = measurements.get(0).getUnit();
        }

        if (measurements.isEmpty()) {
            return VitalTrendResponse.builder()
                    .measurementType(type)
                    .unit(unit)
                    .period(period != null ? period : "30_DAYS")
                    .totalReadings(0)
                    .descriptiveSummary("No health measurements recorded for this time period.")
                    .dataPoints(Collections.emptyList())
                    .build();
        }

        List<VitalTrendDataPoint> dataPoints = new ArrayList<>();
        double sum = 0.0;
        double min = Double.MAX_VALUE;
        double max = -Double.MAX_VALUE;

        double secondarySum = 0.0;
        double secondaryMin = Double.MAX_VALUE;
        double secondaryMax = -Double.MAX_VALUE;
        boolean hasSecondary = (type == MeasurementType.BLOOD_PRESSURE);

        for (HealthMeasurement m : measurements) {
            dataPoints.add(VitalTrendDataPoint.builder()
                    .timestamp(m.getMeasurementTime())
                    .value(m.getValueNumeric())
                    .secondaryValue(m.getSecondaryValueNumeric())
                    .context(m.getMeasurementContext())
                    .build());

            if (m.getValueNumeric() != null) {
                double val = m.getValueNumeric().doubleValue();
                sum += val;
                if (val < min) min = val;
                if (val > max) max = val;
            }

            if (hasSecondary && m.getSecondaryValueNumeric() != null) {
                double secVal = m.getSecondaryValueNumeric().doubleValue();
                secondarySum += secVal;
                if (secVal < secondaryMin) secondaryMin = secVal;
                if (secVal > secondaryMax) secondaryMax = secVal;
            }
        }

        int count = measurements.size();
        BigDecimal avgVal = BigDecimal.valueOf(sum / count).setScale(1, RoundingMode.HALF_UP);
        BigDecimal minVal = BigDecimal.valueOf(min).setScale(1, RoundingMode.HALF_UP);
        BigDecimal maxVal = BigDecimal.valueOf(max).setScale(1, RoundingMode.HALF_UP);

        BigDecimal latestVal = measurements.get(count - 1).getValueNumeric();
        BigDecimal latestSecVal = measurements.get(count - 1).getSecondaryValueNumeric();

        BigDecimal change = null;
        if (count >= 2 && measurements.get(0).getValueNumeric() != null && latestVal != null) {
            change = latestVal.subtract(measurements.get(0).getValueNumeric()).setScale(1, RoundingMode.HALF_UP);
        }

        BigDecimal avgSecVal = null;
        BigDecimal minSecVal = null;
        BigDecimal maxSecVal = null;
        if (hasSecondary && secondaryMin != Double.MAX_VALUE) {
            avgSecVal = BigDecimal.valueOf(secondarySum / count).setScale(1, RoundingMode.HALF_UP);
            minSecVal = BigDecimal.valueOf(secondaryMin).setScale(1, RoundingMode.HALF_UP);
            maxSecVal = BigDecimal.valueOf(secondaryMax).setScale(1, RoundingMode.HALF_UP);
        }

        String summary = generateDescriptiveSummary(type, unit, period, count, avgVal, avgSecVal, change, minVal, maxVal);

        return VitalTrendResponse.builder()
                .measurementType(type)
                .unit(unit)
                .period(period != null ? period : "30_DAYS")
                .latestValue(latestVal)
                .latestSecondaryValue(latestSecVal)
                .minValue(minVal)
                .maxValue(maxVal)
                .averageValue(avgVal)
                .minSecondaryValue(minSecVal)
                .maxSecondaryValue(maxSecVal)
                .averageSecondaryValue(avgSecVal)
                .changeFromPreviousPeriod(change)
                .descriptiveSummary(summary)
                .totalReadings(count)
                .dataPoints(dataPoints)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public VitalDashboardSummaryResponse getDashboardSummary(PatientProfile patient) {
        Map<MeasurementType, VitalSummaryItem> vitalsMap = new HashMap<>();

        MeasurementType[] coreTypes = new MeasurementType[]{
                MeasurementType.BLOOD_PRESSURE,
                MeasurementType.HEART_RATE,
                MeasurementType.BLOOD_GLUCOSE,
                MeasurementType.SPO2,
                MeasurementType.TEMPERATURE,
                MeasurementType.WEIGHT
        };

        for (MeasurementType type : coreTypes) {
            List<HealthMeasurement> latestTwo = measurementRepository
                    .findTop10ByPatientAndMeasurementTypeOrderByMeasurementTimeDesc(patient, type);

            if (!latestTwo.isEmpty()) {
                HealthMeasurement latest = latestTwo.get(0);
                VitalResponse latestResp = vitalMapper.toVitalResponse(latest);

                BigDecimal previousVal = (latestTwo.size() > 1 && latestTwo.get(1).getValueNumeric() != null)
                        ? latestTwo.get(1).getValueNumeric() : null;

                BigDecimal change = null;
                if (previousVal != null && latest.getValueNumeric() != null) {
                    change = latest.getValueNumeric().subtract(previousVal).setScale(1, RoundingMode.HALF_UP);
                }

                String statusNote = formatStatusNote(type, latest);

                vitalsMap.put(type, VitalSummaryItem.builder()
                        .measurementType(type)
                        .latestReading(latestResp)
                        .previousValue(previousVal)
                        .change(change)
                        .statusNote(statusNote)
                        .build());
            }
        }

        VitalResponse latestBmi = measurementRepository
                .findFirstByPatientAndMeasurementTypeOrderByMeasurementTimeDesc(patient, MeasurementType.BMI)
                .map(vitalMapper::toVitalResponse)
                .orElse(null);

        long unreadAlerts = alertRepository.countByPatientAndStatus(patient, AlertStatus.UNREAD);
        long totalMeasurements = measurementRepository.countByPatient(patient);

        return VitalDashboardSummaryResponse.builder()
                .vitals(vitalsMap)
                .latestBmi(latestBmi)
                .unreadAlertsCount(unreadAlerts)
                .totalMeasurementsRecorded(totalMeasurements)
                .build();
    }

    private String generateDescriptiveSummary(MeasurementType type, String unit, String period, int count,
                                              BigDecimal avgVal, BigDecimal avgSecVal, BigDecimal change,
                                              BigDecimal minVal, BigDecimal maxVal) {
        String periodText = switch (period != null ? period.toUpperCase().trim() : "30_DAYS") {
            case "7_DAYS" -> "the last 7 days";
            case "90_DAYS" -> "the last 90 days";
            case "6_MONTHS" -> "the last 6 months";
            case "1_YEAR" -> "the last year";
            case "ALL" -> "all recorded history";
            default -> "the last 30 days";
        };

        if (type == MeasurementType.BLOOD_PRESSURE && avgSecVal != null) {
            return String.format("Over %s, your average blood pressure was %.0f/%.0f %s across %d recorded measurements.",
                    periodText, avgVal.doubleValue(), avgSecVal.doubleValue(), unit, count);
        }

        if (type == MeasurementType.WEIGHT && change != null) {
            String direction = change.doubleValue() >= 0 ? "an increase" : "a decrease";
            return String.format("Over %s, your weight showed %s of %.1f %s across %d measurements (min: %.1f %s, max: %.1f %s).",
                    periodText, direction, Math.abs(change.doubleValue()), unit, count, minVal.doubleValue(), unit, maxVal.doubleValue(), unit);
        }

        return String.format("Over %s, your average %s was %.1f %s across %d recordings (range: %.1f - %.1f %s).",
                periodText, formatTypeName(type), avgVal.doubleValue(), unit, count, minVal.doubleValue(), maxVal.doubleValue(), unit);
    }

    private String formatTypeName(MeasurementType type) {
        return switch (type) {
            case BLOOD_PRESSURE -> "blood pressure";
            case HEART_RATE -> "heart rate";
            case BLOOD_GLUCOSE -> "blood glucose";
            case TEMPERATURE -> "body temperature";
            case SPO2 -> "oxygen saturation (SpO2)";
            case WEIGHT -> "weight";
            case HEIGHT -> "height";
            case BMI -> "Body Mass Index";
        };
    }

    private String formatStatusNote(MeasurementType type, HealthMeasurement latest) {
        if (latest.getMeasurementTime() == null) {
            return "Recorded";
        }
        long daysAgo = ChronoUnit.DAYS.between(latest.getMeasurementTime(), Instant.now());
        if (daysAgo == 0) return "Recorded today";
        if (daysAgo == 1) return "Recorded yesterday";
        return String.format("Recorded %d days ago", daysAgo);
    }
}
