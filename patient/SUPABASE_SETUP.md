# Supabase Database Setup Guide (DEPRECATED)

This file documents the previous Supabase/Postgres migration. The project now uses MySQL.
See [MYSQL_SETUP.md](../MYSQL_SETUP.md) at the repository root for the current setup instructions.

## 🚀 Quick Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project:
   - Project name: `patient-risk-monitoring`
   - Database password: (save this securely)
   - Region: Choose closest to you

### Step 2: Get Credentials

In your Supabase dashboard:

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Create Database Tables

Go to **SQL Editor** in Supabase dashboard and run this script:

```sql
-- Create patients table
CREATE TABLE patients (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  fullName VARCHAR(255) NOT NULL,
  dateOfBirth VARCHAR(20) NOT NULL,
  age INT,
  gender VARCHAR(50),
  contact VARCHAR(255),
  admissionDate VARCHAR(20),
  
  -- Vitals
  heartRate INT,
  systolicBP INT,
  diastolicBP INT,
  spo2 INT,
  temperature FLOAT,
  respRate INT,
  
  -- Medical History
  diabetics BOOLEAN DEFAULT FALSE,
  copd BOOLEAN DEFAULT FALSE,
  cardiacDisease BOOLEAN DEFAULT FALSE,
  erVisits INT DEFAULT 0,
  
  -- Lab Indicators
  wbcElevated BOOLEAN DEFAULT FALSE,
  creatinineHigh BOOLEAN DEFAULT FALSE,
  crpHigh BOOLEAN DEFAULT FALSE,
  
  -- Notes and Risk
  notes TEXT,
  riskScore INT,
  riskLevel VARCHAR(20),
  
  -- Metadata
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Create audit logs table
CREATE TABLE "auditLogs" (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  patientId BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  field VARCHAR(255),
  oldValue TEXT,
  newValue TEXT,
  oldRisk VARCHAR(20),
  newRisk VARCHAR(20),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_patients_riskLevel ON patients(riskLevel);
CREATE INDEX idx_patients_updatedAt ON patients(updatedAt DESC);
CREATE INDEX idx_auditLogs_patientId ON "auditLogs"(patientId);
CREATE INDEX idx_auditLogs_timestamp ON "auditLogs"(timestamp DESC);
```

### Step 4: Configure Backend

1. Navigate to backend directory:
```bash
cd patient/backend
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Edit `.env` and add your Supabase credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=5000
NODE_ENV=development
```

4. Install dependencies:
```bash
npm install
```

5. Start backend:
```bash
npm run dev
```

Expected output:
```
✅ Supabase connected successfully
Backend running on port 5000
```

### Step 5: Configure Frontend

1. Navigate to frontend directory:
```bash
cd patient
```

2. Create `.env.local` file:
```bash
echo "VITE_API_URL=http://localhost:5000/api" > .env.local
```

3. Install dependencies:
```bash
npm install
```

4. Start frontend:
```bash
npm run dev
```

## 📝 Database Schema

### patients table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Auto-generated primary key |
| fullName | VARCHAR | Patient's full name |
| dateOfBirth | VARCHAR | Patient's date of birth (YYYY-MM-DD) |
| age | INT | Patient's current age |
| gender | VARCHAR | Male/Female/Other |
| contact | VARCHAR | Phone or email |
| admissionDate | VARCHAR | Date admitted (YYYY-MM-DD) |
| heartRate | INT | Beats per minute |
| systolicBP | INT | Systolic blood pressure |
| diastolicBP | INT | Diastolic blood pressure |
| spo2 | INT | Oxygen saturation percentage |
| temperature | FLOAT | Body temperature in Celsius |
| respRate | INT | Respiratory rate |
| diabetics | BOOLEAN | Has diabetes condition |
| copd | BOOLEAN | Has COPD condition |
| cardiacDisease | BOOLEAN | Has cardiac disease |
| erVisits | INT | ER visits in last 30 days |
| wbcElevated | BOOLEAN | Elevated WBC lab indicator |
| creatinineHigh | BOOLEAN | High creatinine lab indicator |
| crpHigh | BOOLEAN | High CRP lab indicator |
| notes | TEXT | Additional clinical notes |
| riskScore | INT | Calculated risk score |
| riskLevel | VARCHAR | LOW/MEDIUM/HIGH |
| createdAt | TIMESTAMP | Record creation time |
| updatedAt | TIMESTAMP | Last update time |

### auditLogs table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Auto-generated primary key |
| patientId | BIGINT | Foreign key to patients |
| field | VARCHAR | Field name that changed |
| oldValue | TEXT | Previous value |
| newValue | TEXT | New value |
| oldRisk | VARCHAR | Previous risk level |
| newRisk | VARCHAR | New risk level |
| timestamp | TIMESTAMP | When change occurred |

## 🔄 API Endpoints

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get single patient
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Audit
- `GET /api/patients/audit/:id` - Get audit logs for patient

### Files
- `POST /api/patients/upload` - Upload and parse PDF

## 🧪 Testing Connection

Run this from the frontend console:

```javascript
fetch('http://localhost:5000/api/patients')
  .then(r => r.json())
  .then(d => console.log('Connected!', d))
  .catch(e => console.error('Connection failed:', e))
```

Expected: Empty array `[]` on first run

## 🔐 Security Notes

- **Never** commit `.env` files to version control
- Use `SUPABASE_SERVICE_ROLE_KEY` only on backend
- Use `SUPABASE_ANON_KEY` only on frontend (if needed)
- Set appropriate Row Level Security (RLS) policies in Supabase for production
- Enable 2FA on Supabase account

## 🐛 Troubleshooting

### Backend won't connect
```
Error: Missing Supabase credentials
```
**Solution:** Check `.env` file exists in backend folder with correct credentials

### Frontend can't reach backend
```
Error: /api/patients net::ERR_CONNECTION_REFUSED
```
**Solution:** 
- Make sure backend is running (`npm run dev` in backend folder)
- Check VITE_API_URL in frontend `.env.local`

### Database errors
```
Error: 42P07: relation "patients" already exists
```
**Solution:** Table already exists. Either drop existing tables or skip creation.

### CORS errors
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Backend already has CORS enabled. Check browser console for specific error.

## 📚 Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Guide](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Query for better data fetching](https://tanstack.com/query/)

## 🚀 Deployment Notes

For production deployment:

1. Use environment variables in your hosting platform
2. Enable Row Level Security (RLS) in Supabase
3. Set up proper authentication
4. Use connection pooling for better performance
5. Enable backups in Supabase
6. Set up monitoring and logging
7. Use HTTPS for all API calls

---

**Last Updated:** February 20, 2026
