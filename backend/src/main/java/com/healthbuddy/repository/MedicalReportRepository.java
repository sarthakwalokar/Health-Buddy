package com.healthbuddy.repository;

import com.healthbuddy.entity.MedicalReport;
import com.healthbuddy.entity.PatientProfile;
import com.healthbuddy.entity.ProcessingStatus;
import com.healthbuddy.entity.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicalReportRepository extends JpaRepository<MedicalReport, UUID> {

    List<MedicalReport> findByPatientOrderByUploadedAtDesc(PatientProfile patient);

    Optional<MedicalReport> findByIdAndPatient(UUID id, PatientProfile patient);

    Optional<MedicalReport> findByIdAndPatient_User_Id(UUID id, UUID userId);

    List<MedicalReport> findByPatientAndReportTypeOrderByUploadedAtDesc(PatientProfile patient, ReportType reportType);

    List<MedicalReport> findByPatientAndProcessingStatusOrderByUploadedAtDesc(PatientProfile patient, ProcessingStatus processingStatus);

    @Query("SELECT r FROM MedicalReport r WHERE r.patient = :patient " +
           "AND (:reportType IS NULL OR r.reportType = :reportType) " +
           "AND (:status IS NULL OR r.processingStatus = :status) " +
           "AND (:search IS NULL OR LOWER(r.originalFileName) LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%')) " +
           "ORDER BY r.uploadedAt DESC")
    List<MedicalReport> searchReports(
            @Param("patient") PatientProfile patient,
            @Param("reportType") ReportType reportType,
            @Param("status") ProcessingStatus status,
            @Param("search") String search
    );

    long countByPatient(PatientProfile patient);
}
