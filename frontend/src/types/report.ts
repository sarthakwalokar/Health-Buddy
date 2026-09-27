export type ReportType =
  | 'LAB_REPORT'
  | 'PRESCRIPTION'
  | 'IMAGING_REPORT'
  | 'DISCHARGE_SUMMARY'
  | 'PATHOLOGY_REPORT'
  | 'OTHER'
  | 'UNKNOWN';

export type ProcessingStatus =
  | 'UPLOADED'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'FAILED';

export type VerificationStatus =
  | 'NOT_VERIFIED'
  | 'PATIENT_VERIFIED'
  | 'DOCTOR_REVIEWED';

export type ParameterSource =
  | 'OCR'
  | 'PDF_TEXT'
  | 'MANUAL'
  | 'OTHER';

export interface MedicalReport {
  id: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  reportType: ReportType;
  reportTypeLabel: string;
  uploadedAt: string;
  processingStatus: ProcessingStatus;
  processingStatusLabel: string;
  verificationStatus: VerificationStatus;
  verificationStatusLabel: string;
  processedAt?: string;
  verifiedAt?: string;
  parameterCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalReportParameter {
  id: string;
  reportId: string;
  parameterName: string;
  parameterCode?: string;
  valueNumeric?: number;
  valueText: string;
  unit?: string;
  referenceRange?: string;
  observationDate?: string;
  extractionConfidence?: number;
  source: ParameterSource;
  sourceLabel: string;
  patientVerified: boolean;
  originalValueText?: string;
  correctedByPatient: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalReportDetail extends MedicalReport {
  extractedText?: string;
  parameters: MedicalReportParameter[];
}

export interface CreateParameterRequest {
  parameterName: string;
  parameterCode?: string;
  valueNumeric?: number;
  valueText: string;
  unit?: string;
  referenceRange?: string;
  observationDate?: string;
  source?: ParameterSource;
}

export interface UpdateParameterRequest {
  parameterName?: string;
  parameterCode?: string;
  valueNumeric?: number;
  valueText?: string;
  unit?: string;
  referenceRange?: string;
  observationDate?: string;
  patientVerified?: boolean;
}

export interface ReportFilterOptions {
  reportType?: ReportType;
  status?: ProcessingStatus;
  search?: string;
}
