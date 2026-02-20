# Patient Risk Monitoring System - Complete Migration & Setup Guide

## Overview

This guide provides step-by-step instructions to set up the Patient Risk Monitoring System with Supabase as the database backend. The system consists of three layers:
- **Frontend**: React 19 with TypeScript, Vite
- **Backend**: Node.js/Express with Supabase integration
- **Database**: Supabase PostgreSQL (replaces MongoDB)

---

## Phase 1: Supabase Project Setup

### Step 1: Create a Supabase Project

1. Visit [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Sign in or create account
4. Fill in project details:
   - **Name**: `patient-risk-monitoring`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
   - **Pricing**: Select free tier for testing
5. Click **Create new project** and wait for setup (~2 minutes)

### Step 2: Retrieve Supabase Credentials

1. Go to **Settings → API**
2. Copy these three values (keep them secure):
   - **Project URL** → `SUPABASE_URL`
   - **anon key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire SQL script below:

```sql
-- Create patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "fullName" TEXT NOT NULL,
  "dateOfBirth" DATE NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  contact TEXT,
  "admissionDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "systolicBP" INTEGER,
  "diastolicBP" INTEGER,
  "heartRate" INTEGER,
  "respiratory" INTEGER,
  "temperature" NUMERIC(4,2),
  "diabetics" BOOLEAN DEFAULT FALSE,
  "copd" BOOLEAN DEFAULT FALSE,
  "cardiacDisease" BOOLEAN DEFAULT FALSE,
  "wbcElevated" BOOLEAN DEFAULT FALSE,
  "creatinineHigh" BOOLEAN DEFAULT FALSE,
  "crpHigh" BOOLEAN DEFAULT FALSE,
  notes TEXT,
  "riskScore" NUMERIC(5,2),
  "riskLevel" TEXT DEFAULT 'LOW' CHECK ("riskLevel" IN ('LOW', 'MEDIUM', 'HIGH')),
  "lastUpdated" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit logs table
CREATE TABLE "auditLogs" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "patientId" UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  field TEXT NOT NULL,
  "oldValue" TEXT,
  "newValue" TEXT,
  "riskScoreBefore" NUMERIC(5,2),
  "riskScoreAfter" NUMERIC(5,2),
  "riskLevelBefore" TEXT,
  "riskLevelAfter" TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_patients_risk_level ON patients("riskLevel");
CREATE INDEX idx_patients_updated_at ON patients("lastUpdated");
CREATE INDEX idx_audit_logs_patient_id ON "auditLogs"("patientId");
CREATE INDEX idx_audit_logs_timestamp ON "auditLogs"(timestamp);

-- Enable RLS (Row Level Security) - optional but recommended for production
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE "auditLogs" ENABLE ROW LEVEL SECURITY;

-- Create policies allowing public access (for development)
-- WARNING: This is for development only. For production, implement proper auth policies.
CREATE POLICY "Enable read access for all users" ON patients AS (SELECT) USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON patients AS (INSERT) WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON patients AS (UPDATE) USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON patients AS (DELETE) USING (true);

CREATE POLICY "Enable read access for all users" ON "auditLogs" AS (SELECT) USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON "auditLogs" AS (INSERT) WITH CHECK (true);
```

4. Click **Run** to execute the SQL
5. Verify tables appear in **Table Editor** left sidebar

---

## Phase 2: Backend Configuration

### Step 1: Create Backend Environment File

1. Navigate to `backend/` folder
2. Create file `backend/.env` with these contents:

```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=5000
NODE_ENV=development
```

**Replace with actual values from Phase 1, Step 2**

### Step 2: Install Backend Dependencies

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Verify these packages installed correctly:
# - @supabase/supabase-js (2.38.4+)
# - dotenv (16.3.1+)
# - express (5.2.1+)
```

### Step 3: Verify Supabase Connection

```bash
# Start the backend server
npm run dev

# Expected output:
# ✅ Supabase connected successfully
# Server running on http://localhost:5000
```

**Common errors and fixes**:
- **"Cannot read property 'from' of undefined"**: Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- **CORS error**: Backend CORS is configured in `server.js` to allow localhost:5173 (frontend)
- **Port 5000 in use**: Change `PORT` in `.env` to 5001 or higher

---

## Phase 3: Frontend Configuration

### Step 1: Create Frontend Environment File

1. Navigate to `patient/` folder
2. Create file `patient/.env.local` with:

```env
VITE_API_URL=http://localhost:5000/api
```

**Note**: The `.env.local` file is NOT uploaded to version control (already in `.gitignore`)

### Step 2: Install Frontend Dependencies

```bash
# Navigate to frontend folder
cd patient

# Install dependencies (if not already installed)
npm install

# Verify axios is installed:
# axios (^1.6.0+)
```

### Step 3: Start Frontend Development Server

```bash
# Start the Vite dev server
npm run dev

# Expected output:
# VITE v7.3.1 running at:
# ➜ Local: http://localhost:5173/
# ➜ Press q to quit
```

---

## Phase 4: System Integration Testing

### Test 1: Create a Patient

1. Open http://localhost:5173/patients in your browser
2. Click **"Add New Patient"**
3. Fill in all required fields:
   - Full Name
   - Date of Birth
   - Gender
   - Contact
   - Vital signs (Systolic BP, Diastolic BP, Heart Rate, etc.)
4. Click **Submit**

**Expected behaviors**:
- ✅ Patient appears in list immediately
- ✅ Data saved to Supabase database
- ✅ Risk level calculated and displayed
- ✅ No errors in browser console

### Test 2: View Patient Details

1. Click on any patient in the list
2. Verify all patient data displays correctly
3. Check **Audit Log** tab shows creation entry

### Test 3: Update Patient Data

1. Click **Edit** on a patient
2. Change a value (e.g., vital sign)
3. Click **Save**

**Expected behaviors**:
- ✅ Patient data updates in list
- ✅ Risk level recalculates if vitals changed
- ✅ Audit log shows the change with before/after values
- ✅ `lastUpdated` timestamp updates

### Test 4: Delete Patient

1. Click **Delete** on a patient (with confirmation)
2. Verify patient removed from list

**Expected behaviors**:
- ✅ Patient no longer visible in list
- ✅ Associated audit logs also deleted from Supabase (cascade)
- ✅ Dashboard metrics update

### Test 5: Dashboard Filtering

1. Go to **Home** page (dashboard)
2. Click on metric cards:
   - **High Risk** card → filters to HIGH risk patients
   - **Medium Risk** card → filters to MEDIUM risk patients
   - **Low Risk** card → filters to LOW risk patients

**Expected behaviors**:
- ✅ PatientList page loads with appropriate filter applied
- ✅ Only matching risk level patients display

### Test 6: PDF Upload (Optional)

1. Go to patient edit page
2. Upload a medical PDF document
3. System should parse and extract text

---

## Phase 5: Backend API Reference

The backend exposes the following REST endpoints:

### Patient Endpoints

#### GET /api/patients
Retrieve all patients
```bash
curl http://localhost:5000/api/patients
```
Returns: `Patient[]` (ordered by updated date, newest first)

#### POST /api/patients
Create new patient
```bash
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","age":45,...}'
```
Returns: `Patient` (with generated ID and risk calculated)

#### GET /api/patients/:id
Get specific patient with audit logs
```bash
curl http://localhost:5000/api/patients/uuid-here
```
Returns: `Patient` with complete history

#### PUT /api/patients/:id
Update patient and track changes
```bash
curl -X PUT http://localhost:5000/api/patients/uuid-here \
  -H "Content-Type: application/json" \
  -d '{"systolicBP":140,...}'
```
Returns: Updated `Patient` with new risk calculation and audit log entry

#### DELETE /api/patients/:id
Delete patient and associated audit logs
```bash
curl -X DELETE http://localhost:5000/api/patients/uuid-here
```
Returns: Soft delete success message; audit logs deleted via cascade

#### GET /api/patients/audit/:id
Get audit logs for patient
```bash
curl http://localhost:5000/api/patients/audit/uuid-here
```
Returns: `AuditLog[]` (ordered by timestamp, newest first)

---

## Phase 6: Data Management

### Backup Your Data

To export patient data from Supabase:

1. Go to **Supabase Dashboard → SQL Editor**
2. Create new query:
```sql
SELECT * FROM patients;
```
3. Click three dots → **Download as CSV**

### Clear All Data (Development Only)

**WARNING**: This is irreversible!

1. Go to **SQL Editor**
2. Run:
```sql
-- Delete all patients (deletes related audit logs automatically)
DELETE FROM patients;
```

---

## Phase 7: Troubleshooting

### Frontend Issues

**Issue**: "Cannot POST /api/patients" error
- **Cause**: Backend not running
- **Fix**: Verify backend started with `npm run dev` from `/backend` folder
- **Check**: Visit http://localhost:5000 in browser (should show Express)

**Issue**: patients list is empty despite adding patients
- **Cause**: Frontend using localStorage cache instead of API
- **Fix**: Clear localStorage: Press F12 → Application → localStorage → delete "patients" entry
- **Fix**: Reload page with Ctrl+Shift+R (hard refresh)

**Issue**: "CORS error: cross origin request blocked"
- **Cause**: Frontend URL not in backend CORS whitelist (check `server.js`)
- **Fix**: Verify frontend running on http://localhost:5173
- **Fix**: Verify backend CORS includes `http://localhost:5173`

### Backend Issues

**Issue**: "getpatients() is not a function" errors
- **Cause**: Supabase client not initialized
- **Fix**: Verify `.env` file has correct `SUPABASE_SERVICE_ROLE_KEY`
- **Fix**: Restart backend: Ctrl+C then `npm run dev`

**Issue**: Database query timeouts
- **Cause**: Supabase service degradation or overload
- **Fix**: Check Supabase status page: https://status.supabase.com
- **Fix**: Verify network connection and try again

**Issue**: "RLS violation" or "new row violates row-level security policy"
- **Cause**: Row-level security (RLS) policies too restrictive
- **Fix**: For development, disable RLS in Supabase SQL Editor:
```sql
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE "auditLogs" DISABLE ROW LEVEL SECURITY;
```
**Note**: Re-enable and configure properly before production deployment

### Database Issues

**Issue**: "relation 'patients' does not exist"
- **Cause**: Tables not created
- **Fix**: Execute the SQL script from Phase 3, Step 3

**Issue**: Cannot insert patient - "permission denied"
- **Cause**: Row-level security blocking inserts
- **Fix**: Run the RLS policy creation script from Phase 3, Step 3

---

## Phase 8: Production Deployment (Optional)

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Go to https://vercel.com → Import Project
3. Select your repository
4. Set environment variable: `VITE_API_URL=https://your-backend-domain.com/api`
5. Deploy

### Backend Deployment (Railway/Heroku)

1. Create account at https://railway.app
2. Create new project from GitHub
3. Set environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NODE_ENV=production`
   - `PORT=3000` (or Railway provided)
4. Deploy
5. Copy deployment URL
6. Update frontend `VITE_API_URL` to point to production backend

### Security Notes for Production

⚠️ **Critical**: Before deploying to production:

1. **Re-enable Row Level Security (RLS)**:
   - Current policies allow all access (development only)
   - Implement authentication-based policies
   - Reference: https://supabase.com/docs/guides/auth/row-level-security

2. **Use environment variable for Service Role Key**:
   - Never commit `.env` to GitHub
   - Use Railway/Vercel/Heroku environment variable

3. **Implement API authentication**:
   - Add JWT token validation in backend
   - Verify user identity before database access

4. **Enable HTTPS**:
   - Both frontend and backend must use HTTPS URLs
   - Update CORS whitelist with https URLs only

5. **Monitor database usage**:
   - Supabase free tier has limits
   - Set up billing alerts

---

## Quick Reference Commands

```bash
# Terminal 1: Start Backend
cd backend
npm install
npm run dev
# Expected: "✅ Supabase connected successfully"

# Terminal 2: Start Frontend  
cd patient
npm install
npm run dev
# Expected: "Local: http://localhost:5173"

# Test API endpoint
curl http://localhost:5000/api/patients

# Check if backend is running
curl http://localhost:5000

# Clear frontend cache
localStorage.clear()  # In browser console

# View backend logs
# Check terminal where "npm run dev" is running
```

---

## File Structure After Setup

```
Patient risk monitoring system/
├── backend/
│   ├── .env                          # ← CREATE: Supabase credentials
│   ├── .env.example
│   ├── config/
│   │   └── supabase.js              # Supabase client initialization
│   ├── controllers/
│   │   └── patientController.js     # Updated with Supabase queries
│   ├── routes/
│   │   └── patientRoutes.js         # Updated with DELETE endpoint
│   ├── server.js                    # Updated: Supabase connection test
│   ├── package.json                 # Updated: @supabase/supabase-js dependency
│   └── node_modules/                # Created by: npm install
│
├── patient/
│   ├── .env.local                   # ← CREATE: VITE_API_URL=http://localhost:5000/api
│   ├── src/
│   │   ├── services/
│   │   │   └── api.ts               # Updated: Axios HTTP client
│   │   ├── context/
│   │   │   └── PatientContext.tsx   # Updated: API calls instead of localStorage
│   │   └── components/
│   │       └── Dashboard/
│   │           └── Dashboard.tsx    # Uses context methods (now async)
│   └── node_modules/                # Created by: npm install
│
└── MIGRATION_AND_SETUP.md           # This file
```

---

## Support & Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **React Documentation**: https://react.dev
- **Express.js Guide**: https://expressjs.com
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

## Checklist for Successful Setup

- [ ] Supabase project created with correct region
- [ ] Credentials copied from Supabase (URL, Keys)
- [ ] Database tables created via SQL script
- [ ] `backend/.env` file created with correct credentials
- [ ] `backend/node_modules/` created (npm install successful)
- [ ] Backend server starts without errors (`npm run dev`)
- [ ] `patient/.env.local` file created with API URL
- [ ] `patient/node_modules/` created (npm install successful)
- [ ] Frontend starts without errors (`npm run dev`)
- [ ] Test: Create a patient in UI and verify it appears
- [ ] Test: Edit patient and verify audit log updates
- [ ] Test: Delete patient successfully
- [ ] Test: Dashboard metrics and filtering work
- [ ] All browser console errors resolved

---

**Last Updated**: 2024
**Version**: 1.0 - Complete Supabase Integration
