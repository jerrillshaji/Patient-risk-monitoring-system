-- MySQL Database Setup for Patient Risk Monitoring System
-- Run this script in your MySQL server to create the database and tables

-- Step 1: Create database (uncomment if you need to create it)
-- CREATE DATABASE IF NOT EXISTS patientdb;
-- USE patientdb;

-- Step 2: Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS auditLogs;
DROP TABLE IF EXISTS patients;

-- Step 3: Create patients table
CREATE TABLE patients (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  fullname VARCHAR(255) NOT NULL,
  dateofbirth VARCHAR(20) NOT NULL,
  age INT,
  gender VARCHAR(50),
  contact VARCHAR(255),
  admissiondate VARCHAR(50),

  -- Vitals
  heartrate INT,
  systolicbp INT,
  diastolicbp INT,
  spo2 INT,
  temperature DECIMAL(6,2),
  resprate INT,

  -- Medical History (Boolean flags)
  diabetics BOOLEAN DEFAULT FALSE,
  copd BOOLEAN DEFAULT FALSE,
  cardiacdisease BOOLEAN DEFAULT FALSE,
  ervists INT DEFAULT 0,

  -- Lab Indicators (Boolean flags)
  wbcelevated BOOLEAN DEFAULT FALSE,
  creatininehigh BOOLEAN DEFAULT FALSE,
  crphigh BOOLEAN DEFAULT FALSE,

  -- Notes and Risk Assessment
  notes TEXT,
  riskscore INT,
  risklevel VARCHAR(20),

  -- Timestamps
  createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastupdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Indexes for performance
  INDEX idx_risklevel (risklevel),
  INDEX idx_lastupdated (lastupdated),
  INDEX idx_admissiondate (admissiondate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 4: Create audit logs table
CREATE TABLE auditLogs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  patientId BIGINT NOT NULL,
  field VARCHAR(255) NOT NULL,
  oldValue TEXT,
  newValue TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key constraint
  CONSTRAINT fk_audit_patient FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,

  -- Indexes for performance
  INDEX idx_patientId (patientId),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 5: Insert sample data (optional - for testing)
-- Uncomment the following lines to insert sample patients

/*
INSERT INTO patients (fullname, dateofbirth, age, gender, contact, admissiondate,
  heartrate, systolicbp, diastolicbp, spo2, temperature, resprate,
  diabetics, copd, cardiacdisease, ervists,
  wbcelevated, creatininehigh, crphigh,
  notes, riskscore, risklevel)
VALUES
('Sarah Jenkins', '1952-03-15', 72, 'Female', '555-0101', '2024-01-15',
  102, 110, 70, 91, 36.8, 20,
  TRUE, TRUE, FALSE, 1,
  FALSE, FALSE, FALSE,
  'Stable condition, requires monitoring', 4, 'MEDIUM'),

('John Smith', '1940-06-20', 84, 'Male', '555-0102', '2024-01-10',
  95, 140, 85, 94, 37.2, 18,
  FALSE, FALSE, TRUE, 0,
  FALSE, TRUE, TRUE,
  'Post-cardiac event, careful monitoring', 5, 'MEDIUM');
*/

-- Step 6: Verify tables created
SHOW TABLES;
DESCRIBE patients;
DESCRIBE auditLogs;
