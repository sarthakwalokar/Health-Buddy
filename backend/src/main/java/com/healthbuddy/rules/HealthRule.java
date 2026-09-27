package com.healthbuddy.rules;

import com.healthbuddy.entity.HealthMeasurement;
import com.healthbuddy.entity.MeasurementType;

import java.util.List;

public interface HealthRule {
    boolean supports(MeasurementType type);
    HealthRuleResult evaluate(HealthMeasurement current, List<HealthMeasurement> recentHistory);
}
