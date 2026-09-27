package com.healthbuddy.repository;

import com.healthbuddy.entity.MedicationDose;
import com.healthbuddy.entity.MedicationReminder;
import com.healthbuddy.entity.PatientProfile;
import com.healthbuddy.entity.ReminderChannel;
import com.healthbuddy.entity.ReminderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicationReminderRepository extends JpaRepository<MedicationReminder, UUID> {

    Optional<MedicationReminder> findByIdAndPatient(UUID id, PatientProfile patient);

    Page<MedicationReminder> findByPatientOrderByReminderTimeDesc(PatientProfile patient, Pageable pageable);

    Page<MedicationReminder> findByPatientAndStatusOrderByReminderTimeDesc(
            PatientProfile patient, ReminderStatus status, Pageable pageable);

    List<MedicationReminder> findByStatusAndReminderTimeLessThanEqual(ReminderStatus status, Instant time);

    boolean existsByDoseAndChannel(MedicationDose dose, ReminderChannel channel);

    long countByPatientAndStatus(PatientProfile patient, ReminderStatus status);
}
