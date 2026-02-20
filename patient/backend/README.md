# Backend - Patient Risk Monitoring System

Express.js backend API with MySQL database storage.

## Features

- RESTful API for patient management
- MySQL database integration
- Risk score calculation
- Audit logging for all changes
- PDF data extraction (experimental)
- CORS enabled for frontend integration

## Project Structure

```
backend/
├── config/
│   └── mysql.js          # MySQL connection pool
├── controllers/
│   └── patientController.js  # Request handlers
├── models/
│   ├── patient.js        # Patient model
│   └── auditLog.js       # Audit log model
├── routes/
│   └── patientRoutes.js  # API routes
├── services/
│   ├── pdfService.js     # PDF extraction
│   └── riskEngine.js     # Risk calculation
├── database/
│   └── schema.sql        # Database schema
├── uploads/              # PDF uploads directory
├── .env                  # Environment variables
├── .env.example          # Example environment file
├── package.json
└── server.js             # Entry point
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=patientdb
MYSQL_PORT=3306
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Setup MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE patientdb;

# Use database
USE patientdb;

# Run schema
source database/schema.sql;
```

### 4. Start Server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server will start on `http://localhost:5000`

## API Endpoints

### Patients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | Get all patients |
| GET | `/api/patients/:id` | Get patient by ID |
| POST | `/api/patients` | Create new patient |
| PUT | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |
| GET | `/api/patients/audit/:id` | Get audit logs for patient |
| POST | `/api/patients/upload` | Upload PDF for data extraction |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check API health |

## Request/Response Examples

### Create Patient

**Request:**
```json
POST /api/patients
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
```

**Response:**
```json
{
  "id": 1,
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
  "notes": "Stable condition",
  "riskScore": 2,
  "riskLevel": "LOW",
  "lastUpdated": "2024-01-20T10:30:00.000Z"
}
```

### Update Patient

```json
PUT /api/patients/1
Content-Type: application/json

{
  "heartRate": 95,
  "spo2": 92
}
```

### Get Audit Logs

```json
GET /api/patients/audit/1

Response:
[
  {
    "id": 1,
    "patientId": 1,
    "field": "heartRate",
    "oldValue": "85",
    "newValue": "95",
    "timestamp": "2024-01-20T11:00:00.000Z"
  },
  {
    "id": 2,
    "patientId": 1,
    "field": "spo2",
    "oldValue": "96",
    "newValue": "92",
    "timestamp": "2024-01-20T11:00:00.000Z"
  }
]
```

## Risk Calculation

The risk engine calculates a score based on:

- **Age**: 60-75 (+1), >75 (+2)
- **Heart Rate**: 100-120 (+1), >120 (+2)
- **Blood Pressure**: Systolic <90 (+2)
- **SpO2**: <90 (+2), ≤93 (+1)
- **Temperature**: 38-39 (+1), >39 (+2)
- **Respiratory Rate**: >24 (+1)
- **Chronic Conditions**: Each condition (+1)
- **ER Visits**: 2-3 (+1), >3 (+2)
- **Lab Results**: Each abnormal (+1)

**Risk Levels:**
- LOW: Score 0-2
- MEDIUM: Score 3-5
- HIGH: Score 6+

## Database Schema

See `database/schema.sql` for complete schema.

### Key Tables

**patients**
- Stores all patient demographic and clinical data
- Auto-calculated risk scores
- Timestamps for creation and updates

**auditLogs**
- Tracks all changes to patient records
- Links to patients via foreign key
- Stores old and new values

## Troubleshooting

### MySQL Connection Error

```
Error: ER_ACCESS_DENIED_ERROR
```

**Solution:** Check MySQL credentials in `.env`

### Table Doesn't Exist

```
Error: Table 'patientdb.patients' doesn't exist
```

**Solution:** Run the schema: `source database/schema.sql`

### Port Already in Use

```
Error: Port 5000 is already in use
```

**Solution:** Change PORT in `.env` or kill the process using port 5000

## Testing with cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Get all patients
curl http://localhost:5000/api/patients

# Create patient
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Patient",
    "age": 65,
    "dateOfBirth": "1959-01-01",
    "gender": "Male",
    "contact": "555-0000",
    "admissionDate": "2024-01-20",
    "heartRate": 80,
    "systolicBP": 120,
    "diastolicBP": 80,
    "spo2": 98,
    "temperature": 37.0,
    "respRate": 16,
    "chronicConditions": {"diabetes": false, "copd": false, "cardiacDisease": false},
    "erVisits": 0,
    "labs": {"wbc": false, "creatinine": false, "crp": false},
    "notes": "Test patient"
  }'
```

## License

ISC
