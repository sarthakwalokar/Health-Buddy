package com.healthbuddy.rules;

import com.healthbuddy.entity.AlertSeverity;
import com.healthbuddy.entity.HealthMeasurement;
import com.healthbuddy.entity.MeasurementType;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class HeartRateRule implements HealthRule {

    @Override
    public boolean supports(MeasurementType type) {
        return type == MeasurementType.HEART_RATE;
    }

    @Override
    public HealthRuleResult evaluate(HealthMeasurement current, List<HealthMeasurement> recentHistory) {
        if (current.getValueNumeric() == null) {
            return HealthRuleResult.notTriggered();
        }

        double hr = current.getValueNumeric().doubleValue();

        // 1. Extreme Tachycardia (> 140 bpm at rest)
        if (hr > 140.0) {
            return HealthRuleResult.of(
                    "MARKER_TACHYCARDIA",
                    AlertSeverity.HIGH,
                    "Markedly Elevated Resting Heart Rate",
                    String.format("A resting heart rate of %.0f bpm was recorded. If you are experiencing palpitations, chest discomfort, or dizziness, seek medical assessment.", hr)
            );
        }

        // 2. Elevated Heart Rate (> 100 bpm)
        if (hr > 100.0) {
            return HealthRuleResult.of(
                    "ELEVATED_HEART_RATE",
                    AlertSeverity.MEDIUM,
                    "Elevated Heart Rate Detected",
                    String.format("Heart rate was recorded at %.0f bpm. Resting heart rates can be temporarily elevated after exercise, caffeine, or stress.", hr)
            );
        }

        // 3. Bradycardia (< 50 bpm)
        if (hr < 50.0) {
            return HealthRuleResult.of(
                    "LOW_HEART_RATE",
                    AlertSeverity.LOW,
                    "Lower Than Expected Heart Rate",
                    String.format("Heart rate was recorded at %.0f bpm. While well-conditioned athletes may have resting heart rates below 50 bpm, consider consulting your doctor if accompanied by fatigue or lightheadedness.", hr)
            );
        }

        return HealthRuleResult.notTriggered();
    }
}
