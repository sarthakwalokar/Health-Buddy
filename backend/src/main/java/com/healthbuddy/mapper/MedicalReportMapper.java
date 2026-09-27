package com.healthbuddy.mapper;

import com.healthbuddy.dto.response.MedicalReportDetailResponse;
import com.healthbuddy.dto.response.MedicalReportParameterResponse;
import com.healthbuddy.dto.response.MedicalReportResponse;
import com.healthbuddy.entity.MedicalReport;
import com.healthbuddy.entity.MedicalReportParameter;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class MedicalReportMapper {

    public MedicalReportResponse toReportResponse(MedicalReport report) {
        if (report == null) return null;

        return MedicalReportResponse.builder()
                .id(report.getId())
                .originalFileName(report.getOriginalFileName())
                .fileType(report.getFileType())
                .fileSize(report.getFileSize())
                .reportType(report.getReportType())
                .reportTypeLabel(report.getReportType() != null ? report.getReportType().getDisplayLabel() : "Uncategorized")
                .uploadedAt(report.getUploadedAt())
                .processingStatus(report.getProcessingStatus())
                .processingStatusLabel(report.getProcessingStatus() != null ? report.getProcessingStatus().getDisplayLabel() : "Uploaded")
                .verificationStatus(report.getVerificationStatus())
                .verificationStatusLabel(report.getVerificationStatus() != null ? report.getVerificationStatus().getDisplayLabel() : "Not Verified")
                .processedAt(report.getProcessedAt())
                .verifiedAt(report.getVerifiedAt())
                .parameterCount(report.getParameters() != null ? report.getParameters().size() : 0)
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }

    public MedicalReportDetailResponse toReportDetailResponse(MedicalReport report) {
        if (report == null) return null;

        List<MedicalReportParameterResponse> parameterResponses = report.getParameters() != null
                ? report.getParameters().stream()
                .map(this::toParameterResponse)
                .collect(Collectors.toList())
                : Collections.emptyList();

        return MedicalReportDetailResponse.builder()
                .id(report.getId())
                .originalFileName(report.getOriginalFileName())
                .fileType(report.getFileType())
                .fileSize(report.getFileSize())
                .reportType(report.getReportType())
                .reportTypeLabel(report.getReportType() != null ? report.getReportType().getDisplayLabel() : "Uncategorized")
                .uploadedAt(report.getUploadedAt())
                .processingStatus(report.getProcessingStatus())
                .processingStatusLabel(report.getProcessingStatus() != null ? report.getProcessingStatus().getDisplayLabel() : "Uploaded")
                .verificationStatus(report.getVerificationStatus())
                .verificationStatusLabel(report.getVerificationStatus() != null ? report.getVerificationStatus().getDisplayLabel() : "Not Verified")
                .extractedText(report.getExtractedText())
                .processedAt(report.getProcessedAt())
                .verifiedAt(report.getVerifiedAt())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .parameters(parameterResponses)
                .build();
    }

    public MedicalReportParameterResponse toParameterResponse(MedicalReportParameter param) {
        if (param == null) return null;

        return MedicalReportParameterResponse.builder()
                .id(param.getId())
                .reportId(param.getReport() != null ? param.getReport().getId() : null)
                .parameterName(param.getParameterName())
                .parameterCode(param.getParameterCode())
                .valueNumeric(param.getValueNumeric())
                .valueText(param.getValueText())
                .unit(param.getUnit())
                .referenceRange(param.getReferenceRange())
                .observationDate(param.getObservationDate())
                .extractionConfidence(param.getExtractionConfidence())
                .source(param.getSource())
                .sourceLabel(param.getSource() != null ? param.getSource().getDisplayLabel() : "Unknown")
                .patientVerified(param.getPatientVerified())
                .originalValueText(param.getOriginalValueText())
                .correctedByPatient(param.getCorrectedByPatient())
                .createdAt(param.getCreatedAt())
                .updatedAt(param.getUpdatedAt())
                .build();
    }
}
