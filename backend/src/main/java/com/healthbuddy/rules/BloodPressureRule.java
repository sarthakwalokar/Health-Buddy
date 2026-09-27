package com.healthbuddy.rules;

import com.healthbuddy.entity.AlertSeverity;
import com.healthbuddy.entity.HealthMeasurement;
import com.healthbuddy.entity.MeasurementType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class BloodPressureRule implements HealthRule {

    @Override
    public boolean supports(MeasurementType type) {
        return type == MeasurementType.BLOOD_PRESSURE;
    }

    @Override
    public HealthRuleResult evaluate(HealthMeasurement current, List<HealthMeasurement> recentHistory) {
        if (current.getValueNumeric() == null || current.getSecondaryValueNumeric() == null) {
            return HealthRuleResult.notTriggered();
        }

        double systolic = current.getValueNumeric().doubleValue();
        double diastolic = current.getSecondaryValueNumeric().doubleValue();

        // 1. Critical Crisis Range
        if (systolic >= 180 || diastolic >= 120) {
            return HealthRuleResult.of(
                    "CRITICAL_BLOOD_PRESSURE",
                    AlertSeverity.EMERGENCY,
                    "Markedly Elevated Blood Pressure Reading",
                    String.format("A blood pressure reading of %.0f/%.0f mmHg was recorded. This reading may require prompt professional assessment. If you are experiencing concerning symptoms (such as chest discomfort, shortness of breath, or severe headache), please seek emergency medical evaluation.", systolic, diastolic)
            );
        }

        // 2. High Blood Pressure Range
        if (systolic >= 140 || diastolic >= 90) {
            // Check recent history for repeated elevation
            long elevatedRecentCount = recentHistory.stream()
                    .filter(m -> m.getMeasurementType() == MeasurementType.BLOOD_PRESSURE && m.getValueNumeric() != null && m.getSecondaryValueNumeric() != null)
                    .filter(m -> m.getValueNumeric().doubleValue() >= 140 || m.getSecondaryValueNumeric().doubleValue() >= 90)
                    .count();

            if (elevatedRecentCount >= 2) {
                return HealthRuleResult.of(
                        "REPEATED_ELEVATED_BP_TREND",
                        AlertSeverity.HIGH,
                        "Repeated Elevated Blood Pressure Trend",
                        String.format("Multiple consecutive blood pressure readings (latest: %.0f/%.0f mmHg) are above typical baseline limits. We recommend sharing this trend with your physician for routine clinical evaluation.", systolic, diastolic)
                );
            }

            return HealthRuleResult.of(
                    "ELEVATED_BLOOD_PRESSURE",
                    AlertSeverity.MEDIUM,
                    "Elevated Blood Pressure Reading",
                    String.format("A reading of %.0f/%.0f mmHg was recorded. Individual readings can vary due to physical activity or stress. Consider recording your blood pressure while resting at a regular time of day.", systolic, diastolic)
            );
        }

        // 3. Low Blood Pressure Range
        if (systolic < 90 || diastolic < 60) {
            return HealthRuleResult.of(
                    "LOW_BLOOD_PRESSURE",
                    AlertSeverity.LOW,
                    "Lower Than Expected Blood Pressure",
                    String.format("A blood pressure reading of %.0f/%.0f mmHg was recorded. If you experience dizziness or lightheadedness, consider discussing this with your healthcare provider.", systolic, diastolic)
            );
        }

        return HealthRuleResult.notTriggered();
    }
}
