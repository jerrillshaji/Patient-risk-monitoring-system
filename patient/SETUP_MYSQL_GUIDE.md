# MySQL Database Setup Guide

This guide will help you set up the MySQL database for the Patient Risk Monitoring System.

## Prerequisites

- MySQL Server installed and running
- Node.js 18+ installed
- npm installed

## Step 1: Create MySQL Database

### Option A: Using MySQL Command Line

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE patientdb;

# Use the database
USE patientdb;

# Run the schema
source backend/database/schema.sql;

# Verify tables
SHOW TABLES;
```

### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Click "File" → "Open SQL Script"
4. Navigate to `backend/database/schema.sql`
5. Click "Execute" (lightning bolt icon)

### Option C: Using Command Line (One-liner)

```bash
mysql -u root -p < backend/database/schema.sql
```

## Step 2: Configure Backend Environment

The backend `.env` file is already configured with default values:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=patientdb
MYSQL_PORT=3306
PORT=5000
NODE_ENV=development
```

**Important:** Update `MYSQL_PASSWORD` to match your MySQL root password!

## Step 3: Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd patient
npm install --legacy-peer-deps
```

## Step 4: Start the Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ MySQL connected successfully
📊 Database: patientdb
🔗 Host: localhost
🚀 Backend running on port 5000
📡 API available at http://localhost:5000/api
```

## Step 5: Start the Frontend

Open a new terminal:

```bash
cd patient
npm run dev
```

You should see:
```
VITE v7.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Step 6: Test the Connection

Open your browser and navigate to:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/health

## Troubleshooting

### MySQL Connection Failed

**Error:** `ER_ACCESS_DENIED_ERROR`
- **Solution:** Check your MySQL username and password in `.env`

**Error:** `Unknown database 'patientdb'`
- **Solution:** Create the database: `CREATE DATABASE patientdb;`

**Error:** `Table doesn't exist`
- **Solution:** Run the schema script: `source backend/database/schema.sql`

### Backend Won't Start

**Error:** `Cannot find module 'mysql2'`
- **Solution:** Run `npm install` in the backend directory

**Error:** `Port 5000 already in use`
- **Solution:** Change the PORT in backend `.env` or kill the process using port 5000

### Frontend Can't Connect to Backend

**Error:** `Network Error` or CORS error
- **Solution:** 
  1. Make sure backend is running on port 5000
  2. Check VITE_API_URL in frontend `.env` is `http://localhost:5000/api`
  3. Check CORS_ORIGIN in backend `.env` is `http://localhost:5173`

## Database Schema

### patients Table

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key, auto-increment |
| fullname | VARCHAR(255) | Patient's full name |
| dateofbirth | VARCHAR(20) | Date of birth |
| age | INT | Age in years |
| gender | VARCHAR(50) | Gender |
| contact | VARCHAR(255) | Contact information |
| admissiondate | VARCHAR(50) | Admission date |
| heartrate | INT | Heart rate (bpm) |
| systolicbp | INT | Systolic blood pressure |
| diastolicbp | INT | Diastolic blood pressure |
| spo2 | INT | Oxygen saturation (%) |
| temperature | DECIMAL(6,2) | Body temperature (°C) |
| resprate | INT | Respiratory rate (breaths/min) |
| diabetics | BOOLEAN | Diabetes flag |
| copd | BOOLEAN | COPD flag |
| cardiacdisease | BOOLEAN | Cardiac disease flag |
| ervists | INT | Number of ER visits |
| wbcelevated | BOOLEAN | Elevated WBC flag |
| creatininehigh | BOOLEAN | High creatinine flag |
| crphigh | BOOLEAN | High CRP flag |
| notes | TEXT | Additional notes |
| riskscore | INT | Calculated risk score |
| risklevel | VARCHAR(20) | Risk level (LOW/MEDIUM/HIGH) |
| createdat | TIMESTAMP | Creation timestamp |
| lastupdated | TIMESTAMP | Last update timestamp |

### auditLogs Table

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key, auto-increment |
| patientId | BIGINT | Foreign key to patients |
| field | VARCHAR(255) | Changed field name |
| oldValue | TEXT | Previous value |
| newValue | TEXT | New value |
| timestamp | TIMESTAMP | Change timestamp |

## API Endpoints

Once the backend is running, you can test these endpoints:

```bash
# Health check
GET http://localhost:5000/api/health

# Get all patients
GET http://localhost:5000/api/patients

# Get single patient
GET http://localhost:5000/api/patients/:id

# Create patient
POST http://localhost:5000/api/patients
Content-Type: application/json
{
  "fullName": "John Doe",
  "dateOfBirth": "1950-01-15",
  "age": 74,
  "gender": "Male",
  "contact": "555-1234",
  "admissionDate": "2024-01-20",
  "heartRate": 85,
  "systolicBP": 130,
  "diastolicBP": 85,
  "spo2": 96,
  "temperature": 37.0,
  "respRate": 16,
  "chronicConditions": {
    "diabetes": false,
    "copd": false,
    "cardiacDisease": false
  },
  "erVisits": 0,
  "labs": {
    "wbc": false,
    "creatinine": false,
    "crp": false
  },
  "notes": "Stable condition"
}

# Update patient
PUT http://localhost:5000/api/patients/:id

# Delete patient
DELETE http://localhost:5000/api/patients/:id

# Get audit logs
GET http://localhost:5000/api/patients/audit/:id
```

## Next Steps

1. ✅ Database setup complete
2. ✅ Backend running
3. ✅ Frontend running
4. Test creating a patient in the UI
5. Verify data is saved in MySQL
6. Check audit logs are created on updates

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review backend logs for error messages
3. Verify MySQL is running: `mysqladmin -u root -p status`
4. Check database connection: `mysql -u root -p -e "USE patientdb; SHOW TABLES;"`
