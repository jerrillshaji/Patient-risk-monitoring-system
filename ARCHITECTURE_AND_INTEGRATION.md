# System Architecture & Integration Guide

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER (React)                  │
│                   Port: 5173 (Development)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React Components & Pages                  │ │
│  │  ├── PatientEditPage (create/edit)                    │ │
│  │  ├── PatientPage (list view)                          │ │
│  │  ├── Dashboard (metrics)                              │ │
│  │  └── AuditLog (change history)                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                         ↓ (HTTP calls)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         PatientContext (State Management)             │ │
│  │  ├── patients: Patient[]                              │ │
│  │  ├── loading: boolean                                 │ │
│  │  └── Async methods: addPatient, updatePatient, etc.   │ │
│  └────────────────────────────────────────────────────────┘ │
│                         ↓ (JSON)                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │      API Service (axios HTTP client)                  │ │
│  │  ├── patientAPI.getPatients()                         │ │
│  │  ├── patientAPI.createPatient()                       │ │
│  │  ├── patientAPI.updatePatient()                       │ │
│  │  └── patientAPI.deletePatient()                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
           ↓ (HTTP REST API calls on http://localhost:5000)
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND LAYER (Express)                  │
│                   Port: 5000 (Development)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │              REST API Routes & Handlers               │ │
│  │  GET    /api/patients                                 │ │
│  │  POST   /api/patients                                 │ │
│  │  GET    /api/patients/:id                             │ │
│  │  PUT    /api/patients/:id                             │ │
│  │  DELETE /api/patients/:id                             │ │
│  │  GET    /api/patients/audit/:id                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                         ↓                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Patient Controller (Business Logic)           │ │
│  │  ├── createPatient() - Generate ID, calc risk         │ │
│  │  ├── getAllPatients() - Fetch & sort by date          │ │
│  │  ├── getPatient() - Single patient with audit        │ │
│  │  ├── updatePatient() - Update & track changes        │ │
│  │  ├── deletePatient() - Remove & cascade delete       │ │
│  │  └── getAuditLogs() - Get change history             │ │
│  └────────────────────────────────────────────────────────┘ │
│                         ↓ (JavaScript SDK)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Supabase Client (Database Interface)          │ │
│  │  supabase.from("patients").select()                   │ │
│  │  supabase.from("patients").insert()                   │ │
│  │  supabase.from("patients").update()                   │ │
│  │  supabase.from("patients").delete()                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
          ↓ (PostgreSQL queries over HTTPS to cloud)
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE LAYER (Supabase)                  │
│                   Cloud-hosted PostgreSQL                   │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │  TABLE: patients (24 columns)                          │ │
│  │  ├── id (UUID primary key)                            │ │
│  │  ├── fullName, dateOfBirth, age, gender              │ │
│  │  ├── Vital signs (systolicBP, heartRate, temp, etc)  │ │
│  │  ├── Chronic conditions (diabetes, COPD, etc)        │ │
│  │  ├── Lab results (WBC, creatinine, CRP)              │ │
│  │  ├── riskScore, riskLevel                             │ │
│  │  └── Timestamps (createdAt, lastUpdated)              │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  TABLE: auditLogs (8 columns)                          │ │
│  │  ├── id, patientId (FK)                               │ │
│  │  ├── field, oldValue, newValue                        │ │
│  │  ├── riskBefore, riskAfter, riskLevelBefore/After   │ │
│  │  └── timestamp                                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Creating a New Patient

```
User Input (Form)
       ↓
handleSave() [PatientEditPage.tsx]
       ↓
validateForm() - Check required fields
       ↓
addPatient(patientInput) [PatientContext.tsx]
       ↓
Risk Calculation [riskEngine.ts]
       ↓
patientAPI.createPatient() [api.ts]
       ↓
HTTP POST http://localhost:5000/api/patients
       ↓
createPatient() [patientController.js]
       ↓
Risk Calculation [backend]
       ↓
supabase.from("patients").insert()
       ↓
PostgreSQL: INSERT INTO patients (...)
       ↓
Database Response (created patient with ID)
       ↓
Return response to frontend
       ↓
Update PatientContext.patients state
       ↓
Component re-renders
       ↓
Patient appears in list
```

### 2. Updating Patient & Tracking Changes

```
User edits vital sign
       ↓
handleInputChange() - Updates formData state
       ↓
Risk recalculates on vital change
       ↓
User clicks Save
       ↓
handleSave()
       ↓
updatePatient(id, changes) [PatientContext.tsx]
       ↓
patientAPI.updatePatient() [api.ts]
       ↓
HTTP PUT http://localhost:5000/api/patients/:id
       ↓
updatePatient() [patientController.js]
       ├─ Fetch old patient data
       ├─ Calculate old risk
       ├─ Calculate new risk
       ├─ Detect field changes
       └─ Create audit log entries
       ↓
supabase.from("patients").update()
supabase.from("auditLogs").insert()
       ↓
PostgreSQL: UPDATE patients SET ...
            INSERT INTO auditLogs (...)
       ↓
Return updated patient + audit logs
       ↓
Update PatientContext state
       ↓
UI shows updated data & audit history
```

### 3. Deleting Patient & Cascade Delete

```
User clicks Delete
       ↓
Confirm dialog
       ↓
handleDelete() [PatientEditPage.tsx]
       ↓
deletePatient(id) [PatientContext.tsx]
       ↓
patientAPI.deletePatient() [api.ts]
       ↓
HTTP DELETE http://localhost:5000/api/patients/:id
       ↓
deletePatient() [patientController.js]
       ↓
supabase.from("patients").delete().eq("id", id)
       ↓
PostgreSQL: DELETE FROM patients WHERE id = ...
            (CASCADE deletes auditLogs automatically)
       ↓
Return success response
       ↓
Update PatientContext (remove from patients array)
       ↓
Navigate back to /patients
       ↓
Patient removed from list
```

---

## Request/Response Flow Example

### Create Patient Request

```javascript
// Frontend sends:
POST /api/patients HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "fullName": "John Doe",
  "dateOfBirth": "1980-05-15",
  "age": 44,
  "gender": "Male",
  "contact": "555-1234",
  "admissionDate": "2024-01-15",
  "sistolicBP": 145,
  "diastolicBP": 92,
  "heartRate": 88,
  "respRate": 18,
  "temperature": 37.2,
  "spo2": 98,
  "chronicConditions": {
    "diabetes": true,
    "copd": false,
    "cardiacDisease": true
  },
  "labs": {
    "wbc": true,
    "creatinine": true,
    "crp": false
  },
  "notes": "Patient with diabetes history"
}

// Backend calculates risk and returns:
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "fullName": "John Doe",
  "dateOfBirth": "1980-05-15",
  "age": 44,
  "gender": "Male",
  // ... all other fields
  "riskScore": 72.5,
  "riskLevel": "HIGH",
  "lastUpdated": "2024-01-15T10:30:45Z",
  "createdAt": "2024-01-15T10:30:45Z"
}

// Frontend receives, updates state, UI reflects change
```

---

## State Management Flow

### PatientContext State Lifecycle

```
Initial Load:
1. Component mounts
2. useState initializes patients from localStorage (if available)
3. useEffect triggers
4. patientAPI.getPatients() called (HTTP request to backend)
5. Backend fetches from Supabase, returns array
6. setPatients() updates state
7. localStorage synchronized as backup
8. Components re-render with new data

User Action (e.g., create):
1. User submits form
2. addPatient() awaited
3. Calls patientAPI.createPatient() (HTTP POST)
4. Backend creates in Supabase, returns patient object
5. setPatients() adds to array
6. localStorage updated
7. Components using patients array re-render
8. Navigation to list page

Error Handling:
1. API call fails
2. Promise rejected with error
3. Caught in try/catch
4. User sees alert dialog
5. Form state unchanged (user can retry/edit)
```

---

## Component Interaction Map

```
App (Routes)
├── HomePage
│   └── Dashboard
│       └── usePatients() [read-only]
│           ├── Filter by risk level
│           └── Navigate to PatientPage with filter
│
├── PatientPage
│   └── usePatients() [read-only]
│       ├── Display filtered list
│       └── Navigate to PatientEditPage
│
├── PatientEditPage
│   ├── usePatients() [mutations: add/update/delete]
│   ├── PatientDetails (form component)
│   │   └── handleInputChange() updates formData
│   └── AuditLog (read-only history)
│       └── getPatient() fetches with history
│
└── PatientEditPage/:id
    ├── getPatient() fetches by ID
    ├── PatientDetails (pre-filled form)
    └── AuditLog shows all changes

Data Flow:
- PatientContext stores global patient list & manages API
- Components read from context via usePatients()
- Form changes update local component state first
- On save, calls async context methods
- Context updates state → triggers re-renders
- Components that read patients automatically update
```

---

## Error Handling Architecture

```
Frontend Error Handling:
┌─────────────────────────────────────┐
│ User Action (form submission)       │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Form Validation                     │
│ - Check required fields             │
├─────────────────────────────────────┤
│ if invalid → Show validation error  │
│ if valid → Continue                 │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ API Call (patientAPI.createPatient) │
└──────────────┬──────────────────────┘
               ↓
        ┌──────┴──────┐
        ↓             ↓
     Success        Failure
        ↓             ↓
      State        catch(error)
      Update         ↓
        ↓        Show alert
      Navigate      with error
        ↓
    Refresh UI


Backend Error Handling:
┌──────────────────────┐
│ HTTP Request         │
└──────────┬───────────┘
           ↓
┌──────────────────────────────────────┐
│ Route Handler                        │
│ try {                                │
│   // Business logic                  │
│   supabase.from().insert()           │
│ } catch (error) {                    │
│   console.error()                    │
│   res.status(500).json(error)        │
│ }                                    │
└──────────────────────────────────────┘
           ↓
        ┌──┴──┐
        ↓     ↓
    Status   Fallback to
    Code     localStorage
     200      (frontend)
     201
    4xx/5xx
```

---

## Authentication & Authorization (Future Enhancement)

Current State: No authentication (development mode)
```
supabase.from("patients").select() 
  → All users can read all patients
  → No row-level security active
```

For Production, add:
```
1. Supabase Auth enabled
2. JWT token obtained on login
3. All requests include Authorization header
4. RLS policies check user_id matching patient.assigned_doctor_id
5. Audit logs track who made changes (user_id)

Future tables:
- users (doctors)
- patient_assignments (linking doctors to patients)
```

---

## Performance Considerations

### Current Implementation
- All patients loaded into memory on mount
- Risk calculation on every vital change
- No pagination
- No search indexing

### Scalability Limits
- Suitable for: ~500 patients
- Performance degrades: 1000+ patients
- Breaks: 5000+ patients in browser memory

### Optimization Strategies (for future)

**1. Pagination**
```typescript
// Load 50 patients per page
const [page, setPage] = useState(1);
const patients = await patientAPI.getPatients(page, 50);
// Backend: GET /api/patients?page=1&limit=50
```

**2. Search with Backend Filtering**
```typescript
// Search on backend, not client
const results = await patientAPI.searchPatients(query);
// Backend: GET /api/patients/search?q=John
```

**3. Infinite Scroll**
```typescript
// Load next page when user scrolls near bottom
const handleScroll = () => {
  if (scrollPosition > contentHeight - 500) {
    loadNextPage();
  }
};
```

**4. Debounce Risk Calculation**
```typescript
// Don't recalculate every keystroke
const debouncedRiskCalc = debounce(() => {
  setRiskResult(calculateRisk(formData));
}, 500); // Wait 500ms after typing stops
```

**5. Database Indexes**
```sql
-- Already created:
CREATE INDEX idx_patients_risk_level ON patients("riskLevel");
CREATE INDEX idx_patients_updated_at ON patients("lastUpdated");
-- Could add:
CREATE INDEX idx_patients_full_name ON patients("fullName");
CREATE INDEX idx_patients_admission_date ON patients("admissionDate");
```

---

## API Design Principles

### RESTful Design
- Resource-oriented (patients, audit logs)
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Consistent response format (JSON)
- Appropriate status codes (200, 201, 400, 404, 500)

### Request/Response Format
```typescript
// Request
{
  method: "POST",
  url: "http://localhost:5000/api/patients",
  body: Patient,
  headers: { "Content-Type": "application/json" }
}

// Response
{
  status: 201,
  body: Patient (with generated ID, calculated risk)
}

// Error
{
  status: 400,
  body: { error: "Validation failed: fullName required" }
}
```

### Error Response Format
```json
{
  "error": "Message describing what went wrong",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "value"
  }
}
```

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** |
| Language | TypeScript | 5.x | Type safety |
| Framework | React | 19.2.0 | UI components |
| Build Tool | Vite | 7.3.1 | Fast development |
| Route | React Router | v6.20.0 | Page navigation |
| HTTP | Axios | ^1.6.0 | API calls |
| Charts | Recharts | - | Visualizations |
| **Backend** |
| Runtime | Node.js | 18+ | JavaScript runtime |
| Framework | Express | 5.2.1 | REST API server |
| File Upload | Multer | - | PDF parsing |
| PDF Parse | pdf-parse | - | Text extraction |
| Env | dotenv | 16.3.1 | Config management |
| **Database** |
| Service | Supabase | - | Cloud PostgreSQL |
| Client | @supabase/js | 2.38.4 | Database SDK |
| **Development** |
| Linter | ESLint | - | Code quality |
| Package | npm | - | Dependency manager |

---

## Security Considerations

### Current (Development)
- No authentication
- RLS disabled
- Public database access
- Secrets in `.env` (NOT committed)

### For Production
```
✅ Enable authentication (Supabase Auth)
✅ Implement Row Level Security (RLS)
✅ Use service role key only on backend
✅ Implement rate limiting
✅ Validate all inputs on backend
✅ Sanitize user inputs (prevent SQL injection)
✅ Use HTTPS only
✅ Implement audit logging for sensitive operations
✅ Regular security audits
✅ Data encryption at rest and in transit
```

---

## Development Workflow

### Local Development
```bash
# Terminal 1: Backend
cd backend
npm run dev
# Watches for changes, auto-restarts

# Terminal 2: Frontend
cd patient
npm run dev
# Hot reload on save

# Browser
http://localhost:5173
# Auto-opens after `npm run dev`
```

### Database Changes
```sql
-- 1. Create migration in Supabase SQL Editor
-- 2. Test in development database
-- 3. Document in SUPABASE_SETUP.md
-- 4. Update backend controller if needed
-- 5. Update frontend types.ts
-- 6. Test with frontend form
```

### Adding New Features
```
1. Plan data model (database schema changes)
2. Create/update Supabase table
3. Update TypeScript types
4. Update backend controller (CRUD logic)
5. Update API routes if needed
6. Update frontend API service
7. Create/update component
8. Wire into PatientContext if state needed
9. Test end-to-end
10. Document in README
```

---

## Deployment Architecture

### Development
```
Frontend: http://localhost:5173 (Vite dev server)
Backend:  http://localhost:5000 (Express server)
Database: Supabase cloud (production)
```

### Production
```
Frontend: https://patient-risk.vercel.app (Vercel CDN)
Backend:  https://api.patient-risk.app (Railway/Heroku)
Database: Supabase cloud with RLS
```

### Environment Variables by Deployment
```
Development:
  VITE_API_URL=http://localhost:5000/api
  SUPABASE_URL=dev-project.supabase.co

Production:
  VITE_API_URL=https://api.patient-risk.app/api
  SUPABASE_URL=prod-project.supabase.co
  (Service role key only in backend env)
```

---

## Monitoring & Logging

### Frontend Logs
Location: Browser DevTools Console (F12)
Format: `[FunctionName] Description: value`
Example: `[addPatient] Sending to API: {...}`

### Backend Logs
Location: Terminal where `npm run dev` is running
Format: Request → Controller → Database → Response
Example: Multiple [functionName] logs showing progression

### Database Monitoring
Location: Supabase Dashboard → Database → Tables & Indexes
Actions: View table sizes, query performance, RLS policies

### Error Monitoring (Future)
- Sentry for frontend error tracking
- CloudWatch for backend logs
- Datadog for performance monitoring

---

**Last Updated**: 2024  
**Version**: 1.0 - Complete Supabase Integration  
**Audience**: Backend developers, DevOps engineers, system architects
