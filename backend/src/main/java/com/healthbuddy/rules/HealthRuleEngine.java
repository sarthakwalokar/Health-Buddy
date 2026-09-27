package com.healthbuddy.rules;

import com.healthbuddy.entity.HealthMeasurement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class HealthRuleEngine {

    private final List<HealthRule> rules;

    public List<HealthRuleResult> evaluate(HealthMeasurement measurement, List<HealthMeasurement> recentHistory) {
        List<HealthRuleResult> triggeredResults = new ArrayList<>();

        for (HealthRule rule : rules) {
            if (rule.supports(measurement.getMeasurementType())) {
                try {
                    HealthRuleResult result = rule.evaluate(measurement, recentHistory);
                    if (result != null && result.isTriggered()) {
                        triggeredResults.add(result);
                    }
                } catch (Exception e) {
                    log.error("Error evaluating rule {} for measurement {}: {}",
                            rule.getClass().getSimpleName(), measurement.getId(), e.getMessage(), e);
                }
            }
        }

        return triggeredResults;
    }
}
