-- V5__medications.sql
-- Flyway Migration: Medication Management, Schedules, Doses, and Reminders (Phase 6)

-- 1. Medications table
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    strength VARCHAR(100),
    dosage_amount NUMERIC(8, 2),
    dosage_unit VARCHAR(50),
    route VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN',
    frequency_type VARCHAR(50) NOT NULL DEFAULT 'ONCE_DAILY',
    frequency_value VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    instructions TEXT,
    reason TEXT,
    prescribed_by VARCHAR(255),
    source VARCHAR(50) NOT NULL DEFAULT 'PATIENT_ENTERED',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    reminder_minutes_before INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_medications_patient_status ON medications(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_medications_patient_start_date ON medications(patient_id, start_date);

-- 2. Medication Schedules table
CREATE TABLE IF NOT EXISTS medication_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    schedule_type VARCHAR(50) NOT NULL DEFAULT 'FIXED_TIME',
    time_of_day TIME WITHOUT TIME ZONE,
    days_of_week VARCHAR(100),
    interval_hours INTEGER,
    dose_amount NUMERIC(8, 2),
    dose_unit VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_medication_schedules_med ON medication_schedules(medication_id);

-- 3. Medication Doses table
CREATE TABLE IF NOT EXISTS medication_doses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES medication_schedules(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    taken_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_medication_doses_patient_sched ON medication_doses(patient_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_medication_doses_med_sched ON medication_doses(medication_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_medication_doses_status ON medication_doses(status);

-- 4. Medication Reminders table
CREATE TABLE IF NOT EXISTS medication_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    dose_id UUID REFERENCES medication_doses(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    reminder_time TIMESTAMPTZ NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    channel VARCHAR(50) NOT NULL DEFAULT 'IN_APP',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_medication_reminders_patient_status ON medication_reminders(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_medication_reminders_time ON medication_reminders(reminder_time);
