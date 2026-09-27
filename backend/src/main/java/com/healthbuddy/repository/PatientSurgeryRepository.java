package com.healthbuddy.repository;

import com.healthbuddy.entity.PatientProfile;
import com.healthbuddy.entity.PatientSurgery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientSurgeryRepository extends JpaRepository<PatientSurgery, UUID> {
    List<PatientSurgery> findByPatientOrderByDateOfSurgeryDesc(PatientProfile patient);
    List<PatientSurgery> findByPatientIdOrderByDateOfSurgeryDesc(UUID patientId);
    Optional<PatientSurgery> findByIdAndPatient(UUID id, PatientProfile patient);
    Optional<PatientSurgery> findByIdAndPatientId(UUID id, UUID patientId);
}
