package com.healthbuddy.rules;

import com.healthbuddy.entity.AlertSeverity;
import com.healthbuddy.entity.HealthMeasurement;
import com.healthbuddy.entity.MeasurementType;
import org.springframework.stereotype.Component;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Component
public class WeightTrendRule implements HealthRule {

    @Override
    public boolean supports(MeasurementType type) {
        return type == MeasurementType.WEIGHT;
    }

    @Override
    public HealthRuleResult evaluate(HealthMeasurement current, List<HealthMeasurement> recentHistory) {
        if (current.getValueNumeric() == null || recentHistory.isEmpty()) {
            return HealthRuleResult.notTriggered();
        }

        double currentWeight = current.getValueNumeric().doubleValue();

        // Find a previous weight reading within the last 7 to 14 days
        Optional<HealthMeasurement> previousWeightOpt = recentHistory.stream()
                .filter(m -> m.getMeasurementType() == MeasurementType.WEIGHT && m.getValueNumeric() != null)
                .filter(m -> !m.getId().equals(current.getId()))
                .filter(m -> ChronoUnit.DAYS.between(m.getMeasurementTime(), current.getMeasurementTime()) <= 14
                        && ChronoUnit.DAYS.between(m.getMeasurementTime(), current.getMeasurementTime()) >= 1)
                .findFirst();

        if (previousWeightOpt.isPresent()) {
            double prevWeight = previousWeightOpt.get().getValueNumeric().doubleValue();
            double diff = currentWeight - prevWeight;

            // Rapid weight gain or loss > 3.0 kg in short period
            if (Math.abs(diff) >= 3.0) {
                String direction = diff > 0 ? "gain" : "loss";
                return HealthRuleResult.of(
                        "RAPID_WEIGHT_CHANGE",
                        AlertSeverity.MEDIUM,
                        "Notable Rapid Weight Change Detected",
                        String.format("A weight %s of %.1f kg was observed over the last %d days (from %.1f kg to %.1f kg). Rapid shifts can be related to fluid balance. Consider discussing this trend with your physician if unintentional.",
                                direction, Math.abs(diff),
                                Math.max(1, ChronoUnit.DAYS.between(previousWeightOpt.get().getMeasurementTime(), current.getMeasurementTime())),
                                prevWeight, currentWeight)
                );
            }
        }

        return HealthRuleResult.notTriggered();
    }
}
