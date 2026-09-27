package com.healthbuddy.rules;

import com.healthbuddy.entity.AlertSeverity;
import com.healthbuddy.entity.HealthMeasurement;
import com.healthbuddy.entity.MeasurementType;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TemperatureRule implements HealthRule {

    @Override
    public boolean supports(MeasurementType type) {
        return type == MeasurementType.TEMPERATURE;
    }

    @Override
    public HealthRuleResult evaluate(HealthMeasurement current, List<HealthMeasurement> recentHistory) {
        if (current.getValueNumeric() == null) {
            return HealthRuleResult.notTriggered();
        }

        double temp = current.getValueNumeric().doubleValue();

        // 1. High Fever (>= 39.5 °C)
        if (temp >= 39.5) {
            return HealthRuleResult.of(
                    "HIGH_FEVER",
                    AlertSeverity.HIGH,
                    "High Body Temperature Recorded",
                    String.format("Body temperature was recorded at %.1f °C. High fever warrants clinical evaluation, rest, and adequate hydration. Seek urgent care if accompanied by severe headache, rash, or stiff neck.", temp)
            );
        }

        // 2. Fever (>= 38.0 °C)
        if (temp >= 38.0) {
            return HealthRuleResult.of(
                    "ELEVATED_TEMPERATURE",
                    AlertSeverity.MEDIUM,
                    "Elevated Body Temperature (Fever Range)",
                    String.format("Body temperature of %.1f °C indicates fever. Stay hydrated, monitor symptoms, and consult a physician if fever persists beyond 48 hours.", temp)
            );
        }

        // 3. Hypothermia (< 35.0 °C)
        if (temp < 35.0) {
            return HealthRuleResult.of(
                    "LOW_TEMPERATURE",
                    AlertSeverity.HIGH,
                    "Lower Than Normal Body Temperature",
                    String.format("Body temperature was recorded at %.1f °C (hypothermia range). Warm up gradually and seek medical evaluation if you feel confused, slurred speech, or uncontrollable shivering.", temp)
            );
        }

        return HealthRuleResult.notTriggered();
    }
}
