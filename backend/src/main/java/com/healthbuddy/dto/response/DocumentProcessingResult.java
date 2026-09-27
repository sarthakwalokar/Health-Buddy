package com.healthbuddy.dto.response;

import com.healthbuddy.entity.ProcessingStatus;
import com.healthbuddy.entity.ReportType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentProcessingResult {
    private String extractedText;
    private ReportType detectedReportType;
    @Builder.Default
    private List<ExtractedParameterDto> parameters = new ArrayList<>();
    @Builder.Default
    private ProcessingStatus status = ProcessingStatus.PROCESSED;
    private String statusMessage;
}
