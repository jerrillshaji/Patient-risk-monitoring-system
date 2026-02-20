# Component Documentation

## File Structure & Component Guide

### 🎯 Core Application Files

#### `src/App.tsx`
- **Purpose**: Main app wrapper, provides layout and routing
- **Features**: 
  - Wraps entire app with PatientProvider context
  - Header with navigation
  - Main content area
  - Footer
- **Related Styles**: `src/App.css`

#### `src/main.tsx`
- **Purpose**: Entry point for React application
- **Features**: React root rendering, provider setup

#### `src/index.css`
- **Purpose**: Global styles and CSS variables
- **Features**:
  - Default HTML element styles
  - Color variables
  - Typography defaults
  - Utility classes

---

## 📄 Page Components

### `src/pages/HomePage.tsx`
**Purpose**: Dashboard/Analytics Page  
**Props**: None  
**State**: Uses `usePatients()` context hook

**Features**:
- Displays key metrics (total patients, risk counts)
- Risk distribution pie chart
- Risk level breakdown bar chart
- Table of recently updated patients
- Color-coded risk badges

**External Dependencies**:
- Recharts (PieChart, BarChart)
- React Router (navigation links)

**User Interactions**:
- Click patient name to view details
- Links to Patient List or Details

---

### `src/pages/PatientPage.tsx`
**Purpose**: Patient List & Management  
**Props**: None  
**State**: Uses `usePatients()` context hook

**Features**:
- Sortable table of all patients
- Risk indicators with color badges
- Add Patient button
- View/Edit actions
- Displays last updated time

**Table Columns**:
- Patient Name
- Age
- Gender
- Admission Date
- Risk Level
- Risk Score
- Last Updated
- Actions

**Related Styles**: `src/components/PatientList/PatientList.css`

---

### `src/pages/PatientEditPage.tsx`
**Purpose**: Create/Edit Patient Records  
**Props**: 
- Route Params: `id` (optional, for edit mode)

**State**:
- `formData`: Patient information
- `riskResult`: Calculated risk
- `errors`: Form validation errors
- `activeTab`: "details" or "audit"

**Features**:
- Form with validation
- Real-time risk calculation
- Instant visual feedback
- Audit history tab (for existing patients)
- Create or update patient
- Delete patient (edit mode only)

**Tabs**:
1. **Patient Details**: Form for editing
2. **Audit History**: Read-only change log

**Related Styles**: `src/components/PatientDetails/PatientDetails.css`

---

## 🧩 Component Files

### `src/components/PatientDetails/PatientDetails.tsx`
**Purpose**: Patient form data entry  
**Props**:
```typescript
interface PatientDetailsProps {
  patient: Partial<Patient>;
  onInputChange: (field: string, value: any) => void;
  onNestedChange: (parent: string, child: string, value: any) => void;
  errors: Record<string, string>;
}
```

**Form Sections**:
1. **Demographics**
   - Full Name (required)
   - Date of Birth (auto-calculates age)
   - Gender dropdown
   - Contact (required)
   - Admission Date

2. **Clinical Vitals**
   - Heart Rate (bpm) - with instant value display
   - Systolic BP (mmHg)
   - Diastolic BP (mmHg)
   - Oxygen Saturation (%)
   - Temperature (°C)
   - Respiratory Rate (/min)

3. **Medical History**
   - Checkboxes for conditions (Diabetes, COPD, Cardiac)
   - ER Visits counter

4. **Lab Indicators**
   - Checkboxes for elevated labs (WBC, Creatinine, CRP)

5. **Clinical Notes**
   - Free text textarea

**Features**:
- Real-time validation
- Auto-population of calculated fields (age)
- Range hints showing current values
- Error message display
- Disabled fields for auto-calculated data

**Related Styles**: `src/components/PatientDetails/PatientDetails.css`

---

### `src/components/AuditLog/AuditLog.tsx`
**Purpose**: Display change history  
**Props**:
```typescript
interface AuditLogProps {
  history: AuditLog[];
}
```

**Features**:
- Timeline visualization of changes
- Color-coded risk markers
- Before/After value comparison
- Timestamp for each change
- Risk impact details
- Chronological display (newest first)
- Sorted entries with summary

**Timeline Markers**:
- 🔴 RED = High Risk
- 🟠 ORANGE = Medium Risk
- 🟢 GREEN = Low Risk

**Related Styles**: `src/components/AuditLog/AuditLog.css`

---

### `src/components/Dashboard/Dashboard.tsx`
**Purpose**: Placeholder dashboard (main logic in HomePage)  
**Note**: Actual dashboard functionality is in `HomePage.tsx`

---

## 🎯 Context & State Management

### `src/context/PatientContext.tsx`
**Purpose**: Global patient state management  

**Context Type**:
```typescript
interface PatientContextType {
  patients: Patient[];
  addPatient: (p: Omit<...>) => void;
  updatePatient: (id: string, updated: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  getPatient: (id: string) => Patient | undefined;
  getDashboardMetrics: () => {...};
}
```

**Functionality**:
- Manages patient list globally
- Automatic risk recalculation on changes
- Audit log generation
- Dashboard metrics calculation
- Patient CRUD operations

**Hooks**:
```typescript
const { patients, addPatient, updatePatient } = usePatients();
```

---

## 🔧 Services

### `src/services/riskEngine.ts`
**Purpose**: Risk calculation logic (deterministic, rule-based)

**Main Functions**:

#### `calculateRisk(patient: Patient): RiskCalculationResult`
- Calculates total risk score
- Determines risk level
- Returns scoring breakdown
- Checks for critical escalation

**Returns**:
```typescript
{
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH";
  breakdown: { demographics, vitals, history, labs };
  criticalEscalation: boolean;
}
```

#### `getRiskScoreDetails(patient: Patient): string`
- Returns human-readable risk breakdown
- Shows which factors contributed

**Internal Functions** (private):
- `calculateDemographicsScore(age)`
- `calculateVitalsScore(hr, bp, spo2, temp, rr)`
- `calculateHistoryScore(conditions, erVisits)`
- `calculateLabsScore(labs)`
- `checkCriticalEscalation(spo2, bp, hr)`
- `scoreToRiskLevel(score)`

---

### `src/services/api.ts`
**Purpose**: Frontend-to-backend communication layer

**Methods**:

```typescript
patientAPI = {
  getPatients(): Promise<Patient[]>
  getPatient(id: string): Promise<Patient>
  createPatient(patient): Promise<Patient>
  updatePatient(id: string, updates): Promise<Patient>
  deletePatient(id: string): Promise<void>
  parsePDF(file: File): Promise<Partial<Patient>>
}
```

**Current Implementation**: LocalStorage (demo)  
**Ready For**: Backend API integration with axios

**Sample Data**:
- Sarah Jenkins (72y, HIGH RISK)
- John Smith (84y, MEDIUM RISK)

---

## 📝 Type Definitions

### `src/types/types.ts`

**Main Types**:

#### `Patient`
Complete patient record structure:
```typescript
{
  id: string;
  // Demographics
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: Gender;
  contact: string;
  admissionDate: string;
  // Vitals
  heartRate: number;
  systolicBP: number;
  diastolicBP: number;
  spo2: number;
  temperature: number;
  respRate: number;
  // Medical History
  chronicConditions: { diabetes, copd, cardiacDisease };
  erVisits: number;
  // Lab Indicators
  labs: { wbc, creatinine, crp };
  notes: string;
  // Risk Assessment
  riskScore: number;
  riskLevel: RiskLevel;
  lastUpdated: string;
  history: AuditLog[];
}
```

#### `AuditLog`
Change tracking record:
```typescript
{
  id: string;
  timestamp: string;
  field: string;
  oldValue: any;
  newValue: any;
  riskScoreBefore: number;
  riskLevelBefore: RiskLevel;
  riskScoreAfter: number;
  riskLevelAfter: RiskLevel;
}
```

#### `RiskCalculationResult`
Risk calculation output:
```typescript
{
  score: number;
  level: RiskLevel;
  breakdown: { demographics, vitals, history, labs };
  criticalEscalation: boolean;
}
```

---

## 🛣️ Routing

### `src/routes/AppRoutes.tsx`
**Purpose**: Application routing configuration

**Routes**:
```
/                     → HomePage (Dashboard)
/patients             → PatientPage (List)
/patients/new         → PatientEditPage (Create)
/patients/:id         → PatientEditPage (Edit)
*                     → Redirect to /
```

**Navigation**:
- Header navigation links
- Link components throughout app
- useNavigate hook for programmatic navigation

---

## 🎨 Styling Architecture

### Global Styles
- **`index.css`**: Default styles, typography, variables
- **`App.css`**: Main layout, header, footer

### Component Styles
- **`PatientList/PatientList.css`**: Table styling, buttons
- **`PatientDetails/PatientDetails.css`**: Form styling, fields
- **`Dashboard/Dashboard.css`**: Metrics, charts, tables
- **`AuditLog/AuditLog.css`**: Timeline styling

### Design System
- **Color Scheme**:
  - Primary: #3498db (Blue)
  - Danger: #e74c3c (Red)
  - Success: #27ae60 (Green)
  - Warning: #f39c12 (Orange)
  
- **Risk Colors**:
  - HIGH: #f44336 (Red)
  - MEDIUM: #ff9800 (Orange)
  - LOW: #4caf50 (Green)

- **Typography**:
  - Headings: System fonts (sans-serif)
  - Body: -apple-system, BlinkMacSystemFont, Segoe UI

---

## 🔄 Data Flow

### Creating a Patient
```
Form Input
    ↓
PatientDetailsForm (onInputChange)
    ↓
PatientEditPage (state update + risk calc)
    ↓
RiskEngine (calculateRisk)
    ↓
Display updated risk badge
    ↓
Save button → Context.addPatient()
    ↓
API.createPatient()
    ↓
Redirect to Patient List
```

### Updating a Patient
```
Form Input
    ↓
Real-time risk recalculation
    ↓
Visual feedback (Risk Alert updates)
    ↓
Save button → Context.updatePatient()
    ↓
Generate AuditLog entry
    ↓
API.updatePatient()
    ↓
Update UI
```

### Viewing Audit History
```
Patient Details → Click "Audit History" tab
    ↓
Load existingPatient.history array
    ↓
AuditLog component renders timeline
    ↓
Display with before/after values
```

---

## 🧪 Testing Scenarios

### Test Case 1: Low Risk Patient
Create patient with:
- Age 45, HR 80, BP 120, SpO2 98%, Temp 37°C
- No chronic conditions
- **Expected**: GREEN "LOW" badge, Score 0-2

### Test Case 2: Medium Risk Patient
Create patient with:
- Age 65, HR 105, BP 115, SpO2 92%, Temp 37.5°C
- Diabetes: Yes
- ER Visits: 2
- **Expected**: ORANGE "MEDIUM" badge, Score 3-5

### Test Case 3: Critical Escalation
Create patient, then edit:
- Change SpO2 from 95% to 84%
- **Expected**: RED "CRITICAL" alert, Score jumps to HIGH
- **Audit Log**: Shows SpO2 change and risk escalation

### Test Case 4: Form Validation
Try to create patient:
- Leave "Full Name" empty
- **Expected**: Red error message "Full name is required"
- **Submit Button**: Remains disabled

---

## 🚀 Performance Tips

1. **Avoid Unnecessary Re-renders**
   - Use React.memo for components
   - Optimize dependencies in useEffect

2. **Risk Calculation**
   - Already optimized (simple arithmetic)
   - Runs instantly as user types

3. **Large Patient Lists**
   - Implement pagination in API
   - Use virtual scrolling for 1000+ rows

4. **Database Queries**
   - Add indexes on frequently queried fields
   - Cache dashboard metrics

---

## 📚 Component Interaction Map

```
App (main)
├── Header (navigation)
├── Main (routes)
│   ├── HomePage
│   │   └── uses: PatientContext, Recharts
│   ├── PatientPage
│   │   └── Table with PatientList.css
│   └── PatientEditPage
│       ├── PatientDetails (form component)
│       ├── AuditLog (display component)
│       └── Risk calculation feedback
└── Footer
```

---

## 📖 Usage Examples

### Using Patient Context
```typescript
import { usePatients } from '../context/PatientContext';

const MyComponent = () => {
  const { patients, addPatient, updatePatient } = usePatients();
  
  // Use data and methods
};
```

### Risk Calculation
```typescript
import { calculateRisk } from '../services/riskEngine';

const patient = { /* ... */ };
const risk = calculateRisk(patient);
console.log(risk.level); // "LOW", "MEDIUM", or "HIGH"
console.log(risk.score); // 0-15+
```

### API Integration
```typescript
import { patientAPI } from '../services/api';

const patients = await patientAPI.getPatients();
const newPatient = await patientAPI.createPatient(data);
```

---

**Last Updated**: February 18, 2026  
**Status**: ✅ Complete Documentation
