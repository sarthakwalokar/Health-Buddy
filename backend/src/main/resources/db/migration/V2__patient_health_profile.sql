-- Health Buddy Schema Migration V2: Patient Health Profile & Medical History

-- 1. Extend Patient Profiles with Demographics & Address
ALTER TABLE patient_profiles
    ADD COLUMN IF NOT EXISTS height_cm NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS occupation VARCHAR(255),
    ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50),
    ADD COLUMN IF NOT EXISTS profile_photo_url VARCHAR(1024),
    ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100),
    ADD COLUMN IF NOT EXISTS address_line VARCHAR(255),
    ADD COLUMN IF NOT EXISTS city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS state VARCHAR(100),
    ADD COLUMN IF NOT EXISTS postal_code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- 2. Patient Allergies Table
CREATE TABLE IF NOT EXISTS patient_allergies (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    allergen VARCHAR(255) NOT NULL,
    reaction VARCHAR(255),
    severity VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Patient Chronic Conditions Table
CREATE TABLE IF NOT EXISTS patient_conditions (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    condition_name VARCHAR(255) NOT NULL,
    diagnosed_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    source VARCHAR(50) NOT NULL DEFAULT 'PATIENT_REPORTED',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Patient Surgical History Table
CREATE TABLE IF NOT EXISTS patient_surgeries (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    procedure_name VARCHAR(255) NOT NULL,
    date_of_surgery DATE,
    hospital_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Patient Family Medical History Table
CREATE TABLE IF NOT EXISTS patient_family_histories (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    relationship VARCHAR(50) NOT NULL,
    condition VARCHAR(255) NOT NULL,
    age_of_onset INT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Patient Lifestyle Table (1-to-1 with patient_profiles)
CREATE TABLE IF NOT EXISTS patient_lifestyles (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL UNIQUE REFERENCES patient_profiles(id) ON DELETE CASCADE,
    smoking_status VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN',
    alcohol_status VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN',
    activity_level VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN',
    dietary_preference VARCHAR(50) NOT NULL DEFAULT 'NOT_SPECIFIED',
    sleep_hours NUMERIC(4, 1),
    water_intake_liters NUMERIC(4, 2),
    occupation_type VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Patient Health Goals Table
CREATE TABLE IF NOT EXISTS patient_health_goals (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL,
    description VARCHAR(500) NOT NULL,
    target_value VARCHAR(100),
    target_unit VARCHAR(50),
    target_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Query Optimization & Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_patient_allergies_patient_id ON patient_allergies(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_conditions_patient_id ON patient_conditions(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_surgeries_patient_id ON patient_surgeries(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_family_histories_patient_id ON patient_family_histories(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_health_goals_patient_id ON patient_health_goals(patient_id);
