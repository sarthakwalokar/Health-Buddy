package com.healthbuddy.scheduler;

import com.healthbuddy.service.MedicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MedicationReminderScheduler {

    private final MedicationService medicationService;

    /**
     * Process upcoming doses and generate in-app reminders.
     * Runs every 2 minutes.
     */
    @Scheduled(fixedRate = 120000, initialDelay = 10000)
    public void scheduleUpcomingReminders() {
        try {
            medicationService.processUpcomingReminders();
        } catch (Exception e) {
            log.error("Error processing upcoming medication reminders: {}", e.getMessage());
        }
    }

    /**
     * Mark unrecorded overdue doses (passed window) as MISSED.
     * Runs every 30 minutes.
     */
    @Scheduled(fixedRate = 1800000, initialDelay = 30000)
    public void scheduleOverdueDoseCheck() {
        try {
            medicationService.markOverdueDosesAsMissed();
        } catch (Exception e) {
            log.error("Error marking overdue doses: {}", e.getMessage());
        }
    }

    /**
     * Generate rolling 7-day scheduled doses for all active medications.
     * Runs daily at midnight.
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void scheduleDailyDoseGeneration() {
        try {
            log.info("Running daily rolling dose generation for active medications");
            medicationService.generateDosesForActiveMedications();
        } catch (Exception e) {
            log.error("Error during daily dose generation: {}", e.getMessage());
        }
    }
}
