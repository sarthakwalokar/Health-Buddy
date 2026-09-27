package com.healthbuddy.service;

import com.healthbuddy.dto.request.CreateMedicationRequest;
import com.healthbuddy.dto.request.RecordDoseActionRequest;
import com.healthbuddy.dto.request.UpdateMedicationRequest;
import com.healthbuddy.dto.request.UpdateReminderSettingsRequest;
import com.healthbuddy.dto.response.*;
import com.healthbuddy.entity.DoseStatus;
import com.healthbuddy.entity.MedicationStatus;
import com.healthbuddy.entity.ReminderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.UUID;

public interface MedicationService {

    MedicationResponse createMedication(CreateMedicationRequest request);

    Page<MedicationResponse> getMedications(MedicationStatus status, String query, Pageable pageable);

    MedicationResponse getMedicationById(UUID id);

    MedicationResponse updateMedication(UUID id, UpdateMedicationRequest request);

    void deleteMedication(UUID id);

    MedicationResponse pauseMedication(UUID id);

    MedicationResponse resumeMedication(UUID id);

    MedicationResponse stopMedication(UUID id);

    MedicationResponse completeMedication(UUID id);

    Page<MedicationDoseResponse> getDoses(UUID medicationId, DoseStatus status, Instant from, Instant to, Pageable pageable);

    TodayMedicationsSummaryResponse getTodayDoses();

    MedicationDoseResponse markDoseTaken(UUID doseId, RecordDoseActionRequest request);

    MedicationDoseResponse markDoseSkipped(UUID doseId, RecordDoseActionRequest request);

    MedicationDoseResponse markDoseMissed(UUID doseId, RecordDoseActionRequest request);

    MedicationAdherenceResponse getAdherence(UUID medicationId, String period, Instant start, Instant end);

    Page<MedicationReminderResponse> getReminders(ReminderStatus status, Pageable pageable);

    MedicationReminderResponse markReminderRead(UUID id);

    MedicationResponse updateReminderSettings(UUID id, UpdateReminderSettingsRequest request);

    void generateDosesForActiveMedications();

    void processUpcomingReminders();

    void markOverdueDosesAsMissed();
}
