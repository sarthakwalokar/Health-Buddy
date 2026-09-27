package com.healthbuddy.rules;

import com.healthbuddy.entity.AlertSeverity;
import com.healthbuddy.entity.HealthMeasurement;
import com.healthbuddy.entity.MeasurementType;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SpO2Rule implements HealthRule {

    @Override
    public boolean supports(MeasurementType type) {
        return type == MeasurementType.SPO2;
    }

    @Override
    public HealthRuleResult evaluate(HealthMeasurement current, List<HealthMeasurement> recentHistory) {
        if (current.getValueNumeric() == null) {
            return HealthRuleResult.notTriggered();
        }

        double spo2 = current.getValueNumeric().doubleValue();

        // 1. Critical Hypoxemia (<= 90%)
        if (spo2 <= 90.0) {
            return HealthRuleResult.of(
                    "CRITICAL_LOW_SPO2",
                    AlertSeverity.EMERGENCY,
                    "Critically Low Blood Oxygen Saturation",
                    String.format("Blood oxygen saturation was recorded at %.0f%%. Readings of 90%% or below require prompt professional assessment. If you are experiencing shortness of breath or fatigue, seek immediate medical care.", spo2)
            );
        }

        // 2. Below Expected Range (<= 94%)
        if (spo2 <= 94.0) {
            return HealthRuleResult.of(
                    "LOW_SPO2",
                    AlertSeverity.HIGH,
                    "Blood Oxygen Below Typical Baseline",
                    String.format("Blood oxygen saturation was recorded at %.0f%% (typical resting range is 95-100%%). Ensure proper sensor placement, rest, and discuss with a doctor if this persists.", spo2)
            );
        }

        return HealthRuleResult.notTriggered();
    }
}
