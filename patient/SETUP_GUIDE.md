# Patient Risk Monitoring System - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites Check
- ✅ Node.js installed (v18+)
- ✅ npm installed
- ✅ Terminal/Command Prompt access
- ✅ Code editor (VS Code recommended)

### Step 1: Install Dependencies (2 minutes)

```bash
# Navigate to project directory
cd "c:\Users\MI\Documents\Patient risk monitoring system\patient"

# Install all packages
npm install

# Wait for installation to complete...
```

**Expected Output**: "added XXX packages" with no errors

### Step 2: Start Development Server (1 minute)

```bash
npm run dev
```

**Expected Output**:
```
  VITE v7.3.1  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 3: Open in Browser (1 minute)

- Click the link or open: `http://localhost:5173`
- You should see the Patient Risk Monitoring System dashboard

### Step 4: Test the Application (1 minute)

1. Click **"Patients"** in the header navigation
2. Click **"+ Add New Patient"** button
3. Fill in sample data:
   - Name: "Test Patient"
   - DOB: "1960-01-15"
   - Gender: "Male"
   - Contact: "555-0000"
4. Scroll down to clinical vitals:
   - Heart Rate: 95
   - Systolic BP: 120
   - SpO2: 95%
   - Temperature: 37°C
   - Respiratory Rate: 18
5. Check medical history:
   - Check: Diabetes
6. Click **"Create Patient"**
7. You should see it in the list with GREEN "LOW" risk badge
8. Click **"View/Edit"** to see the risk calculation breakdown

---

## 📊 Trying Different Risk Scenarios

### Low Risk Patient
- Age: 45
- HR: 80, BP: 120, SpO2: 98%, Temp: 37
- No chronic conditions
- No ER visits
- **Expected Result**: LOW (Green) - Score 0-2

### Medium Risk Patient
- Age: 65
- HR: 105, BP: 115, SpO2: 92%, Temp: 37.5
- Diabetes: Yes
- ER Visits: 2
- **Expected Result**: MEDIUM (Orange) - Score 3-5

### High Risk Patient
- Age: 78
- HR: 125, BP: 85, SpO2: 88%, Temp: 38.5
- COPD: Yes, Cardiac Disease: Yes
- ER Visits: 4
- Elevated Labs: WBC + Creatinine + CRP
- **Expected Result**: HIGH (Red) - Score 6+

### Critical Escalation
- Any patient with:
  - SpO2 < 85%, OR
  - Systolic BP < 80, OR
  - Heart Rate > 140
- **Expected Result**: CRITICAL HIGH (Red with warning)

---

## 📝 Application Walkthrough

### Dashboard (Home Page)
```
URL: http://localhost:5173/
```
Shows:
- **Metric Cards**: Total Patients, High/Medium/Low Risk counts
- **Risk Distribution**: Pie chart showing risk breakdown
- **Risk Levels**: Bar chart showing counts
- **Recent Updates**: Table of last 10 modified patients

### Patient List
```
URL: http://localhost:5173/patients
```
Shows:
- Table of all patients
- Risk badges (Green/Orange/Red)
- Risk scores
- Last updated timestamps
- **View/Edit** button for each patient

### Patient Details
```
URL: http://localhost:5173/patients/new  (create new)
URL: http://localhost:5173/patients/{id} (edit existing)
```
Features:
- **Demographics**: Name, DOB, Gender, Contact, Admission Date
- **Vitals**: HR, BP, SpO2, Temperature, Respiratory Rate
- **Medical History**: Chronic conditions, ER visits
- **Lab Indicators**: WBC, Creatinine, CRP
- **Risk Alert Box**: Shows real-time risk calculation
- **Audit History Tab**: View all changes made to patient

---

## 🔍 Feature Testing Checklist

### ✅ Real-Time Risk Calculation
1. Edit any patient
2. Change "Heart Rate" from 90 to 125
3. Watch risk alert box update immediately
4. Risk level should update without page reload

### ✅ Audit History
1. Open any existing patient
2. Make a small change (e.g., temperature)
3. Click "Update Patient"
4. Click "Audit History" tab
5. You should see the change logged with:
   - Timestamp
   - Old value
   - New value
   - Risk impact

### ✅ Critical Escalation
1. Create new patient with normal vitals
2. Edit patient
3. Change SpO2 to 84%
4. Notice RED alert: "CRITICAL ESCALATION"
5. Score jumps to HIGH regardless of other parameters

### ✅ Validation
1. Try creating patient without "Full Name"
2. Should see error message
3. Try entering invalid age (>150)
4. Should show validation error

---

## 🎨 UI Components Overview

### Color Coding
- 🟢 **GREEN**: LOW RISK (Score 0-2)
- 🟠 **ORANGE**: MEDIUM RISK (Score 3-5)
- 🔴 **RED**: HIGH RISK (Score 6+) or CRITICAL

### Buttons
- **Primary (Blue)**: Main actions (Save, Create Patient)
- **Secondary (Gray)**: Cancel, Back
- **Danger (Red)**: Delete Patient

### Form Sections
1. **Demographics** - No validation impact on risk
2. **Clinical Vitals** - Major risk factor (40%+ of score)
3. **Medical History** - Chronic conditions + ER visits
4. **Lab Indicators** - Minor risk factor (0-3 points)
5. **Clinical Notes** - Free text field for observations

---

## 💾 Data Persistence

### Current Storage
- Data saved in **Browser LocalStorage**
- Persists across browser sessions
- Clears if browser cache is cleared

### To Clear All Data
```javascript
// Open browser DevTools (F12)
// Go to Application → Storage → Local Storage
// Delete all entries
// Refresh page
```

Or use the console:
```javascript
localStorage.clear();
```

### Sample Data
- 2 sample patients are added on first launch
- Can delete them or use as reference

---

## 🛠️ Development Workflow

### Making Changes

1. **Edit Component** (e.g., Dashboard.tsx)
   ```bash
   # File saves automatically
   # Page hot-reloads in browser
   ```

2. **Styling** (Update CSS files)
   ```bash
   # Changes appear immediately
   # No rebuild needed
   ```

3. **Type Definitions** (types.ts)
   ```bash
   # Update interface
   # TypeScript validates automatically
   ```

### Checking Errors

1. **In Terminal**
   - Check for TypeScript errors
   - Check for lint warnings

2. **In Browser Console** (F12)
   - Check for runtime errors
   - Check for warnings

3. **Compile Check**
   ```bash
   npx tsc --noEmit
   ```

---

## 📱 Responsive Design

The application works on:
- Desktop (1920px+)
- Laptop (1024-1920px)
- Tablet (768-1024px)
- Mobile (320-768px)

**Test responsive**: Press F12 → Click device toggle → Select device

---

## 🐛 Troubleshooting

### Problem: "Port 5173 already in use"
```bash
# Use different port
npm run dev -- --port 3000
```

### Problem: "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Problem: "Data not saving"
```bash
# Check browser LocalStorage
# DevTools → Application → Storage
# Check if storage is enabled
# Try clearing all and refreshing
```

### Problem: "TypeScript errors in IDE"
```bash
# VS Code might be using wrong TypeScript version
# Restart VS Code
# Or: Ctrl+Shift+P → Select TypeScript Version
```

---

## 📚 File Locations Reference

| Feature | File |
|---------|------|
| Risk Calculation | `src/services/riskEngine.ts` |
| Patient State | `src/context/PatientContext.tsx` |
| Patient Types | `src/types/types.ts` |
| API Layer | `src/services/api.ts` |
| Dashboard | `src/pages/HomePage.tsx` |
| Patient List | `src/pages/PatientPage.tsx` |
| Edit Patient | `src/pages/PatientEditPage.tsx` |
| Audit Log | `src/components/AuditLog/AuditLog.tsx` |
| Form Component | `src/components/PatientDetails/PatientDetails.tsx` |

---

## 🔐 Security Notes

⚠️ **This is a demonstration application**:
- No authentication implemented
- All data stored locally in browser
- Not suitable for production without:
  - User authentication
  - Secure backend
  - Database integration
  - HIPAA compliance
  - Data encryption

---

## 📊 Production Build

### Create Optimized Build
```bash
npm run build
```

Output: `dist/` folder with optimized files

### Preview Production Build
```bash
npm run preview
```

### Deploy to Server
1. Copy `dist/` folder contents to your web server
2. Configure server for SPA (single page app)
3. Set up backend API endpoints
4. Configure database

---

## 💡 Tips & Tricks

1. **Quick Patient Creation**
   - Use Tab key to move between form fields
   - Spacebar toggles checkboxes

2. **Patient Search**
   - Patient list is sortable (click column headers)
   - Sorted by latest updates by default

3. **Keyboard Shortcuts**
   - F12: Open DevTools
   - Ctrl+Shift+Delete: Clear all data (use carefully!)

4. **Export Data**
   - Risk calculation details shown in audit log
   - Can be copied for reports

---

## 📞 Next Steps

### For Development
1. Review `README.md` for detailed documentation
2. Check `src/types/types.ts` for data structure
3. Read `src/services/riskEngine.ts` for scoring logic
4. Study component structure in `src/components/`

### For Backend Integration
1. Create REST API endpoints matching `src/services/api.ts`
2. Set up PostgreSQL/MongoDB database
3. Implement user authentication
4. Add audit logging middleware

### For Production Deployment
1. Set up CI/CD pipeline
2. Configure environment variables
3. Set up SSL/TLS certificates
4. Implement data backups
5. Configure logging and monitoring

---

## ✅ Verification Checklist

- [ ] npm install completed
- [ ] npm run dev started successfully
- [ ] Browser opens to http://localhost:5173
- [ ] Dashboard displays with metrics
- [ ] Can create new patient
- [ ] Risk calculation works
- [ ] Audit log displays changes
- [ ] Patient list shows all patients
- [ ] Editing updates risk in real-time

---

**Status**: ✅ Ready to Use  
**Last Updated**: February 18, 2026

If you encounter issues, check the terminal output for errors and the browser console (F12) for detailed logs.
