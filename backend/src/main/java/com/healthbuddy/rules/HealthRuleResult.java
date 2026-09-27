package com.healthbuddy.rules;

import com.healthbuddy.entity.AlertSeverity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthRuleResult {
    private boolean triggered;
    private String alertType;
    private AlertSeverity severity;
    private String title;
    private String message;

    public static HealthRuleResult notTriggered() {
        return HealthRuleResult.builder().triggered(false).build();
    }

    public static HealthRuleResult of(String alertType, AlertSeverity severity, String title, String message) {
        return HealthRuleResult.builder()
                .triggered(true)
                .alertType(alertType)
                .severity(severity)
                .title(title)
                .message(message)
                .build();
    }
}
