package com.healthbuddy.dto.response;

import com.healthbuddy.entity.ProcessingStatus;
import com.healthbuddy.entity.ReportType;
import com.healthbuddy.entity.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalReportDetailResponse {
    private UUID id;
    private String originalFileName;
    private String fileType;
    private Long fileSize;
    private ReportType reportType;
    private String reportTypeLabel;
    private Instant uploadedAt;
    private ProcessingStatus processingStatus;
    private String processingStatusLabel;
    private VerificationStatus verificationStatus;
    private String verificationStatusLabel;
    private String extractedText;
    private Instant processedAt;
    private Instant verifiedAt;
    private Instant createdAt;
    private Instant updatedAt;
    @Builder.Default
    private List<MedicalReportParameterResponse> parameters = new ArrayList<>();
}
