-- Supabase Database Schema for Patient Risk Monitoring System
-- Run this script in your Supabase SQL Editor to create tables, triggers, and RLS policies

-- =============================================
-- STEP 1: Create Tables
-- =============================================

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- =============================================
-- patients table
-- =============================================
CREATE TABLE patients (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth VARCHAR(20) NOT NULL,
  age INTEGER,
  gender VARCHAR(50),
  contact VARCHAR(255),
  admission_date VARCHAR(50),
  
  -- Vitals
  heart_rate INTEGER,
  systolic_bp INTEGER,
  diastolic_bp INTEGER,
  spo2 INTEGER,
  temperature DECIMAL(6,2),
  resp_rate INTEGER,
  
  -- Medical History (Boolean flags)
  diabetes BOOLEAN DEFAULT FALSE,
  copd BOOLEAN DEFAULT FALSE,
  cardiac_disease BOOLEAN DEFAULT FALSE,
  er_visits INTEGER DEFAULT 0,
  
  -- Lab Indicators (Boolean flags)
  wbc_elevated BOOLEAN DEFAULT FALSE,
  creatinine_high BOOLEAN DEFAULT FALSE,
  crp_high BOOLEAN DEFAULT FALSE,
  
  -- Notes and Risk Assessment
  notes TEXT,
  risk_score INTEGER,
  risk_level VARCHAR(20),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_patients_risk_level ON patients(risk_level);
CREATE INDEX idx_patients_updated_at ON patients(updated_at);
CREATE INDEX idx_patients_admission_date ON patients(admission_date);

-- =============================================
-- audit_logs table
-- =============================================
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  field VARCHAR(255) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  risk_score_before INTEGER,
  risk_level_before VARCHAR(20),
  risk_score_after INTEGER,
  risk_level_after VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_patient_id ON audit_logs(patient_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =============================================
-- STEP 2: Enable Row Level Security (RLS)
-- =============================================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 3: Create RLS Policies
-- =============================================

-- For now, we'll allow all operations (you can add authentication later)
-- These policies allow full access without authentication

-- Patients policies
CREATE POLICY "Allow all operations on patients"
  ON patients
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Audit logs policies
CREATE POLICY "Allow all operations on audit_logs"
  ON audit_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- STEP 4: Create Functions and Triggers
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on patients table
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STEP 5: Create Supabase Storage Bucket for PDFs
-- =============================================

-- Note: Run this separately in Supabase Dashboard > Storage
-- Or enable it via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdf-uploads', 'pdf-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to PDF uploads
CREATE POLICY "Allow public read access to pdf-uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pdf-uploads');

CREATE POLICY "Allow public write access to pdf-uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pdf-uploads');

CREATE POLICY "Allow public delete access to pdf-uploads"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'pdf-uploads');

-- =============================================
-- STEP 6: Insert Sample Data (Optional)
-- =============================================

-- Uncomment to insert sample patients for testing
/*
INSERT INTO patients (full_name, date_of_birth, age, gender, contact, admission_date,
  heart_rate, systolic_bp, diastolic_bp, spo2, temperature, resp_rate,
  diabetes, copd, cardiac_disease, er_visits,
  wbc_elevated, creatinine_high, crp_high,
  notes, risk_score, risk_level)
VALUES
('Sarah Jenkins', '1952-03-15', 72, 'Female', '555-0101', '2024-01-15',
  102, 110, 70, 91, 36.8, 20,
  TRUE, TRUE, FALSE, 1,
  FALSE, FALSE, FALSE,
  'Stable condition, requires monitoring', 6, 'HIGH'),

('John Smith', '1940-06-20', 84, 'Male', '555-0102', '2024-01-10',
  95, 140, 85, 94, 37.2, 18,
  FALSE, FALSE, TRUE, 0,
  FALSE, TRUE, TRUE,
  'Post-cardiac event, careful monitoring', 5, 'MEDIUM');
*/

-- =============================================
-- STEP 7: Verify Setup
-- =============================================

-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies
SELECT policyname, tablename, cmd 
FROM pg_policies 
WHERE schemaname = 'public';
