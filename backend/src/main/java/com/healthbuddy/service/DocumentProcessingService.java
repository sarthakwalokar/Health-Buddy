package com.healthbuddy.service;

import com.healthbuddy.dto.response.DocumentProcessingResult;
import com.healthbuddy.dto.response.ExtractedParameterDto;
import com.healthbuddy.entity.ReportType;
import org.springframework.core.io.Resource;

import java.util.List;

public interface DocumentProcessingService {

    /**
     * Extracts raw text from a document resource.
     *
     * @param resource the file resource
     * @param fileType the MIME type or file extension
     * @return extracted text string
     */
    String extractText(Resource resource, String fileType);

    /**
     * Extracts structured health parameters from document text.
     *
     * @param extractedText text extracted from document
     * @param reportType the report type context
     * @return list of extracted parameters
     */
    List<ExtractedParameterDto> extractParameters(String extractedText, ReportType reportType);

    /**
     * Processes a full medical report resource end-to-end.
     *
     * @param fileResource the stored file resource
     * @param originalFilename the original uploaded filename
     * @param fileType the MIME type of the document
     * @param requestedReportType optional user-specified report type
     * @return structured document processing result
     */
    DocumentProcessingResult processDocument(Resource fileResource, String originalFilename, String fileType, ReportType requestedReportType);
}
