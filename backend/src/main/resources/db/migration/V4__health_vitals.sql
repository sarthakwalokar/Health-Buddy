-- Health Buddy Schema Migration V4: Vitals & Health Monitoring, Trends & Safety Alerts

-- 1. Health Measurements Table
CREATE TABLE IF NOT EXISTS health_measurements (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    measurement_type VARCHAR(50) NOT NULL,
    value_numeric NUMERIC(10, 2) NOT NULL,
    secondary_value_numeric NUMERIC(10, 2),
    unit VARCHAR(50) NOT NULL,
    measurement_time TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
    measurement_context VARCHAR(50),
    source_report_id UUID REFERENCES medical_reports(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Health Alerts Table (Informational Clinical Safety & Change Detection Alerts)
CREATE TABLE IF NOT EXISTS health_alerts (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    measurement_id UUID REFERENCES health_measurements(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'INFO',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'UNREAD',
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Query Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_health_measurements_patient_id ON health_measurements(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_measurements_type_time ON health_measurements(patient_id, measurement_type, measurement_time DESC);
CREATE INDEX IF NOT EXISTS idx_health_measurements_time ON health_measurements(patient_id, measurement_time DESC);
CREATE INDEX IF NOT EXISTS idx_health_measurements_source_report ON health_measurements(source_report_id);

CREATE INDEX IF NOT EXISTS idx_health_alerts_patient_status ON health_alerts(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_health_alerts_patient_created ON health_alerts(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_alerts_measurement_id ON health_alerts(measurement_id);
