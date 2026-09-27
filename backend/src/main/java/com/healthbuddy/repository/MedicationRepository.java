package com.healthbuddy.repository;

import com.healthbuddy.entity.Medication;
import com.healthbuddy.entity.MedicationStatus;
import com.healthbuddy.entity.PatientProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, UUID> {

    Optional<Medication> findByIdAndPatient(UUID id, PatientProfile patient);

    List<Medication> findByPatientOrderByCreatedAtDesc(PatientProfile patient);

    List<Medication> findByPatientAndStatusOrderByCreatedAtDesc(PatientProfile patient, MedicationStatus status);

    List<Medication> findByPatientAndStatusInOrderByCreatedAtDesc(PatientProfile patient, List<MedicationStatus> statuses);

    List<Medication> findAllByStatusAndReminderEnabledTrue(MedicationStatus status);

    long countByPatientAndStatus(PatientProfile patient, MedicationStatus status);

    Page<Medication> findByPatientOrderByCreatedAtDesc(PatientProfile patient, Pageable pageable);

    Page<Medication> findByPatientAndStatusOrderByCreatedAtDesc(PatientProfile patient, MedicationStatus status, Pageable pageable);

    @Query("SELECT m FROM Medication m WHERE m.patient = :patient " +
           "AND (:status IS NULL OR m.status = :status) " +
           "AND (LOWER(m.medicineName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "     OR LOWER(m.genericName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY m.createdAt DESC")
    Page<Medication> searchMedicationsWithQuery(
            @Param("patient") PatientProfile patient,
            @Param("status") MedicationStatus status,
            @Param("query") String query,
            Pageable pageable
    );
}
