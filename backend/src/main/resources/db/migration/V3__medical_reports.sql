-- Health Buddy Schema Migration V3: Medical Reports & Parameter Extraction

-- 1. Medical Reports Table
CREATE TABLE IF NOT EXISTS medical_reports (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    original_file_name VARCHAR(255) NOT NULL,
    stored_file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_key VARCHAR(512) NOT NULL,
    report_type VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN',
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processing_status VARCHAR(50) NOT NULL DEFAULT 'UPLOADED',
    verification_status VARCHAR(50) NOT NULL DEFAULT 'NOT_VERIFIED',
    extracted_text TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Medical Report Parameters Table (Structured Extracted Clinical Parameters)
CREATE TABLE IF NOT EXISTS medical_report_parameters (
    id UUID PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES medical_reports(id) ON DELETE CASCADE,
    parameter_name VARCHAR(255) NOT NULL,
    parameter_code VARCHAR(100),
    value_numeric NUMERIC(12, 4),
    value_text VARCHAR(255) NOT NULL,
    unit VARCHAR(50),
    reference_range VARCHAR(100),
    observation_date DATE,
    extraction_confidence NUMERIC(5, 4),
    source VARCHAR(50) NOT NULL DEFAULT 'OCR',
    patient_verified BOOLEAN NOT NULL DEFAULT FALSE,
    original_value_text VARCHAR(255),
    corrected_by_patient BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Query Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_medical_reports_patient_id ON medical_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_reports_processing_status ON medical_reports(processing_status);
CREATE INDEX IF NOT EXISTS idx_medical_reports_verification_status ON medical_reports(verification_status);
CREATE INDEX IF NOT EXISTS idx_medical_reports_uploaded_at ON medical_reports(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_medical_reports_report_type ON medical_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_report_params_report_id ON medical_report_parameters(report_id);
CREATE INDEX IF NOT EXISTS idx_report_params_param_name ON medical_report_parameters(parameter_name);
