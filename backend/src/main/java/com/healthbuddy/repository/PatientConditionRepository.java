package com.healthbuddy.repository;

import com.healthbuddy.entity.PatientCondition;
import com.healthbuddy.entity.PatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientConditionRepository extends JpaRepository<PatientCondition, UUID> {
    List<PatientCondition> findByPatientOrderByDiagnosedDateDesc(PatientProfile patient);
    List<PatientCondition> findByPatientIdOrderByDiagnosedDateDesc(UUID patientId);
    Optional<PatientCondition> findByIdAndPatient(UUID id, PatientProfile patient);
    Optional<PatientCondition> findByIdAndPatientId(UUID id, UUID patientId);
}
