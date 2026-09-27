package com.healthbuddy.repository;

import com.healthbuddy.entity.PatientFamilyHistory;
import com.healthbuddy.entity.PatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientFamilyHistoryRepository extends JpaRepository<PatientFamilyHistory, UUID> {
    List<PatientFamilyHistory> findByPatientOrderByCreatedAtDesc(PatientProfile patient);
    List<PatientFamilyHistory> findByPatientIdOrderByCreatedAtDesc(UUID patientId);
    Optional<PatientFamilyHistory> findByIdAndPatient(UUID id, PatientProfile patient);
    Optional<PatientFamilyHistory> findByIdAndPatientId(UUID id, UUID patientId);
}
