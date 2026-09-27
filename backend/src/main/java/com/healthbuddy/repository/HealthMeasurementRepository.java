package com.healthbuddy.repository;

import com.healthbuddy.entity.HealthMeasurement;
import com.healthbuddy.entity.MeasurementType;
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
public interface HealthMeasurementRepository extends JpaRepository<HealthMeasurement, UUID> {

    Optional<HealthMeasurement> findByIdAndPatient(UUID id, PatientProfile patient);

    Page<HealthMeasurement> findByPatientOrderByMeasurementTimeDesc(PatientProfile patient, Pageable pageable);

    Page<HealthMeasurement> findByPatientAndMeasurementTypeOrderByMeasurementTimeDesc(
            PatientProfile patient, MeasurementType measurementType, Pageable pageable);

    List<HealthMeasurement> findByPatientAndMeasurementTypeAndMeasurementTimeBetweenOrderByMeasurementTimeAsc(
            PatientProfile patient, MeasurementType measurementType, Instant start, Instant end);

    List<HealthMeasurement> findByPatientAndMeasurementTypeAndMeasurementTimeGreaterThanEqualOrderByMeasurementTimeAsc(
            PatientProfile patient, MeasurementType measurementType, Instant start);

    Optional<HealthMeasurement> findFirstByPatientAndMeasurementTypeOrderByMeasurementTimeDesc(
            PatientProfile patient, MeasurementType measurementType);

    List<HealthMeasurement> findTop10ByPatientAndMeasurementTypeOrderByMeasurementTimeDesc(
            PatientProfile patient, MeasurementType measurementType);

    @Query("SELECT m FROM HealthMeasurement m WHERE m.patient = :patient " +
           "AND (:type IS NULL OR m.measurementType = :type) " +
           "AND (CAST(:start AS timestamp) IS NULL OR m.measurementTime >= :start) " +
           "AND (CAST(:end AS timestamp) IS NULL OR m.measurementTime <= :end) " +
           "ORDER BY m.measurementTime DESC")
    Page<HealthMeasurement> searchMeasurements(
            @Param("patient") PatientProfile patient,
            @Param("type") MeasurementType type,
            @Param("start") Instant start,
            @Param("end") Instant end,
            Pageable pageable
    );

    long countByPatient(PatientProfile patient);

    void deleteAllByPatient(PatientProfile patient);
}
