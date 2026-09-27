package com.healthbuddy.rules;

import com.healthbuddy.entity.AlertSeverity;
import com.healthbuddy.entity.HealthMeasurement;
import com.healthbuddy.entity.MeasurementContext;
import com.healthbuddy.entity.MeasurementType;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BloodGlucoseRule implements HealthRule {

    @Override
    public boolean supports(MeasurementType type) {
        return type == MeasurementType.BLOOD_GLUCOSE;
    }

    @Override
    public HealthRuleResult evaluate(HealthMeasurement current, List<HealthMeasurement> recentHistory) {
        if (current.getValueNumeric() == null) {
            return HealthRuleResult.notTriggered();
        }

        double glucose = current.getValueNumeric().doubleValue();
        MeasurementContext context = current.getMeasurementContext();

        // 1. Hypoglycemia (< 70 mg/dL)
        if (glucose < 70) {
            return HealthRuleResult.of(
                    "LOW_BLOOD_GLUCOSE",
                    AlertSeverity.HIGH,
                    "Low Blood Glucose Reading Detected",
                    String.format("A glucose reading of %.1f mg/dL is below the typical fasting threshold (70 mg/dL). If you feel shaky, dizzy, or confused, consume fast-acting carbohydrates and seek clinical guidance if symptoms persist.", glucose)
            );
        }

        // 2. Markedly High Glucose (> 300 mg/dL)
        if (glucose >= 300) {
            return HealthRuleResult.of(
                    "CRITICAL_HIGH_BLOOD_GLUCOSE",
                    AlertSeverity.EMERGENCY,
                    "Markedly High Blood Glucose Level",
                    String.format("A blood glucose reading of %.1f mg/dL was recorded. This reading may require prompt clinical evaluation. Please review with your doctor or diabetes care team.", glucose)
            );
        }

        // 3. Fasting Glucose Elevation (>= 126 mg/dL when FASTING)
        if (context == MeasurementContext.FASTING && glucose >= 126) {
            return HealthRuleResult.of(
                    "ELEVATED_FASTING_GLUCOSE",
                    AlertSeverity.MEDIUM,
                    "Elevated Fasting Blood Glucose",
                    String.format("Fasting blood glucose was recorded at %.1f mg/dL. Fasting measurements above 100-125 mg/dL warrant monitoring and routine review with a physician.", glucose)
            );
        }

        // 4. Post-Meal or Random Glucose Elevation (>= 200 mg/dL)
        if (glucose >= 200) {
            return HealthRuleResult.of(
                    "ELEVATED_POST_MEAL_GLUCOSE",
                    AlertSeverity.MEDIUM,
                    "Elevated Blood Glucose Level",
                    String.format("Blood glucose was recorded at %.1f mg/dL. Consider monitoring your daily dietary intake and discussing persistent elevations with your healthcare provider.", glucose)
            );
        }

        return HealthRuleResult.notTriggered();
    }
}
