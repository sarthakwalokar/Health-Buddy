package com.healthbuddy.service;

import com.healthbuddy.dto.request.CreateParameterRequest;
import com.healthbuddy.dto.request.UpdateParameterRequest;
import com.healthbuddy.dto.response.MedicalReportDetailResponse;
import com.healthbuddy.dto.response.MedicalReportParameterResponse;
import com.healthbuddy.dto.response.MedicalReportResponse;
import com.healthbuddy.entity.ProcessingStatus;
import com.healthbuddy.entity.ReportType;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface MedicalReportService {

    MedicalReportDetailResponse uploadReport(MultipartFile file, ReportType reportType, String notes);

    List<MedicalReportResponse> getMyReports(ReportType reportType, ProcessingStatus status, String search);

    MedicalReportDetailResponse getReportById(UUID reportId);

    ReportFileDownload downloadReportFile(UUID reportId);

    void deleteReport(UUID reportId);

    MedicalReportDetailResponse verifyReport(UUID reportId);

    List<MedicalReportParameterResponse> getParameters(UUID reportId);

    MedicalReportParameterResponse updateParameter(UUID reportId, UUID parameterId, UpdateParameterRequest request);

    MedicalReportParameterResponse addParameter(UUID reportId, CreateParameterRequest request);

    record ReportFileDownload(Resource resource, String filename, String contentType) {}
}
