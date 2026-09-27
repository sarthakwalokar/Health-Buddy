package com.healthbuddy.service;

import com.healthbuddy.dto.request.CreateMedicationRequest;
import com.healthbuddy.dto.request.MedicationScheduleRequest;
import com.healthbuddy.dto.request.RecordDoseActionRequest;
import com.healthbuddy.dto.request.UpdateMedicationRequest;
import com.healthbuddy.dto.request.UpdateReminderSettingsRequest;
import com.healthbuddy.dto.response.*;
import com.healthbuddy.entity.*;
import com.healthbuddy.exception.AppException;
import com.healthbuddy.exception.ResourceNotFoundException;
import com.healthbuddy.mapper.MedicationMapper;
import com.healthbuddy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import com.healthbuddy.security.SecurityUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicationServiceImpl implements MedicationService {

    private final MedicationRepository medicationRepository;
    private final MedicationScheduleRepository medicationScheduleRepository;
    private final MedicationDoseRepository medicationDoseRepository;
    private final MedicationReminderRepository medicationReminderRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;
    private final MedicationMapper medicationMapper;
    private final AuditLogService auditLogService;

    private static final ZoneId DEFAULT_ZONE = ZoneId.systemDefault();

    @Override
    @Transactional
    public MedicationResponse createMedication(CreateMedicationRequest request) {
        PatientProfile patient = getCurrentPatient();
        validateCreateRequest(request);

        Medication medication = medicationMapper.toEntity(request, patient);
        medication = medicationRepository.save(medication);

        // Save schedules
        List<MedicationSchedule> schedules = new ArrayList<>();
        if (request.getSchedules() != null && !request.getSchedules().isEmpty()) {
            for (MedicationScheduleRequest schedReq : request.getSchedules()) {
                MedicationSchedule schedule = medicationMapper.toScheduleEntity(schedReq, medication);
                schedules.add(medicationScheduleRepository.save(schedule));
            }
        } else {
            // Generate default schedules from frequencyType
            schedules = createDefaultSchedules(medication);
        }
        medication.setSchedules(schedules);

        // Generate immediate upcoming doses for this active medication
        generateDosesForMedication(medication, LocalDate.now(), LocalDate.now().plusDays(7));

        auditLogService.logEvent(
                patient.getUser().getId(),
                patient.getUser().getEmail(),
                "MEDICATION_CREATED",
                "Medication",
                "SUCCESS",
                null,
                null,
                "Medication added: " + medication.getMedicineName()
        );

        Instant nextDose = findNextScheduledDose(medication);
        return medicationMapper.toMedicationResponse(medication, nextDose, 100.0);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MedicationResponse> getMedications(MedicationStatus status, String query, Pageable pageable) {
        PatientProfile patient = getCurrentPatient();
        Page<Medication> medsPage;

        if (query != null && !query.trim().isEmpty()) {
            medsPage = medicationRepository.searchMedicationsWithQuery(patient, status, query.trim(), pageable);
        } else if (status != null) {
            medsPage = medicationRepository.findByPatientAndStatusOrderByCreatedAtDesc(patient, status, pageable);
        } else {
            medsPage = medicationRepository.findByPatientOrderByCreatedAtDesc(patient, pageable);
        }

        List<MedicationResponse> responses = medsPage.getContent().stream()
                .map(med -> {
                    Instant nextDose = findNextScheduledDose(med);
                    Double adherence = calculateMedicationAdherence(med, Instant.now().minus(30, ChronoUnit.DAYS), Instant.now());
                    return medicationMapper.toMedicationResponse(med, nextDose, adherence);
                })
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, medsPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public MedicationResponse getMedicationById(UUID id) {
        PatientProfile patient = getCurrentPatient();
        Medication medication = medicationRepository.findByIdAndPatient(id, patient)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found with id: " + id));

        Instant nextDose = findNextScheduledDose(medication);
        Double adherence = calculateMedicationAdherence(medication, Instant.now().minus(30, ChronoUnit.DAYS), Instant.now());
        return medicationMapper.toMedicationResponse(medication, nextDose, adherence);
    }

    @Override
    @Transactional
    public MedicationResponse updateMedication(UUID id, UpdateMedicationRequest request) {
        PatientProfile patient = getCurrentPatient();
        Medication medication = medicationRepository.findByIdAndPatient(id, patient)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found with id: " + id));

        medication.setMedicineName(request.getMedicineName().trim());
        medication.setGenericName(request.getGenericName() != null ? request.getGenericName().trim() : null);
        medication.setStrength(request.getStrength() != null ? request.getStrength().trim() : null);
        medication.setDosageAmount(request.getDosageAmount());
        medication.setDosageUnit(request.getDosageUnit() != null ? request.getDosageUnit().trim() : null);
        if (request.getRoute() != null) medication.setRoute(request.getRoute());
        if (request.getFrequencyType() != null) medication.setFrequencyType(request.getFrequencyType());
        medication.setFrequencyValue(request.getFrequencyValue() != null ? request.getFrequencyValue().trim() : null);
        medication.setStartDate(request.getStartDate());
        medication.setEndDate(request.getEndDate());
        medication.setInstructions(request.getInstructions() != null ? request.getInstructions().trim() : null);
        medication.setReason(request.getReason() != null ? request.getReason().trim() : null);
        medication.setPrescribedBy(request.getPrescribedBy() != null ? request.getPrescribedBy().trim() : null);
        if (request.getStatus() != null) medication.setStatus(request.getStatus());
        if (request.getReminderEnabled() != null) medication.setReminderEnabled(request.getReminderEnabled());
        if (request.getReminderMinutesBefore() != null) medication.setReminderMinutesBefore(request.getReminderMinutesBefore());
        medication.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        // Update schedules if provided
        if (request.getSchedules() != null) {
            medicationScheduleRepository.deleteByMedication(medication);
            List<MedicationSchedule> newSchedules = new ArrayList<>();
            for (MedicationScheduleRequest schedReq : request.getSchedules()) {
                MedicationSchedule schedule = medicationMapper.toScheduleEntity(schedReq, medication);
                newSchedules.add(medicationScheduleRepository.save(schedule));
            }
            medication.setSchedules(newSchedules);
        }

        medication = medicationRepository.save(medication);

        if (medication.getStatus() == MedicationStatus.ACTIVE) {
            generateDosesForMedication(medication, LocalDate.now(), LocalDate.now().plusDays(7));
        }

        auditLogService.logEvent(
                patient.getUser().getId(),
                patient.getUser().getEmail(),
                "MEDICATION_UPDATED",
                "Medication",
                "SUCCESS",
                null,
                null,
                "Medication updated: " + medication.getMedicineName()
        );

        Instant nextDose = findNextScheduledDose(medication);
        Double adherence = calculateMedicationAdherence(medication, Instant.now().minus(30, ChronoUnit.DAYS), Instant.now());
        return medicationMapper.toMedicationResponse(medication, nextDose, adherence);
    }

    @Override
    @Transactional
    public void deleteMedication(UUID id) {
        PatientProfile patient = getCurrentPatient();
        Medication medication = medicationRepository.findByIdAndPatient(id, patient)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found with id: " + id));

        medicationRepository.delete(medication);

        auditLogService.logEvent(
                patient.getUser().getId(),
                patient.getUser().getEmail(),
                "MEDICATION_DELETED",
                "Medication",
                "SUCCESS",
                null,
                null,
                "Medication deleted id: " + id
        );
    }

    @Override
    @Transactional
    public MedicationResponse pauseMedication(UUID id) {
        return changeMedicationStatus(id, MedicationStatus.PAUSED, "MEDICATION_PAUSED");
    }

    @Override
    @Transactional
    public MedicationResponse resumeMedication(UUID id) {
        MedicationResponse response = changeMedicationStatus(id, MedicationStatus.ACTIVE, "MEDICATION_RESUMED");
        PatientProfile patient = getCurrentPatient();
        Medication medication = medicationRepository.findByIdAndPatient(id, patient).orElse(null);
        if (medication != null) {
            generateDosesForMedication(medication, LocalDate.now(), LocalDate.now().plusDays(7));
        }
        return response;
    }

    @Override
    @Transactional
    public MedicationResponse stopMedication(UUID id) {
        return changeMedicationStatus(id, MedicationStatus.STOPPED, "MEDICATION_STOPPED");
    }

    @Override
    @Transactional
    public MedicationResponse completeMedication(UUID id) {
        return changeMedicationStatus(id, MedicationStatus.COMPLETED, "MEDICATION_COMPLETED");
    }

    private MedicationResponse changeMedicationStatus(UUID id, MedicationStatus newStatus, String auditAction) {
        PatientProfile patient = getCurrentPatient();
        Medication medication = medicationRepository.findByIdAndPatient(id, patient)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found with id: " + id));

        medication.setStatus(newStatus);
        medication = medicationRepository.save(medication);

        if (newStatus == MedicationStatus.PAUSED || newStatus == MedicationStatus.STOPPED || newStatus == MedicationStatus.COMPLETED) {
            // Cancel future scheduled doses
            List<MedicationDose> futureDoses = medicationDoseRepository.findByMedicationAndScheduledAtBetweenOrderByScheduledAtAsc(
                    medication, Instant.now(), Instant.now().plus(60, ChronoUnit.DAYS));
            for (MedicationDose dose : futureDoses) {
                if (dose.getStatus() == DoseStatus.SCHEDULED) {
                    dose.setStatus(DoseStatus.CANCELLED);
                    medicationDoseRepository.save(dose);
                }
            }
        }

        auditLogService.logEvent(
                patient.getUser().getId(),
                patient.getUser().getEmail(),
                auditAction,
                "Medication",
                "SUCCESS",
                null,
                null,
                "Medication status changed to " + newStatus + " for " + medication.getMedicineName()
        );

        Instant nextDose = findNextScheduledDose(medication);
        Double adherence = calculateMedicationAdherence(medication, Instant.now().minus(30, ChronoUnit.DAYS), Instant.now());
        return medicationMapper.toMedicationResponse(medication, nextDose, adherence);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MedicationDoseResponse> getDoses(UUID medicationId, DoseStatus status, Instant from, Instant to, Pageable pageable) {
        PatientProfile patient = getCurrentPatient();
        Page<MedicationDose> dosesPage = medicationDoseRepository.searchDoses(patient, medicationId, status, from, to, pageable);
        return dosesPage.map(medicationMapper::toDoseResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public TodayMedicationsSummaryResponse getTodayDoses() {
        PatientProfile patient = getCurrentPatient();
        LocalDate today = LocalDate.now();
        Instant startOfDay = today.atStartOfDay(DEFAULT_ZONE).toInstant();
        Instant endOfDay = today.plusDays(1).atStartOfDay(DEFAULT_ZONE).toInstant().minusNanos(1);

        List<MedicationDose> todayDoses = medicationDoseRepository
                .findByPatientAndScheduledAtBetweenOrderByScheduledAtAsc(patient, startOfDay, endOfDay);

        long totalScheduled = todayDoses.size();
        long taken = todayDoses.stream().filter(d -> d.getStatus() == DoseStatus.TAKEN).count();
        long missed = todayDoses.stream().filter(d -> d.getStatus() == DoseStatus.MISSED).count();
        long skipped = todayDoses.stream().filter(d -> d.getStatus() == DoseStatus.SKIPPED).count();
        long upcoming = todayDoses.stream().filter(d -> d.getStatus() == DoseStatus.SCHEDULED).count();

        long activeMedsCount = medicationRepository.countByPatientAndStatus(patient, MedicationStatus.ACTIVE);
        double overallAdherence = calculatePatientAdherenceRate(patient, Instant.now().minus(30, ChronoUnit.DAYS), Instant.now());

        return TodayMedicationsSummaryResponse.builder()
                .totalScheduledToday(totalScheduled)
                .takenToday(taken)
                .upcomingToday(upcoming)
                .missedToday(missed)
                .skippedToday(skipped)
                .doses(todayDoses.stream().map(medicationMapper::toDoseResponse).collect(Collectors.toList()))
                .overallAdherenceRate(overallAdherence)
                .activeMedicationsCount(activeMedsCount)
                .build();
    }

    @Override
    @Transactional
    public MedicationDoseResponse markDoseTaken(UUID doseId, RecordDoseActionRequest request) {
        PatientProfile patient = getCurrentPatient();
        MedicationDose dose = medicationDoseRepository.findByIdAndPatient(doseId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("Medication dose not found with id: " + doseId));

        dose.setStatus(DoseStatus.TAKEN);
        dose.setTakenAt(request != null && request.getTakenAt() != null ? request.getTakenAt() : Instant.now());
        if (request != null && request.getNotes() != null) {
            dose.setNotes(request.getNotes().trim());
        }
        dose = medicationDoseRepository.save(dose);

        auditLogService.logEvent(
                patient.getUser().getId(),
                patient.getUser().getEmail(),
                "MEDICATION_DOSE_TAKEN",
                "MedicationDose",
                "SUCCESS",
                null,
                null,
                "Dose marked as TAKEN for " + dose.getMedication().getMedicineName()
        );

        return medicationMapper.toDoseResponse(dose);
    }

    @Override
    @Transactional
    public MedicationDoseResponse markDoseSkipped(UUID doseId, RecordDoseActionRequest request) {
        PatientProfile patient = getCurrentPatient();
        MedicationDose dose = medicationDoseRepository.findByIdAndPatient(doseId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("Medication dose not found with id: " + doseId));

        dose.setStatus(DoseStatus.SKIPPED);
        if (request != null && request.getNotes() != null) {
            dose.setNotes(request.getNotes().trim());
        }
        dose = medicationDoseRepository.save(dose);

        auditLogService.logEvent(
                patient.getUser().getId(),
                patient.getUser().getEmail(),
                "MEDICATION_DOSE_SKIPPED",
                "MedicationDose",
                "SUCCESS",
                null,
                null,
                "Dose marked as SKIPPED for " + dose.getMedication().getMedicineName()
        );

        return medicationMapper.toDoseResponse(dose);
    }

    @Override
    @Transactional
    public MedicationDoseResponse markDoseMissed(UUID doseId, RecordDoseActionRequest request) {
        PatientProfile patient = getCurrentPatient();
        MedicationDose dose = medicationDoseRepository.findByIdAndPatient(doseId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("Medication dose not found with id: " + doseId));

        dose.setStatus(DoseStatus.MISSED);
        if (request != null && request.getNotes() != null) {
            dose.setNotes(request.getNotes().trim());
        }
        dose = medicationDoseRepository.save(dose);

        auditLogService.logEvent(
                patient.getUser().getId(),
                patient.getUser().getEmail(),
                "MEDICATION_DOSE_MISSED",
                "MedicationDose",
                "SUCCESS",
                null,
                null,
                "Dose marked as MISSED for " + dose.getMedication().getMedicineName()
        );

        return medicationMapper.toDoseResponse(dose);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicationAdherenceResponse getAdherence(UUID medicationId, String period, Instant start, Instant end) {
        PatientProfile patient = getCurrentPatient();

        int days = 30;
        if ("7_DAYS".equalsIgnoreCase(period)) days = 7;
        else if ("90_DAYS".equalsIgnoreCase(period)) days = 90;
        else if ("6_MONTHS".equalsIgnoreCase(period)) days = 180;
        else if ("1_YEAR".equalsIgnoreCase(period)) days = 365;

        Instant startTime = start != null ? start : Instant.now().minus(days, ChronoUnit.DAYS);
        Instant endTime = end != null ? end : Instant.now();

        List<Medication> targetMeds;
        if (medicationId != null) {
            Medication med = medicationRepository.findByIdAndPatient(medicationId, patient)
                    .orElseThrow(() -> new ResourceNotFoundException("Medication not found with id: " + medicationId));
            targetMeds = Collections.singletonList(med);
        } else {
            targetMeds = medicationRepository.findByPatientOrderByCreatedAtDesc(patient);
        }

        List<MedicationAdherenceSummary> summaries = new ArrayList<>();
        long totalScheduled = 0;
        long totalTaken = 0;
        long totalSkipped = 0;
        long totalMissed = 0;

        for (Medication med : targetMeds) {
            List<MedicationDose> medDoses = medicationDoseRepository
                    .findByMedicationAndScheduledAtBetweenOrderByScheduledAtAsc(med, startTime, endTime);

            long sched = medDoses.size();
            long taken = medDoses.stream().filter(d -> d.getStatus() == DoseStatus.TAKEN).count();
            long skip = medDoses.stream().filter(d -> d.getStatus() == DoseStatus.SKIPPED).count();
            long miss = medDoses.stream().filter(d -> d.getStatus() == DoseStatus.MISSED).count();

            long applicable = taken + skip + miss;
            double pct = applicable > 0 ? (taken * 100.0) / applicable : 100.0;
            pct = Math.round(pct * 10.0) / 10.0;

            summaries.add(MedicationAdherenceSummary.builder()
                    .medicationId(med.getId())
                    .medicineName(med.getMedicineName())
                    .strength(med.getStrength())
                    .scheduledDoses(sched)
                    .takenDoses(taken)
                    .skippedDoses(skip)
                    .missedDoses(miss)
                    .adherencePercentage(pct)
                    .build());

            totalScheduled += sched;
            totalTaken += taken;
            totalSkipped += skip;
            totalMissed += miss;
        }

        long overallApplicable = totalTaken + totalSkipped + totalMissed;
        double overallPct = overallApplicable > 0 ? (totalTaken * 100.0) / overallApplicable : (totalScheduled > 0 ? 0.0 : 100.0);
        overallPct = Math.round(overallPct * 10.0) / 10.0;

        String periodLabel = "Adherence over the last " + days + " days";
        String descriptiveSummary = overallApplicable > 0
                ? String.format("You have recorded %d of %d relevant doses (%.1f%% adherence) over the selected period.", totalTaken, overallApplicable, overallPct)
                : "No completed dose records found for the selected period.";

        return MedicationAdherenceResponse.builder()
                .period(period != null ? period : "30_DAYS")
                .periodLabel(periodLabel)
                .overallAdherencePercentage(overallPct)
                .totalScheduledDoses(totalScheduled)
                .totalTakenDoses(totalTaken)
                .totalSkippedDoses(totalSkipped)
                .totalMissedDoses(totalMissed)
                .medicationSummaries(summaries)
                .descriptiveSummary(descriptiveSummary)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MedicationReminderResponse> getReminders(ReminderStatus status, Pageable pageable) {
        PatientProfile patient = getCurrentPatient();
        Page<MedicationReminder> remindersPage;
        if (status != null) {
            remindersPage = medicationReminderRepository.findByPatientAndStatusOrderByReminderTimeDesc(patient, status, pageable);
        } else {
            remindersPage = medicationReminderRepository.findByPatientOrderByReminderTimeDesc(patient, pageable);
        }
        return remindersPage.map(medicationMapper::toReminderResponse);
    }

    @Override
    @Transactional
    public MedicationReminderResponse markReminderRead(UUID id) {
        PatientProfile patient = getCurrentPatient();
        MedicationReminder reminder = medicationReminderRepository.findByIdAndPatient(id, patient)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found with id: " + id));

        reminder.setStatus(ReminderStatus.READ);
        reminder = medicationReminderRepository.save(reminder);

        auditLogService.logEvent(
                patient.getUser().getId(),
                patient.getUser().getEmail(),
                "MEDICATION_REMINDER_READ",
                "MedicationReminder",
                "SUCCESS",
                null,
                null,
                "Reminder marked as READ for " + reminder.getMedication().getMedicineName()
        );

        return medicationMapper.toReminderResponse(reminder);
    }

    @Override
    @Transactional
    public MedicationResponse updateReminderSettings(UUID id, UpdateReminderSettingsRequest request) {
        PatientProfile patient = getCurrentPatient();
        Medication medication = medicationRepository.findByIdAndPatient(id, patient)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found with id: " + id));

        medication.setReminderEnabled(request.getReminderEnabled());
        if (request.getReminderMinutesBefore() != null) {
            medication.setReminderMinutesBefore(request.getReminderMinutesBefore());
        }
        medication = medicationRepository.save(medication);

        Instant nextDose = findNextScheduledDose(medication);
        Double adherence = calculateMedicationAdherence(medication, Instant.now().minus(30, ChronoUnit.DAYS), Instant.now());
        return medicationMapper.toMedicationResponse(medication, nextDose, adherence);
    }

    @Override
    @Transactional
    public void generateDosesForActiveMedications() {
        List<Medication> activeMeds = medicationRepository.findAllByStatusAndReminderEnabledTrue(MedicationStatus.ACTIVE);
        LocalDate today = LocalDate.now();
        LocalDate horizon = today.plusDays(7);

        for (Medication med : activeMeds) {
            try {
                generateDosesForMedication(med, today, horizon);
            } catch (Exception e) {
                log.error("Failed to generate doses for medication {}: {}", med.getId(), e.getMessage());
            }
        }
    }

    @Override
    @Transactional
    public void processUpcomingReminders() {
        Instant now = Instant.now();
        Instant windowEnd = now.plus(45, ChronoUnit.MINUTES);

        List<MedicationDose> upcomingDoses = medicationDoseRepository.findByStatusAndScheduledAtBetween(
                DoseStatus.SCHEDULED, now, windowEnd);

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("h:mm a").withZone(DEFAULT_ZONE);

        for (MedicationDose dose : upcomingDoses) {
            Medication med = dose.getMedication();
            if (med == null || !Boolean.TRUE.equals(med.getReminderEnabled()) || med.getStatus() != MedicationStatus.ACTIVE) {
                continue;
            }

            if (!medicationReminderRepository.existsByDoseAndChannel(dose, ReminderChannel.IN_APP)) {
                Instant reminderTime = dose.getScheduledAt().minus(
                        Duration.ofMinutes(med.getReminderMinutesBefore() != null ? med.getReminderMinutesBefore() : 0));

                String formattedTime = timeFormatter.format(dose.getScheduledAt());
                String strength = med.getStrength() != null ? " " + med.getStrength() : "";
                String title = "Medication Reminder: " + med.getMedicineName();
                String message = String.format("%s%s is scheduled for %s. Tap to record your dose.",
                        med.getMedicineName(), strength, formattedTime);

                MedicationReminder reminder = MedicationReminder.builder()
                        .patient(dose.getPatient())
                        .medication(med)
                        .dose(dose)
                        .reminderTime(reminderTime)
                        .title(title)
                        .message(message)
                        .status(ReminderStatus.PENDING)
                        .channel(ReminderChannel.IN_APP)
                        .build();

                medicationReminderRepository.save(reminder);
            }
        }
    }

    @Override
    @Transactional
    public void markOverdueDosesAsMissed() {
        Instant overdueThreshold = Instant.now().minus(4, ChronoUnit.HOURS);
        List<MedicationDose> overdueDoses = medicationDoseRepository.findByStatusAndScheduledAtBefore(
                DoseStatus.SCHEDULED, overdueThreshold);

        for (MedicationDose dose : overdueDoses) {
            dose.setStatus(DoseStatus.MISSED);
            dose.setNotes("Automatically marked as missed after scheduled intake window passed.");
            medicationDoseRepository.save(dose);
        }
    }

    private void generateDosesForMedication(Medication medication, LocalDate start, LocalDate end) {
        if (medication.getFrequencyType() == FrequencyType.AS_NEEDED) {
            return; // AS_NEEDED does not generate mandatory calendar doses
        }

        LocalDate effectiveStart = medication.getStartDate().isAfter(start) ? medication.getStartDate() : start;
        LocalDate effectiveEnd = (medication.getEndDate() != null && medication.getEndDate().isBefore(end))
                ? medication.getEndDate() : end;

        if (effectiveStart.isAfter(effectiveEnd)) {
            return;
        }

        List<MedicationSchedule> schedules = medication.getSchedules();
        if (schedules == null || schedules.isEmpty()) {
            schedules = medicationScheduleRepository.findByMedication(medication);
        }

        for (LocalDate date = effectiveStart; !date.isAfter(effectiveEnd); date = date.plusDays(1)) {
            DayOfWeek dayOfWeek = date.getDayOfWeek();

            for (MedicationSchedule schedule : schedules) {
                if (schedule.getTimeOfDay() == null) continue;

                // Check day of week filter if configured
                if (schedule.getDaysOfWeek() != null && !schedule.getDaysOfWeek().isBlank()) {
                    String days = schedule.getDaysOfWeek().toUpperCase();
                    if (!days.contains(dayOfWeek.name())) {
                        continue;
                    }
                }

                Instant scheduledAt = date.atTime(schedule.getTimeOfDay()).atZone(DEFAULT_ZONE).toInstant();

                if (!medicationDoseRepository.existsByMedicationAndScheduledAt(medication, scheduledAt)) {
                    MedicationDose dose = MedicationDose.builder()
                            .medication(medication)
                            .patient(medication.getPatient())
                            .schedule(schedule)
                            .scheduledAt(scheduledAt)
                            .status(DoseStatus.SCHEDULED)
                            .build();
                    medicationDoseRepository.save(dose);
                }
            }
        }
    }

    private List<MedicationSchedule> createDefaultSchedules(Medication medication) {
        List<MedicationSchedule> schedules = new ArrayList<>();
        FrequencyType freq = medication.getFrequencyType();

        if (freq == null || freq == FrequencyType.AS_NEEDED) {
            return schedules;
        }

        List<LocalTime> times = new ArrayList<>();
        switch (freq) {
            case ONCE_DAILY:
                times.add(LocalTime.of(8, 0));
                break;
            case TWICE_DAILY:
                times.add(LocalTime.of(8, 0));
                times.add(LocalTime.of(20, 0));
                break;
            case THREE_TIMES_DAILY:
                times.add(LocalTime.of(8, 0));
                times.add(LocalTime.of(14, 0));
                times.add(LocalTime.of(20, 0));
                break;
            case FOUR_TIMES_DAILY:
                times.add(LocalTime.of(8, 0));
                times.add(LocalTime.of(12, 0));
                times.add(LocalTime.of(16, 0));
                times.add(LocalTime.of(20, 0));
                break;
            case EVERY_X_HOURS:
                times.add(LocalTime.of(8, 0));
                times.add(LocalTime.of(16, 0));
                break;
            case WEEKLY:
                times.add(LocalTime.of(9, 0));
                break;
            default:
                times.add(LocalTime.of(8, 0));
        }

        for (LocalTime time : times) {
            MedicationSchedule schedule = MedicationSchedule.builder()
                    .medication(medication)
                    .scheduleType(ScheduleType.FIXED_TIME)
                    .timeOfDay(time)
                    .doseAmount(medication.getDosageAmount())
                    .doseUnit(medication.getDosageUnit())
                    .build();
            schedules.add(medicationScheduleRepository.save(schedule));
        }

        return schedules;
    }

    private Instant findNextScheduledDose(Medication medication) {
        if (medication.getStatus() != MedicationStatus.ACTIVE) {
            return null;
        }
        List<MedicationDose> upcoming = medicationDoseRepository
                .findByMedicationAndScheduledAtBetweenOrderByScheduledAtAsc(
                        medication, Instant.now(), Instant.now().plus(14, ChronoUnit.DAYS));

        return upcoming.stream()
                .filter(d -> d.getStatus() == DoseStatus.SCHEDULED)
                .map(MedicationDose::getScheduledAt)
                .findFirst()
                .orElse(null);
    }

    private Double calculateMedicationAdherence(Medication medication, Instant start, Instant end) {
        List<MedicationDose> doses = medicationDoseRepository
                .findByMedicationAndScheduledAtBetweenOrderByScheduledAtAsc(medication, start, end);
        if (doses.isEmpty()) {
            return 100.0;
        }
        long taken = doses.stream().filter(d -> d.getStatus() == DoseStatus.TAKEN).count();
        long applicable = doses.stream().filter(d -> d.getStatus() == DoseStatus.TAKEN || d.getStatus() == DoseStatus.MISSED || d.getStatus() == DoseStatus.SKIPPED).count();
        if (applicable == 0) return 100.0;
        double rate = (taken * 100.0) / applicable;
        return Math.round(rate * 10.0) / 10.0;
    }

    private double calculatePatientAdherenceRate(PatientProfile patient, Instant start, Instant end) {
        List<MedicationDose> doses = medicationDoseRepository
                .findByPatientAndScheduledAtBetweenOrderByScheduledAtAsc(patient, start, end);
        if (doses.isEmpty()) {
            return 100.0;
        }
        long taken = doses.stream().filter(d -> d.getStatus() == DoseStatus.TAKEN).count();
        long applicable = doses.stream().filter(d -> d.getStatus() == DoseStatus.TAKEN || d.getStatus() == DoseStatus.MISSED || d.getStatus() == DoseStatus.SKIPPED).count();
        if (applicable == 0) return 100.0;
        double rate = (taken * 100.0) / applicable;
        return Math.round(rate * 10.0) / 10.0;
    }

    private void validateCreateRequest(CreateMedicationRequest request) {
        if (request.getMedicineName() == null || request.getMedicineName().isBlank()) {
            throw new AppException("Medicine name cannot be empty", HttpStatus.BAD_REQUEST);
        }
        if (request.getStartDate() == null) {
            throw new AppException("Start date is required", HttpStatus.BAD_REQUEST);
        }
        if (request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate())) {
            throw new AppException("End date cannot be earlier than start date", HttpStatus.BAD_REQUEST);
        }
    }

    private PatientProfile getCurrentPatient() {
        UUID userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return patientProfileRepository.findByUser(user)
                .orElseGet(() -> {
                    PatientProfile newProfile = PatientProfile.builder().user(user).build();
                    return patientProfileRepository.save(newProfile);
                });
    }
}
