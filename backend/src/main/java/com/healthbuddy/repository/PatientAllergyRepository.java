package com.healthbuddy.repository;

import com.healthbuddy.entity.PatientAllergy;
import com.healthbuddy.entity.PatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientAllergyRepository extends JpaRepository<PatientAllergy, UUID> {
    List<PatientAllergy> findByPatientOrderByCreatedAtDesc(PatientProfile patient);
    List<PatientAllergy> findByPatientIdOrderByCreatedAtDesc(UUID patientId);
    Optional<PatientAllergy> findByIdAndPatient(UUID id, PatientProfile patient);
    Optional<PatientAllergy> findByIdAndPatientId(UUID id, UUID patientId);
}
