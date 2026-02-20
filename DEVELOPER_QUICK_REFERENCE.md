# Developer Quick Reference - Patient Risk Monitoring System

## Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+ installed
- Git (optional)
- Supabase account created and project initialized

### Commands

```bash
# Terminal 1: Backend
cd backend
npm install
# Create .env file with Supabase credentials
npm run dev
# Output: ✅ Supabase connected successfully

# Terminal 2: Frontend  
cd patient
npm install
# Create .env.local file with VITE_API_URL
npm run dev
# Output: http://localhost:5173
```

---

## Architecture Overview

```
Frontend (React + TypeScript)
    ↓ (Axios HTTP calls)
Backend (Express.js API)
    ↓ (Supabase Client)
Database (Supabase PostgreSQL)
    ↓
Storage (audit logs, patient records)
```

**Communication**: 
- Frontend → Backend: HTTP (GET, POST, PUT, DELETE)
- Backend → Database: Supabase JavaScript Client SDK
- All communication is JSON

---

## File Organization

```
backend/
├── server.js                 # Express app, middleware setup
├── config/supabase.js        # Supabase client singleton
├── controllers/
│   ├── patientController.js  # Business logic (CRUD, risk calc)
│   └── pdfService.js         # PDF parsing (unchanged)
├── routes/
│   └── patientRoutes.js      # REST API endpoints
├── .env                       # Supabase credentials (NOT committed)
└── package.json             # Dependencies

patient/src/
├── services/
│   ├── api.ts               # Axios HTTP client layer
│   └── riskEngine.ts        # Risk calculation logic
├── context/
│   └── PatientContext.tsx   # State management + API integration
├── components/
│   ├── PatientList/         # Patient table display
│   ├── PatientDetails/      # Patient form
│   ├── Dashboard/           # Risk metrics
│   └── AuditLog/            # Change history
├── pages/
│   ├── HomePage.tsx         # Dashboard route
│   ├── PatientPage.tsx      # Patient list route
│   └── PatientEditPage.tsx  # New/edit patient route
└── types/types.ts           # TypeScript interfaces
```

---

## Key APIs & Functions

### Frontend API Service (`src/services/api.ts`)

All functions return `Promise<T>` and use Axios.

```typescript
// Get all patients - calls GET /api/patients
await api.getPatients(): Promise<Patient[]>

// Get single patient - calls GET /api/patients/:id
await api.getPatient(id): Promise<Patient>

// Create patient - calls POST /api/patients
await api.createPatient(patient): Promise<Patient>

// Update patient - calls PUT /api/patients/:id
await api.updatePatient(id, updates): Promise<Patient>

// Delete patient - calls DELETE /api/patients/:id
await api.deletePatient(id): Promise<void>

// Get audit logs - calls GET /api/patients/audit/:id
await api.getAuditLogs(id): Promise<AuditLog[]>

// Parse PDF - calls POST /api/patients/upload with FormData
await api.parsePDF(file): Promise<void>

// Fallback caching functions
api.getPatientsFromCache(): Patient[]
api.cachePatients(patients): void
```

### Patient Context (`src/context/PatientContext.tsx`)

**State**:
- `patients: Patient[]` - All loaded patients in memory
- `loading: boolean` - Loading state indicator

**Methods** (all async):
```typescript
// Read-only
const { patients, loading, getPatient, getDashboardMetrics } = usePatients();

// Mutations (call API + update local state)
await addPatient(patientInput)           // Create and call API
await updatePatient(id, updates)         // Update and call API
await deletePatient(id)                  // Delete from API
```

**Example Usage**:
```typescript
const { addPatient, patients, loading } = usePatients();

// Create patient
try {
  const newPatient = await addPatient({
    fullName: "John Doe",
    dateOfBirth: "1980-01-15",
    // ... other fields
  });
  console.log("Created:", newPatient.id);
} catch (error) {
  console.error("Failed to create patient:", error);
}

// Check data is loaded
if (loading) return <div>Loading...</div>;

// Use patient list
patients.forEach(p => console.log(p.fullName));
```

---

## Backend REST Endpoints

All endpoints are prefixed with `/api`:

### Patients

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET    | /patients | Fetch all patients | 200 |
| POST   | /patients | Create new patient | 201 |
| GET    | /patients/:id | Fetch patient with audit logs | 200 |
| PUT    | /patients/:id | Update patient and track changes | 200 |
| DELETE | /patients/:id | Delete patient (cascade to audit logs) | 200 |

### Audit Logs

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET    | /patients/audit/:id | Get change history for patient | 200 |

### File Upload

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST   | /patients/upload | Parse medical PDF | 200 |

### Health Check

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET    | / | Verify backend is running | 200 |

---

## Database Schema

### `patients` Table
```sql
Column Name           Type        Null  Default   Notes
────────────────────────────────────────────────────────
id                   UUID        NO    gen_uuid  Primary Key
fullName             TEXT        NO    -         Patient name
dateOfBirth          DATE        NO    -         For age calculation
age                  INTEGER     NO    -         Current age
gender               TEXT        NO    -         Male/Female/Other
contact              TEXT        YES   -         Phone/email
admissionDate        TIMESTAMP   NO    NOW()     Admission timestamp
systolicBP           INTEGER     YES   -         Blood pressure upper
diastolicBP          INTEGER     YES   -         Blood pressure lower
heartRate            INTEGER     YES   -         Beats per minute
respiratory          INTEGER     YES   -         Breaths per minute
temperature          NUMERIC     YES   -         Celsius
diabetics            BOOLEAN     NO    FALSE     Chronic condition flag
copd                 BOOLEAN     NO    FALSE     Chronic condition flag
cardiacDisease       BOOLEAN     NO    FALSE     Chronic condition flag
wbcElevated          BOOLEAN     NO    FALSE     Lab result flag
creatinineHigh       BOOLEAN     NO    FALSE     Lab result flag
crpHigh              BOOLEAN     NO    FALSE     Lab result flag
notes                TEXT        YES   -         Clinical notes
riskScore            NUMERIC     YES   -         Calculated score (0-100)
riskLevel            TEXT        YES   LOW       LOW/MEDIUM/HIGH
lastUpdated          TIMESTAMP   NO    NOW()     Last modification
createdAt            TIMESTAMP   NO    NOW()     Creation time

Indexes: riskLevel, lastUpdated (for query performance)
```

### `auditLogs` Table
```sql
Column Name           Type        Notes
────────────────────────────────────────
id                   UUID        Primary Key
patientId            UUID        FK → patients(id), ON CASCADE DELETE
field                TEXT        Which field changed ("systolicBP", etc)
oldValue             TEXT        Previous value
newValue             TEXT        New value
riskScoreBefore      NUMERIC     Risk before change
riskScoreAfter       NUMERIC     Risk after change
riskLevelBefore      TEXT        Risk level before
riskLevelAfter       TEXT        Risk level after
timestamp            TIMESTAMP   When change occurred

Indexes: patientId, timestamp (for efficient lookups)
```

---

## Environment Variables

### Backend (`.env`)
```env
# Supabase (from https://app.supabase.com/project/[id]/settings/api)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Server
PORT=5000
NODE_ENV=development
```

### Frontend (`.env.local`)
```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

**Note**: `.env` and `.env.local` are in `.gitignore` (not committed to git)

---

## Risk Calculation Algorithm

**Location**: `src/services/riskEngine.ts`

**Input**: Patient object with vital signs and chronic conditions

**Output**: Risk object `{ level: "LOW" | "MEDIUM" | "HIGH", score: number }`

**Algorithm Overview**:
1. Check for critical escalation conditions (e.g., systolic > 180)
2. Score vital signs against thresholds
3. Add points for chronic conditions
4. Add points for lab abnormalities
5. Calculate final score (0-100) and classification

**Example**:
```typescript
const risk = calculateRisk(patient);
console.log(risk); 
// Output: { level: "HIGH", score: 85, criticalEscalation: true }
```

---

## Common Development Tasks

### Add a New Patient Field

1. **Update database**:
   ```sql
   ALTER TABLE patients ADD COLUMN newField INTEGER DEFAULT 0;
   ```

2. **Update types** (`src/types/types.ts`):
   ```typescript
   interface Patient {
     // ... existing fields
     newField: number;
   }
   ```

3. **Update form** (`PatientEditPage.tsx`):
   ```tsx
   <input 
     value={formData.newField || 0}
     onChange={(e) => handleInputChange("newField", e.target.value)}
   />
   ```

4. **Update API mapping** (`api.ts` and `patientController.js`):
   - Ensure field is passed through correctly

### Debug API Issues

1. **Check backend logs**:
   ```bash
   # Terminal where `npm run dev` is running
   # Look for [addPatient], [updatePatient], etc logs
   ```

2. **Check browser console**:
   ```javascript
   // In DevTools console
   localStorage.getItem("patients")  // Check cache
   
   // Or use Network tab to see HTTP requests
   ```

3. **Test endpoint directly**:
   ```bash
   curl http://localhost:5000/api/patients
   ```

### Handle Offline State

Frontend has fallback logic:
```typescript
// In api.ts
try {
  return await apiClient.get("/patients");
} catch (error) {
  // If API fails, use cached patients from localStorage
  return getPatientsFromCache();
}
```

To test offline:
1. Close backend server
2. Frontend still works with cached data
3. Mutations will fail with error dialog
4. When backend restarts, data re-syncs

---

## Testing Checklist

- [ ] Backend starts: `✅ Supabase connected successfully`
- [ ] Frontend starts: `http://localhost:5173`
- [ ] Create patient → appears in list immediately
- [ ] Edit vital sign → risk level updates
- [ ] Audit log shows change with old/new values
- [ ] Delete patient → confirms and removes
- [ ] Dashboard metrics update when adding/deleting patients
- [ ] Filter by risk level works
- [ ] PDF upload parses text
- [ ] Browser console has no errors
- [ ] Network tab shows successful requests

---

## Debugging Logs

Enable debug logs in browser console:
```javascript
// In PatientContext.tsx, logs prefixed with [functionName]
// [useState init], [useEffect Save], [addPatient], etc
```

Look for:
- `[addPatient] Final patient:` - Verify all fields present
- `[updatePatient] API response:` - Confirm API returned updated patient
- `[useEffect loadPatients] API returned X patients` - Verify data load

---

## TypeScript Types Quick Reference

```typescript
// Main types in src/types/types.ts

interface Patient {
  id: string;                      // UUID
  fullName: string;
  dateOfBirth: string;             // Date string "YYYY-MM-DD"
  age: number;
  gender: Gender;                  // "Male" | "Female" | "Other"
  contact: string;
  admissionDate: string;           // ISO string
  
  // Vitals
  heartRate: number;
  systolicBP: number;
  diastolicBP: number;
  spo2: number;
  temperature: number;
  respRate: number;
  
  // Chronic conditions
  chronicConditions: {
    diabetes: boolean;
    copd: boolean;
    cardiacDisease: boolean;
  };
  
  // Labs
  labs: {
    wbc: boolean;
    creatinine: boolean;
    crp: boolean;
  };
  
  // Metadata
  riskScore: number;               // 0-100
  riskLevel: RiskLevel;            // "LOW" | "MEDIUM" | "HIGH"
  lastUpdated: string;             // ISO timestamp
  history: AuditLog[];
  notes?: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  field: string;
  oldValue: any;
  newValue: any;
  riskLevelBefore: RiskLevel;
  riskLevelAfter: RiskLevel;
  riskScoreBefore: number;
  riskScoreAfter: number;
}
```

---

## Performance Tips

1. **Pagination**: Currently all patients loaded at once. For 6000+ patients, implement pagination:
   ```typescript
   // In api.ts
   const getPatients = (page = 1, limit = 50) => {
     return apiClient.get(`/patients?page=${page}&limit=${limit}`);
   };
   ```

2. **Search**: Add client-side search before you have 1000+ patients:
   ```typescript
   const search = (query) => 
     patients.filter(p => p.fullName.includes(query));
   ```

3. **Caching**: PatientContext maintains in-memory cache. Use React Query for more sophisticated caching if needed.

4. **Lazy Loading**: Dashboard PieChart only re-renders when patient list changes (memoization).

---

## Deployment Checklist

### Before Production

- [ ] Update `.env` with production Supabase credentials
- [ ] Update `VITE_API_URL` to production backend URL
- [ ] Enable HTTPS for both frontend and backend
- [ ] Implementation Row-Level Security (RLS) policies in Supabase
- [ ] Remove development-only console.log statements
- [ ] Test all CRUD operations with production DB
- [ ] Set up database backups in Supabase

### Production Environment Variables

**Backend**:
```env
SUPABASE_URL=https://prod-xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ-prod-key...
PORT=3000
NODE_ENV=production
```

**Frontend**:
```env
VITE_API_URL=https://api.yourcompany.com/api
```

---

## Useful Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs
- **Express API**: https://expressjs.com/en/api.html
- **Axios Documentation**: https://axios-http.com/docs/intro

---

## Support

For issues:
1. Check `MIGRATION_AND_SETUP.md` troubleshooting section
2. Check backend terminal logs (look for errors)
3. Check browser console (F12 → Console tab)
4. Check Network tab in DevTools (F12 → Network, then reproduce action)

---

**Last Updated**: 2024  
**For**: Patient Risk Monitoring System v1.0
