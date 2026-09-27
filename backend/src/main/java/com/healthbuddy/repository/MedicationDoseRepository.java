package com.healthbuddy.repository;

import com.healthbuddy.entity.DoseStatus;
import com.healthbuddy.entity.Medication;
import com.healthbuddy.entity.MedicationDose;
import com.healthbuddy.entity.PatientProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicationDoseRepository extends JpaRepository<MedicationDose, UUID> {

    Optional<MedicationDose> findByIdAndPatient(UUID id, PatientProfile patient);

    List<MedicationDose> findByPatientAndScheduledAtBetweenOrderByScheduledAtAsc(
            PatientProfile patient, Instant start, Instant end);

    List<MedicationDose> findByMedicationAndScheduledAtBetweenOrderByScheduledAtAsc(
            Medication medication, Instant start, Instant end);

    List<MedicationDose> findByStatusAndScheduledAtBefore(DoseStatus status, Instant time);

    List<MedicationDose> findByStatusAndScheduledAtBetween(DoseStatus status, Instant start, Instant end);

    long countByPatientAndScheduledAtBetween(PatientProfile patient, Instant start, Instant end);

    long countByPatientAndStatusAndScheduledAtBetween(PatientProfile patient, DoseStatus status, Instant start, Instant end);

    long countByMedicationAndScheduledAtBetween(Medication medication, Instant start, Instant end);

    long countByMedicationAndStatusAndScheduledAtBetween(Medication medication, DoseStatus status, Instant start, Instant end);

    boolean existsByMedicationAndScheduledAt(Medication medication, Instant scheduledAt);

    @Query("SELECT d FROM MedicationDose d WHERE d.patient = :patient " +
           "AND (CAST(:medicationId AS uuid) IS NULL OR d.medication.id = :medicationId) " +
           "AND (:status IS NULL OR d.status = :status) " +
           "AND (CAST(:start AS timestamp) IS NULL OR d.scheduledAt >= :start) " +
           "AND (CAST(:end AS timestamp) IS NULL OR d.scheduledAt <= :end) " +
           "ORDER BY d.scheduledAt DESC")
    Page<MedicationDose> searchDoses(
            @Param("patient") PatientProfile patient,
            @Param("medicationId") UUID medicationId,
            @Param("status") DoseStatus status,
            @Param("start") Instant start,
            @Param("end") Instant end,
            Pageable pageable
    );
}
