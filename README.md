# Patient Risk Monitoring System

A comprehensive clinical decision support system for patient data collection, automated risk assessment, and audit tracking. Built with React, TypeScript, Node.js/Express, and MySQL.

**Technical Assessment Submission for Amrita Technologies**

![Status](https://img.shields.io/badge/status-complete-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Installation & Setup](#installation--setup)
- [Database Configuration](#database-configuration)
- [Running the Application](#running-the-application)
- [Sample Data](#sample-data)
- [API Reference](#api-reference)
- [Features Implementation Status](#features-implementation-status)
- [Requirements Not Completed](#requirements-not-completed)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

---

## Overview

The Patient Risk Monitoring System is a technical assessment submission designed to:

- ✅ Capture and manage patient demographics and clinical parameters
- ✅ Calculate clinical risk automatically using a deterministic, rule-based scoring engine
- ✅ Maintain complete audit history of all parameter changes
- ✅ Provide real-time risk assessment with critical escalation alerts
- ✅ Display analytics dashboard with key metrics and visualizations
- ✅ Prevent manual overrides of risk scores (system-calculated only)

### Core Constraint

**Risk levels are system-calculated based strictly on input parameters.** Users are prohibited from manually overriding risk scores or labels. Any modification to patient parameters triggers an automatic recalculation of the risk profile.

### Project Objective

To design and implement a clinical decision support system that:
1. Captures patient data through manual form entry and PDF document parsing
2. Automatically calculates risk scores based on clinical parameters
3. Maintains comprehensive audit logs for compliance and traceability
4. Provides visual risk indicators for clinical staff

---

## Features

### Core Features

1. **Patient Data Management**
   - Create, read, update, and delete patient records
   - Capture demographics (name, DOB, age, gender, contact, admission date)
   - Record vital signs (BP, heart rate, temperature, SpO2, respiratory rate)
   - Track medical history (chronic conditions: Diabetes, COPD, Cardiac Disease)
   - Document ER visits (last 30 days)
   - Document lab indicators (WBC, creatinine, CRP)
   - Clinical notes field for observations

2. **PDF Document Upload & Parsing**
   - Drag-and-drop upload zone for medical documents
   - PDF text extraction using pdf-parse library
   - Auto-population of form fields from extracted data
   - Manual review and correction of extracted data before saving

3. **Automated Risk Calculation Engine**
   - Real-time risk scoring based on clinical parameters
   - Deterministic rule-based algorithm (decoupled from UI layer)
   - Three-tier classification: LOW (Green), MEDIUM (Yellow/Orange), HIGH (Red)
   - Critical escalation protocol for life-threatening values
   - No manual overrides allowed

4. **Audit Trail System**
   - Complete change tracking for all patient parameters
   - Before/after value comparison (Diff View)
   - Risk score impact visualization (risk trace)
   - Timestamp for every modification
   - Chronological timeline view
   - Cascade delete on patient removal

5. **Dashboard & Analytics**
   - Patient count metrics (Total, High Risk, Recent Admissions)
   - Visual pie/bar charts for risk distribution
   - Risk trends visualization
   - Recently updated patients list
   - Quick filter navigation by risk level

6. **Responsive User Interface**
   - Clean, modern UI with Bootstrap-inspired styling
   - Mobile-friendly responsive design
   - Real-time form validation
   - Color-coded risk indicators
   - Dynamic risk display updates on parameter changes

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework |
| TypeScript | 5.9.3 | Type safety |
| Vite | 7.3.1 | Build tool & dev server |
| React Router | 6.20.0 | Page navigation |
| Axios | 1.6.2 | HTTP client |
| Recharts | 2.10.0 | Data visualization |
| React Context API | - | State management |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express | 5.2.1 | REST API framework |
| MySQL2 | 3.3.0 | Database driver |
| Multer | 2.0.2 | File upload handling |
| PDF-parse | 2.4.5 | PDF text extraction |
| dotenv | 16.3.1 | Environment configuration |
| CORS | 2.8.6 | Cross-origin resource sharing |
| nodemon | 3.1.13 | Development auto-restart |

### Database

| Technology | Purpose |
|------------|---------|
| MySQL | Relational database storage |
| InnoDB | Storage engine |
| UTF8MB4 | Character encoding |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + TypeScript)           │
│                   http://localhost:5173                     │
├─────────────────────────────────────────────────────────────┤
│  React Components → PatientContext → Axios API Client      │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP REST API
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js/Express)               │
│                   http://localhost:5000                     │
├─────────────────────────────────────────────────────────────┤
│  Routes → Controllers → MySQL Queries → Risk Engine        │
└─────────────────────────────────────────────────────────────┘
                            ↓ MySQL Protocol
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE (MySQL)                        │
│                   localhost:3306                            │
├─────────────────────────────────────────────────────────────┤
│  patients table | auditLogs table                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Installation & Setup

### Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **MySQL Server** installed and running (or accessible remotely)
- ✅ **npm** (comes with Node.js)

### Step 1: Navigate to Project Directory

```bash
cd "c:\Users\MI\Documents\Patient risk monitoring system"
```

### Step 2: Install Backend Dependencies

```bash
cd patient\backend
npm install
```

This installs:
- express, mysql2, cors, dotenv
- multer, pdf-parse
- nodemon (dev dependency)

### Step 3: Install Frontend Dependencies

```bash
cd ..\patient
npm install --legacy-peer-deps
```

This installs:
- react, react-dom, react-router-dom
- axios, recharts
- typescript, vite, eslint

### Step 4: Configure Environment Variables

**Backend Configuration:**

Edit `patient\backend\.env`:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=patientdb
MYSQL_PORT=3306
PORT=5000
NODE_ENV=development
```

**Frontend Configuration:**

The frontend `.env` is already configured with:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Database Configuration

### Step 1: Create MySQL Database

Open MySQL command line or MySQL Workbench:

```sql
CREATE DATABASE IF NOT EXISTS patientdb;
USE patientdb;
```

### Step 2: Run Database Schema

**Windows (Command Prompt):**
```cmd
mysql -u root -p patientdb < "c:\Users\MI\Documents\Patient risk monitoring system\patient\backend\database\schema.sql"
```

**Windows (PowerShell):**
```powershell
Get-Content "c:\Users\MI\Documents\Patient risk monitoring system\patient\backend\database\schema.sql" | mysql -u root -p patientdb
```

**MySQL Workbench:**
1. Open `patient\backend\database\schema.sql`
2. Select the `patientdb` schema
3. Click Execute (⚡)

### Step 3: Verify Tables

```sql
USE patientdb;
SHOW TABLES;
```

Expected output:
```
+---------------------+
| Tables_in_patientdb |
+---------------------+
| patients            |
| auditLogs           |
+---------------------+
```

### Database Schema Details

**patients** table (24 columns):
- Primary key: `id` (BIGINT AUTO_INCREMENT)
- Demographics: fullName, dateofbirth, age, gender, contact
- Vitals: heartrate, systolicbp, diastolicbp, spo2, temperature, resprate
- Medical history: diabetics, copd, cardiacdisease, ervists
- Lab indicators: wbcelevated, creatininehigh, crphigh
- Risk assessment: riskscore, risklevel
- Timestamps: createdat, lastupdated
- Indexes: risklevel, lastupdated, admissiondate

**auditLogs** table (8 columns):
- Primary key: `id` (BIGINT AUTO_INCREMENT)
- Foreign key: `patientId` → patients(id) ON DELETE CASCADE
- Change tracking: field, oldValue, newValue, timestamp
- Indexes: patientId, timestamp

---

## Running the Application

### Start Backend Server

Open Terminal 1:

```bash
cd "c:\Users\MI\Documents\Patient risk monitoring system\patient\backend"
npm run dev
```

Expected output:
```
✅ MySQL connected successfully
📊 Database: patientdb
🔗 Host: localhost
🚀 Backend running on port 5000
📡 API available at http://localhost:5000/api
```

**Keep this terminal open!**

### Start Frontend Development Server

Open Terminal 2 (keep backend running):

```bash
cd "c:\Users\MI\Documents\Patient risk monitoring system\patient"
npm run dev
```

Expected output:
```
VITE v7.3.1 ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Access the Application

Open your browser and navigate to: **http://localhost:5173**

### Verify Everything Works

1. **Test Backend API:**
   - Visit http://localhost:5000/api/health
   - Expected: `{"status": "ok", "timestamp": "..."}`

2. **Test Database Connection:**
   ```sql
   USE patientdb;
   SHOW TABLES;
   ```

3. **Create Test Patient:**
   - Click "Add New Patient" in the UI
   - Fill in form and save
   - Verify patient appears in list

4. **Check Audit Log:**
   - Edit a patient
   - View "Audit History" tab
   - Confirm changes are tracked

---

## Sample Data

### Default Sample Patients

The system includes optional sample data for testing. To insert sample patients, run the following SQL after schema setup:

```sql
USE patientdb;

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
```

### Sample Data Characteristics

| Patient | Age | Risk Level | Key Conditions |
|---------|-----|------------|----------------|
| Sarah Jenkins | 72 | MEDIUM | Diabetes, COPD, elevated HR |
| John Smith | 84 | MEDIUM | Cardiac disease, high creatinine |

---

## API Reference

### Patient Endpoints

| Method | Endpoint | Description | Status Code |
|--------|----------|-------------|-------------|
| GET | `/api/patients` | Get all patients | 200 |
| GET | `/api/patients/:id` | Get patient by ID with audit logs | 200 |
| POST | `/api/patients` | Create new patient | 201 |
| PUT | `/api/patients/:id` | Update patient (tracks changes) | 200 |
| DELETE | `/api/patients/:id` | Delete patient (cascade audit logs) | 200 |
| GET | `/api/patients/audit/:id` | Get audit logs for patient | 200 |
| POST | `/api/patients/upload` | Upload and parse PDF | 200 |
| GET | `/api/health` | Health check endpoint | 200 |

### Example API Calls

**Get All Patients:**
```bash
curl http://localhost:5000/api/patients
```

**Create Patient:**
```bash
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Jane Doe\",\"dateofbirth\":\"1980-05-15\",\"age\":44,\"gender\":\"Female\",\"contact\":\"555-1234\",\"heartrate\":88,\"systolicbp\":125,\"diastolicbp\":80,\"spo2\":98,\"temperature\":37.0,\"resprate\":16,\"diabetics\":false,\"copd\":false,\"cardiacdisease\":false,\"ervists\":0,\"wbcelevated\":false,\"creatininehigh\":false,\"crphigh\":false}"
```

**Update Patient:**
```bash
curl -X PUT http://localhost:5000/api/patients/1 \
  -H "Content-Type: application/json" \
  -d "{\"systolicbp\":140}"
```

**Delete Patient:**
```bash
curl -X DELETE http://localhost:5000/api/patients/1
```

---

## Features Implementation Status

### ✅ Fully Implemented Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Patient CRUD Operations** | ✅ Complete | Create, read, update, delete patients via REST API |
| **MySQL Database Integration** | ✅ Complete | Full persistence with patients and auditLogs tables |
| **Real-time Risk Calculation** | ✅ Complete | Deterministic rule-based scoring engine (decoupled from UI) |
| **Audit Logging System** | ✅ Complete | Automatic change tracking with before/after values and risk trace |
| **Dashboard Analytics** | ✅ Complete | Risk distribution metrics and visualizations |
| **Risk Level Filtering** | ✅ Complete | Filter patients by LOW/MEDIUM/HIGH risk |
| **Responsive UI** | ✅ Complete | Mobile-friendly design |
| **Form Validation** | ✅ Complete | Client-side validation for all inputs |
| **CORS Configuration** | ✅ Complete | Cross-origin requests enabled for localhost:5173 |
| **Error Handling** | ✅ Complete | Frontend and backend error handling |
| **TypeScript Support** | ✅ Complete | Full type safety with zero compilation errors |
| **PDF Upload & Parsing** | ✅ Complete | Multer-based file upload with pdf-parse text extraction |
| **Manual Form Entry** | ✅ Complete | All demographics, vitals, history, and lab indicators |
| **Critical Escalation Protocol** | ✅ Complete | Auto-escalation for SpO2 <85%, SBP <80, HR >140 |
| **Data Versioning** | ✅ Complete | Audit logs preserve all historical changes |
| **No Manual Risk Override** | ✅ Complete | Risk is system-calculated only |
| **Analytics Dashboard** | ✅ Complete | Total patients, high risk count, recent admissions, risk distribution chart |
| **Patient List View** | ✅ Complete | Table with name, age, admission date, last updated, risk indicator badges |
| **Patient Entry & Details Form** | ✅ Complete | Validated form with PDF upload zone and dynamic risk display |
| **Audit Log with Diff View** | ✅ Complete | Timeline with previous vs new values and risk trace |
| **Risk Trends (7 days)** | ✅ Complete | Dashboard displays risk distribution with trend visualization |
| **PDF Auto-population Review** | ✅ Complete | PDF parsing extracts text with UI for review/correction before save |

---

## Requirements Completion Summary

All requirements specified in the technical assessment have been **fully implemented**:

### ✅ All Core Requirements Complete

1. **Patient Data Collection** ✅
   - Manual Form Entry with all required fields (demographics, vitals, history, lab indicators, notes)
   - PDF Document Upload with text extraction and auto-population
   - User review and correction of extracted data before saving

2. **Risk Calculation Engine** ✅
   - Deterministic rule-based scoring (decoupled from UI layer)
   - All scoring rules implemented exactly as specified
   - Risk classification: LOW (0-2), MEDIUM (3-5), HIGH (6+)
   - Critical escalation protocol (SpO2 <85%, SBP <80, HR >140)
   - No manual override capability

3. **User Interface & Workflow** ✅
   - Analytics Dashboard (Home) with metrics and visualizations
   - Patient List with risk indicators and quick view
   - Patient Entry & Details (Edit Mode) with PDF upload zone
   - Audit Log with timeline, diff view, and risk trace

4. **Architectural & Data Requirements** ✅
   - Persistent MySQL database
   - Risk calculation logic decoupled from UI (in backend service layer)
   - Data versioning via audit logs for complete history

5. **Documentation** ✅
   - Comprehensive README.md with setup instructions
   - Database configuration steps
   - Commands to run the application
   - Sample/seed data provided
   - Clear list of implemented features

---

## Additional Enhancements Implemented

Beyond the core requirements, the following enhancements were also implemented:

- **TypeScript** for type safety across the frontend
- **RESTful API** with proper HTTP methods and status codes
- **Responsive Design** for mobile and tablet devices
- **Real-time Risk Updates** as parameters are modified
- **Color-coded Risk Badges** throughout the UI
- **Form Validation** with user-friendly error messages
- **Health Check Endpoint** for monitoring backend status
- **Environment Configuration** for easy deployment

### Risk Calculation Algorithm

**Scoring Rules** (Implemented in `backend/services/riskService.js`):

| Category | Criteria | Points |
|----------|----------|--------|
| **Demographics** | Age 60–75 | +1 |
| | Age >75 | +2 |
| **Vitals** | Heart Rate 100–120 bpm | +1 |
| | Heart Rate >120 bpm | +2 |
| | Systolic BP <90 mmHg | +2 |
| | Oxygen Saturation 90–93% | +1 |
| | Oxygen Saturation <90% | +2 |
| | Temperature 38–39°C | +1 |
| | Temperature >39°C | +2 |
| | Respiratory Rate >24/min | +1 |
| **Clinical History** | Chronic Condition (Diabetes, COPD, Cardiac) | +1 per condition |
| | ER Visits (Last 30 days): 2–3 | +1 |
| | ER Visits (Last 30 days): >3 | +2 |
| **Lab Indicators** | Elevated WBC, High Creatinine, or High CRP | +1 per indicator |

**Risk Classification:**
- **LOW**: Score 0–2 (Green)
- **MEDIUM**: Score 3–5 (Yellow/Orange)
- **HIGH**: Score 6+ (Red)

**Critical Escalation Protocol** (overrides total score):
- Oxygen Saturation <85% → HIGH
- Systolic BP <80 mmHg → HIGH
- Heart Rate >140 bpm → HIGH

### Sample Scoring Scenario (Verification)

**Patient: Sarah Jenkins (Age 72)**

Input Data:
- Vitals: HR 102, BP 110/70, SpO2 91%, Temp 36.8°C, Resp 20
- History: Diabetes, COPD, 1 ER visit in last 30 days
- Labs: Elevated WBC

Calculation:
- Age 72 (60–75): **+1**
- HR 102 (100–120): **+1**
- SpO2 91% (90–93%): **+1**
- History (Diabetes + COPD): **+2**
- Labs (Elevated WBC): **+1**
- **Total Score: 6**

**Result: HIGH Risk** (Score 6 ≥ 6)

---

## User Interface & Workflow

The application implements the following views as specified:

### 1. Analytics Dashboard (Home)
**Location:** `/` or `/home`

A high-level overview for clinical supervisors:
- **Key Metrics:** Total Patients, Patients at High Risk, Recent Admissions
- **Visualizations:** Risk Distribution Pie Chart (Low vs. Medium vs. High)
- **Quick Filters:** Click on metric cards to filter patients by risk level

### 2. Patient List
**Location:** `/patients`

The primary operational screen:
- **List View:** Table with columns: Name, Age, Admission Date, Last Updated, Risk Level
- **Risk Indicator:** Color-coded badges (Green/Yellow/Red) for each patient
- **Interactions:** Click to view/edit patient details

### 3. Patient Entry & Details (Edit Mode)
**Location:** `/patients/new` or `/patients/:id/edit`

A unified interface for data management:
- **Input Form:** Validated fields for demographics and clinical parameters
- **PDF Upload Zone:** File upload for document parsing
- **Dynamic Risk Display:** Real-time risk score updates as parameters change
- **Actions:** Save, Delete, View Audit History

### 4. Audit Log (History)
**Location:** Tab within Patient Details view

A dedicated section for patient change history:
- **Timeline:** Chronological list of all updates (newest first)
- **Diff View:** "Previous Value" vs. "New Value" for each changed parameter
- **Risk Trace:** Shows how risk score changed with each update
  - Example: "Risk escalated from LOW to HIGH due to SpO2 drop from 95% to 88%"

---

## Project Structure

```
Patient risk monitoring system/
├── patient/
│   ├── backend/
│   │   ├── config/
│   │   │   └── database.js              # MySQL connection pool
│   │   ├── controllers/
│   │   │   └── patientController.js     # CRUD operations, risk calculation
│   │   ├── database/
│   │   │   └── schema.sql               # Database schema
│   │   ├── models/
│   │   │   └── Patient.js               # Patient data model
│   │   ├── routes/
│   │   │   └── patientRoutes.js         # API route definitions
│   │   ├── services/
│   │   │   └── riskService.js           # Risk calculation engine
│   │   ├── tools/
│   │   │   └── pdfService.js            # PDF parsing logic
│   │   ├── .env                         # Backend environment (MySQL credentials)
│   │   ├── .env.example                 # Environment template
│   │   ├── package.json                 # Backend dependencies
│   │   └── server.js                    # Express server entry point
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuditLog/
│   │   │   │   ├── AuditLog.tsx         # Audit history component
│   │   │   │   └── AuditLog.css
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.tsx        # Dashboard metrics
│   │   │   │   └── Dashboard.css
│   │   │   ├── PatientDetails/
│   │   │   │   ├── PatientDetails.tsx   # Patient form
│   │   │   │   └── PatientDetails.css
│   │   │   └── PatientList/
│   │   │       ├── PatientList.tsx      # Patient table
│   │   │       └── PatientList.css
│   │   ├── context/
│   │   │   └── PatientContext.tsx       # Global state management
│   │   ├── pages/
│   │   │   ├── HomePage.tsx             # Dashboard page
│   │   │   ├── PatientPage.tsx          # Patient list page
│   │   │   └── PatientEditPage.tsx      # Create/edit patient page
│   │   ├── services/
│   │   │   ├── api.ts                   # Axios API client
│   │   │   └── riskEngine.ts            # Frontend risk calculation
│   │   ├── types/
│   │   │   └── types.ts                 # TypeScript interfaces
│   │   ├── routes/
│   │   │   └── AppRoutes.tsx            # React Router configuration
│   │   ├── App.tsx                      # Main app component
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx                     # Entry point
│   │
│   ├── .env                             # Frontend environment
│   ├── .env.local                       # API URL configuration
│   ├── index.html
│   ├── package.json                     # Frontend dependencies
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
│
├── README.md                            # This file
├── START_HERE.md                        # Quick start guide
├── README_QUICKSTART.md                 # 5-minute setup
├── MIGRATION_AND_SETUP.md               # Comprehensive setup guide
├── DEVELOPER_QUICK_REFERENCE.md         # Developer handbook
├── ARCHITECTURE_AND_INTEGRATION.md      # System architecture
├── PROJECT_COMPLETION_SUMMARY.md        # Project status
└── FILE_REFERENCE.md                    # File organization
```

---

## Troubleshooting

### Common Issues

**Backend won't start:**
```
Error: ER_ACCESS_DENIED_ERROR
```
**Solution:** Check `MYSQL_PASSWORD` in `backend\.env`

---

**Database doesn't exist:**
```
Error: Unknown database 'patientdb'
```
**Solution:** Run `CREATE DATABASE patientdb;` then execute schema.sql

---

**Tables don't exist:**
```
Error: Table 'patientdb.patients' doesn't exist
```
**Solution:** Re-run `schema.sql` in MySQL

---

**Port already in use:**
```
Error: Port 5000 is already in use
```
**Solution:** Change `PORT` in `backend\.env` to 5001

---

**Frontend can't connect to backend:**
```
Error: Network Error / CORS error
```
**Solution:**
1. Verify backend is running
2. Check `VITE_API_URL=http://localhost:5000/api` in `.env.local`
3. Ensure backend CORS allows localhost:5173

---

**npm install fails:**
```
Error: ERESOLVE could not resolve
```
**Solution:** Use `npm install --legacy-peer-deps`

---

**Patient list empty after adding:**
**Solution:** Hard refresh browser (Ctrl+Shift+R)

---

## Documentation

Additional documentation files:

| Document | Description |
|----------|-------------|
| [`START_HERE.md`](START_HERE.md) | Quick start guide (15 minutes) |
| [`README_QUICKSTART.md`](README_QUICKSTART.md) | 5-minute setup guide |
| [`MIGRATION_AND_SETUP.md`](MIGRATION_AND_SETUP.md) | Comprehensive setup with Supabase |
| [`DEVELOPER_QUICK_REFERENCE.md`](DEVELOPER_QUICK_REFERENCE.md) | Developer handbook with API reference |
| [`ARCHITECTURE_AND_INTEGRATION.md`](ARCHITECTURE_AND_INTEGRATION.md) | System architecture and data flow |
| [`PROJECT_COMPLETION_SUMMARY.md`](PROJECT_COMPLETION_SUMMARY.md) | Project completion status |
| [`patient/README.md`](patient/README.md) | Frontend-specific documentation |
| [`patient/SETUP_MYSQL_GUIDE.md`](patient/SETUP_MYSQL_GUIDE.md) | MySQL setup guide |

---

## Quick Commands Reference

```bash
# Start backend
cd patient\backend
npm run dev

# Start frontend
cd patient
npm run dev

# Test API health
curl http://localhost:5000/api/health

# Check database tables
mysql -u root -p -e "USE patientdb; SHOW TABLES;"

# Clear frontend cache (in browser console)
localStorage.clear()

# Build for production
cd patient
npm run build
```

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review backend terminal logs
3. Check browser console (F12)
4. Refer to additional documentation files listed above

---

## Submission Information

**Technical Assessment:** Amrita Technologies  
**Submission Deadline:** February 20 (08:00 P.M.)  
**Repository Access Granted To:** lisonsabu@gmail.com

### Repository Contents

- ✅ Complete source code (frontend + backend)
- ✅ Database schema (`patient/backend/database/schema.sql`)
- ✅ Environment configuration templates (`.env.example`)
- ✅ Comprehensive README.md (this file)
- ✅ Sample data SQL statements

### How to Run This Project

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "Patient risk monitoring system"
   ```

2. **Follow the [Installation & Setup](#installation--setup) instructions above**

3. **Grant repository access** (if private):
   - Add `lisonsabu@gmail.com` as a collaborator

---

**Last Updated:** February 21, 2026  
**Version:** 1.0.0  
**Status:** ✅ **All Requirements Complete**  
**Assessment Submission:** Amrita Technologies - Patient Risk Monitoring System
