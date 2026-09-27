package com.healthbuddy.service;

import com.healthbuddy.dto.request.CreateParameterRequest;
import com.healthbuddy.dto.request.UpdateParameterRequest;
import com.healthbuddy.dto.response.DocumentProcessingResult;
import com.healthbuddy.dto.response.ExtractedParameterDto;
import com.healthbuddy.dto.response.MedicalReportDetailResponse;
import com.healthbuddy.dto.response.MedicalReportParameterResponse;
import com.healthbuddy.dto.response.MedicalReportResponse;
import com.healthbuddy.entity.*;
import com.healthbuddy.exception.AppException;
import com.healthbuddy.exception.ResourceNotFoundException;
import com.healthbuddy.mapper.MedicalReportMapper;
import com.healthbuddy.repository.MedicalReportParameterRepository;
import com.healthbuddy.repository.MedicalReportRepository;
import com.healthbuddy.repository.PatientProfileRepository;
import com.healthbuddy.repository.UserRepository;
import com.healthbuddy.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class MedicalReportServiceImpl implements MedicalReportService {

    private final MedicalReportRepository medicalReportRepository;
    private final MedicalReportParameterRepository parameterRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final DocumentProcessingService documentProcessingService;
    private final MedicalReportMapper medicalReportMapper;
    private final AuditLogService auditLogService;

    private PatientProfile getAuthenticatedPatientProfile() {
        UUID userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return patientProfileRepository.findByUser(user)
                .orElseGet(() -> {
                    PatientProfile newProfile = PatientProfile.builder().user(user).build();
                    return patientProfileRepository.save(newProfile);
                });
    }

    @Override
    @Transactional
    public MedicalReportDetailResponse uploadReport(MultipartFile file, ReportType reportType, String notes) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        UUID userId = patient.getUser().getId();
        String userEmail = patient.getUser().getEmail();

        if (file == null || file.isEmpty()) {
            throw new AppException("Medical report file cannot be empty", HttpStatus.BAD_REQUEST);
        }

        String originalFilename = Objects.requireNonNullElse(file.getOriginalFilename(), "report.pdf");
        String contentType = file.getContentType() != null ? file.getContentType() : "application/pdf";
        long size = file.getSize();

        // 1. Store file securely
        String storageKey = fileStorageService.store(file, patient.getId().toString());
        String storedFilename = storageKey.substring(storageKey.lastIndexOf('/') + 1);

        // 2. Initialize MedicalReport record
        MedicalReport report = MedicalReport.builder()
                .patient(patient)
                .originalFileName(originalFilename)
                .storedFileName(storedFilename)
                .fileType(contentType)
                .fileSize(size)
                .storageKey(storageKey)
                .reportType(reportType != null ? reportType : ReportType.UNKNOWN)
                .uploadedAt(Instant.now())
                .processingStatus(ProcessingStatus.PROCESSING)
                .verificationStatus(VerificationStatus.NOT_VERIFIED)
                .parameters(new ArrayList<>())
                .build();

        MedicalReport savedReport = medicalReportRepository.save(report);

        auditLogService.logEvent(
                userId, userEmail, "MEDICAL_REPORT_UPLOADED",
                "/api/v1/patient/reports/" + savedReport.getId(), "SUCCESS",
                "LOCAL", "WEB", "Medical report uploaded: " + originalFilename + " (" + size + " bytes)"
        );

        // 3. Process Document through DocumentProcessingService
        try {
            Resource fileResource = fileStorageService.retrieve(storageKey);
            DocumentProcessingResult processingResult = documentProcessingService.processDocument(
                    fileResource, originalFilename, contentType, reportType
            );

            savedReport.setExtractedText(processingResult.getExtractedText());
            if (reportType == null || reportType == ReportType.UNKNOWN) {
                savedReport.setReportType(processingResult.getDetectedReportType());
            }
            savedReport.setProcessingStatus(processingResult.getStatus());
            savedReport.setProcessedAt(Instant.now());

            // Save extracted parameters
            if (processingResult.getParameters() != null && !processingResult.getParameters().isEmpty()) {
                for (ExtractedParameterDto paramDto : processingResult.getParameters()) {
                    MedicalReportParameter param = MedicalReportParameter.builder()
                            .report(savedReport)
                            .parameterName(paramDto.getParameterName())
                            .parameterCode(paramDto.getParameterCode())
                            .valueNumeric(paramDto.getValueNumeric())
                            .valueText(paramDto.getValueText())
                            .unit(paramDto.getUnit())
                            .referenceRange(paramDto.getReferenceRange())
                            .observationDate(paramDto.getObservationDate() != null ? paramDto.getObservationDate() : LocalDate.now())
                            .extractionConfidence(paramDto.getExtractionConfidence())
                            .source(paramDto.getSource() != null ? paramDto.getSource() : ParameterSource.OCR)
                            .patientVerified(false)
                            .correctedByPatient(false)
                            .build();

                    savedReport.addParameter(param);
                }
            }

            savedReport = medicalReportRepository.save(savedReport);

            auditLogService.logEvent(
                    userId, userEmail, "MEDICAL_REPORT_PROCESSED",
                    "/api/v1/patient/reports/" + savedReport.getId(), "SUCCESS",
                    "LOCAL", "WEB", "Medical report processed. Parameters extracted: " + savedReport.getParameters().size()
            );

        } catch (Exception e) {
            log.error("Failed to process uploaded medical report id: {}", savedReport.getId(), e);
            savedReport.setProcessingStatus(ProcessingStatus.FAILED);
            savedReport = medicalReportRepository.save(savedReport);

            auditLogService.logEvent(
                    userId, userEmail, "MEDICAL_REPORT_PROCESSING_FAILED",
                    "/api/v1/patient/reports/" + savedReport.getId(), "FAILURE",
                    "LOCAL", "WEB", "Medical report processing failed: " + e.getMessage()
            );
        }

        return medicalReportMapper.toReportDetailResponse(savedReport);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalReportResponse> getMyReports(ReportType reportType, ProcessingStatus status, String search) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        String searchTrimmed = (search != null && !search.isBlank()) ? search.trim() : null;

        List<MedicalReport> reports;
        if (reportType == null && status == null && searchTrimmed == null) {
            reports = medicalReportRepository.findByPatientOrderByUploadedAtDesc(patient);
        } else {
            reports = medicalReportRepository.searchReports(patient, reportType, status, searchTrimmed);
        }

        return reports.stream()
                .map(medicalReportMapper::toReportResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MedicalReportDetailResponse getReportById(UUID reportId) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        MedicalReport report = medicalReportRepository.findByIdAndPatient(reportId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalReport", "id", reportId));

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "MEDICAL_REPORT_VIEWED",
                "/api/v1/patient/reports/" + reportId, "SUCCESS",
                "LOCAL", "WEB", "Medical report viewed: " + report.getOriginalFileName()
        );

        return medicalReportMapper.toReportDetailResponse(report);
    }

    @Override
    @Transactional(readOnly = true)
    public ReportFileDownload downloadReportFile(UUID reportId) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        MedicalReport report = medicalReportRepository.findByIdAndPatient(reportId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalReport", "id", reportId));

        Resource resource = fileStorageService.retrieve(report.getStorageKey());

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "MEDICAL_REPORT_DOWNLOADED",
                "/api/v1/patient/reports/" + reportId + "/file", "SUCCESS",
                "LOCAL", "WEB", "Medical report file downloaded: " + report.getOriginalFileName()
        );

        return new ReportFileDownload(resource, report.getOriginalFileName(), report.getFileType());
    }

    @Override
    @Transactional
    public void deleteReport(UUID reportId) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        MedicalReport report = medicalReportRepository.findByIdAndPatient(reportId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalReport", "id", reportId));

        String storageKey = report.getStorageKey();
        String originalFileName = report.getOriginalFileName();

        medicalReportRepository.delete(report);
        fileStorageService.delete(storageKey);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "MEDICAL_REPORT_DELETED",
                "/api/v1/patient/reports/" + reportId, "SUCCESS",
                "LOCAL", "WEB", "Medical report deleted: " + originalFileName
        );
    }

    @Override
    @Transactional
    public MedicalReportDetailResponse verifyReport(UUID reportId) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        MedicalReport report = medicalReportRepository.findByIdAndPatient(reportId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalReport", "id", reportId));

        report.setVerificationStatus(VerificationStatus.PATIENT_VERIFIED);
        report.setVerifiedAt(Instant.now());

        // Verify all associated parameters
        if (report.getParameters() != null) {
            for (MedicalReportParameter param : report.getParameters()) {
                param.setPatientVerified(true);
            }
        }

        MedicalReport updated = medicalReportRepository.save(report);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "MEDICAL_REPORT_VERIFIED",
                "/api/v1/patient/reports/" + reportId + "/verify", "SUCCESS",
                "LOCAL", "WEB", "Medical report verified by patient: " + report.getOriginalFileName()
        );

        return medicalReportMapper.toReportDetailResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalReportParameterResponse> getParameters(UUID reportId) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        MedicalReport report = medicalReportRepository.findByIdAndPatient(reportId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalReport", "id", reportId));

        return parameterRepository.findByReportOrderByCreatedAtAsc(report)
                .stream()
                .map(medicalReportMapper::toParameterResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MedicalReportParameterResponse updateParameter(UUID reportId, UUID parameterId, UpdateParameterRequest request) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        MedicalReport report = medicalReportRepository.findByIdAndPatient(reportId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalReport", "id", reportId));

        MedicalReportParameter param = parameterRepository.findByIdAndReport(parameterId, report)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalReportParameter", "id", parameterId));

        boolean valueChanged = false;

        if (request.getParameterName() != null && !request.getParameterName().isBlank()) {
            param.setParameterName(request.getParameterName().trim());
        }
        if (request.getParameterCode() != null) {
            param.setParameterCode(request.getParameterCode().trim());
        }
        if (request.getValueText() != null && !request.getValueText().isBlank() && !request.getValueText().equals(param.getValueText())) {
            // Retain original value text for traceability / audit history
            if (param.getOriginalValueText() == null) {
                param.setOriginalValueText(param.getValueText());
            }
            param.setValueText(request.getValueText().trim());
            valueChanged = true;
        }
        if (request.getValueNumeric() != null) {
            param.setValueNumeric(request.getValueNumeric());
        }
        if (request.getUnit() != null) {
            param.setUnit(request.getUnit().trim());
        }
        if (request.getReferenceRange() != null) {
            param.setReferenceRange(request.getReferenceRange().trim());
        }
        if (request.getObservationDate() != null) {
            param.setObservationDate(request.getObservationDate());
        }

        if (valueChanged) {
            param.setCorrectedByPatient(true);
        }

        if (request.getPatientVerified() != null) {
            param.setPatientVerified(request.getPatientVerified());
        } else {
            param.setPatientVerified(true);
        }

        MedicalReportParameter updated = parameterRepository.save(param);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "MEDICAL_REPORT_PARAMETER_UPDATED",
                "/api/v1/patient/reports/" + reportId + "/parameters/" + parameterId, "SUCCESS",
                "LOCAL", "WEB", "Parameter updated: " + param.getParameterName() + " -> " + param.getValueText()
        );

        return medicalReportMapper.toParameterResponse(updated);
    }

    @Override
    @Transactional
    public MedicalReportParameterResponse addParameter(UUID reportId, CreateParameterRequest request) {
        PatientProfile patient = getAuthenticatedPatientProfile();
        MedicalReport report = medicalReportRepository.findByIdAndPatient(reportId, patient)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalReport", "id", reportId));

        MedicalReportParameter param = MedicalReportParameter.builder()
                .report(report)
                .parameterName(request.getParameterName().trim())
                .parameterCode(request.getParameterCode())
                .valueNumeric(request.getValueNumeric())
                .valueText(request.getValueText().trim())
                .unit(request.getUnit())
                .referenceRange(request.getReferenceRange())
                .observationDate(request.getObservationDate() != null ? request.getObservationDate() : LocalDate.now())
                .extractionConfidence(new BigDecimal("1.0000"))
                .source(request.getSource() != null ? request.getSource() : ParameterSource.MANUAL)
                .patientVerified(true)
                .correctedByPatient(false)
                .build();

        report.addParameter(param);
        MedicalReportParameter saved = parameterRepository.save(param);

        auditLogService.logEvent(
                patient.getUser().getId(), patient.getUser().getEmail(), "MEDICAL_REPORT_PARAMETER_ADDED",
                "/api/v1/patient/reports/" + reportId + "/parameters/" + saved.getId(), "SUCCESS",
                "LOCAL", "WEB", "Parameter manually added: " + saved.getParameterName()
        );

        return medicalReportMapper.toParameterResponse(saved);
    }
}
