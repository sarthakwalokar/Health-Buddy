package com.healthbuddy.repository;

import com.healthbuddy.entity.PatientLifestyle;
import com.healthbuddy.entity.PatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientLifestyleRepository extends JpaRepository<PatientLifestyle, UUID> {
    Optional<PatientLifestyle> findByPatient(PatientProfile patient);
    Optional<PatientLifestyle> findByPatientId(UUID patientId);
}
