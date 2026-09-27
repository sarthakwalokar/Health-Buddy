package com.healthbuddy.repository;

import com.healthbuddy.entity.HealthGoalStatus;
import com.healthbuddy.entity.PatientHealthGoal;
import com.healthbuddy.entity.PatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientHealthGoalRepository extends JpaRepository<PatientHealthGoal, UUID> {
    List<PatientHealthGoal> findByPatientOrderByCreatedAtDesc(PatientProfile patient);
    List<PatientHealthGoal> findByPatientIdOrderByCreatedAtDesc(UUID patientId);
    List<PatientHealthGoal> findByPatientAndStatus(PatientProfile patient, HealthGoalStatus status);
    Optional<PatientHealthGoal> findByIdAndPatient(UUID id, PatientProfile patient);
    Optional<PatientHealthGoal> findByIdAndPatientId(UUID id, UUID patientId);
}
