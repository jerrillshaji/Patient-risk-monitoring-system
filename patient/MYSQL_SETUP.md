# MySQL Database Setup

Run the following SQL in your MySQL server to create the `patients` and `auditLogs` tables.

```sql
-- Create patients table
CREATE TABLE patients (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  fullname VARCHAR(255) NOT NULL,
  dateofbirth VARCHAR(20) NOT NULL,
  age INT,
  gender VARCHAR(50),
  contact VARCHAR(255),
  admissiondate VARCHAR(20),

  heartrate INT,
  systolicbp INT,
  diastolicbp INT,
  spo2 INT,
  temperature DECIMAL(6,2),
  resprate INT,

  diabetics BOOLEAN DEFAULT FALSE,
  copd BOOLEAN DEFAULT FALSE,
  cardiacdisease BOOLEAN DEFAULT FALSE,
  ervists INT DEFAULT 0,

  wbcelevated BOOLEAN DEFAULT FALSE,
  creatininehigh BOOLEAN DEFAULT FALSE,
  crphigh BOOLEAN DEFAULT FALSE,

  notes TEXT,
  riskscore INT,
  risklevel VARCHAR(20),

  createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastupdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create audit logs table
CREATE TABLE auditLogs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  patientId BIGINT NOT NULL,
  field VARCHAR(255),
  oldValue TEXT,
  newValue TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_patients_riskLevel ON patients(risklevel);
CREATE INDEX idx_patients_lastupdated ON patients(lastupdated);
CREATE INDEX idx_auditLogs_patientId ON auditLogs(patientId);
CREATE INDEX idx_auditLogs_timestamp ON auditLogs(timestamp);
```
