package com.healthbuddy.repository;

import com.healthbuddy.entity.MedicalReport;
import com.healthbuddy.entity.MedicalReportParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicalReportParameterRepository extends JpaRepository<MedicalReportParameter, UUID> {

    List<MedicalReportParameter> findByReportOrderByCreatedAtAsc(MedicalReport report);

    Optional<MedicalReportParameter> findByIdAndReport(UUID id, MedicalReport report);

    Optional<MedicalReportParameter> findByIdAndReport_Patient_Id(UUID id, UUID patientId);

    void deleteByReport(MedicalReport report);
}
