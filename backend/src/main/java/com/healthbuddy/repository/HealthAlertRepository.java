package com.healthbuddy.repository;

import com.healthbuddy.entity.AlertStatus;
import com.healthbuddy.entity.HealthAlert;
import com.healthbuddy.entity.PatientProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HealthAlertRepository extends JpaRepository<HealthAlert, UUID> {

    Optional<HealthAlert> findByIdAndPatient(UUID id, PatientProfile patient);

    Page<HealthAlert> findByPatientOrderByCreatedAtDesc(PatientProfile patient, Pageable pageable);

    Page<HealthAlert> findByPatientAndStatusOrderByCreatedAtDesc(PatientProfile patient, AlertStatus status, Pageable pageable);

    List<HealthAlert> findTop5ByPatientAndStatusInOrderByCreatedAtDesc(PatientProfile patient, List<AlertStatus> statuses);

    long countByPatientAndStatus(PatientProfile patient, AlertStatus status);

    void deleteAllByPatient(PatientProfile patient);
}
