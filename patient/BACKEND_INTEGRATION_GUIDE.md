# Backend Integration Guide

This guide explains how to integrate the Patient Risk Monitoring System with a backend API and database.

## Overview

The application currently uses **LocalStorage** for demonstration purposes. For production, you need:

1. **Backend Server** (Node.js, Python, Java, etc.)
2. **Database** (PostgreSQL, MongoDB, MySQL, etc.)
3. **API Integration** in the frontend
4. **Authentication & Authorization**
5. **Audit Logging**

## Backend Stack Recommendation

### Option A: Node.js + Express + PostgreSQL

**Setup**:
```bash
# Create backend project
mkdir patient-risk-api
cd patient-risk-api
npm init -y
npm install express cors dotenv pg bcryptjs jsonwebtoken
```

**Basic Server Structure**:
```
patient-risk-api/
├── server.js
├── routes/
│   ├── patients.js
│   ├── auth.js
│   └── audit.js
├── controllers/
│   ├── patientController.js
│   ├── authController.js
│   └── auditController.js
├── models/
│   ├── Patient.js
│   ├── User.js
│   └── AuditLog.js
├── middleware/
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
├── config/
│   └── database.js
└── .env
```

### Option B: Python + Django + PostgreSQL

**Setup**:
```bash
# Create backend project
mkdir patient-risk-api
cd patient-risk-api
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install django djangorestframework python-dotenv psycopg2-binary
```

## Database Schema

### PostgreSQL Setup

```sql
-- Create database
CREATE DATABASE patient_risk_monitoring;

-- Connect to database
\c patient_risk_monitoring;

-- Users table (for authentication)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'clinician', -- clinician, supervisor, admin
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_id UUID NOT NULL REFERENCES users(id),
  
  -- Demographics
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  age INT,
  gender VARCHAR(20),
  contact VARCHAR(255),
  admission_date TIMESTAMP,
  
  -- Vitals
  heart_rate INT,
  systolic_bp INT,
  diastolic_bp INT,
  spo2 INT,
  temperature DECIMAL(5,2),
  resp_rate INT,
  
  -- Medical History
  diabetes BOOLEAN DEFAULT FALSE,
  copd BOOLEAN DEFAULT FALSE,
  cardiac_disease BOOLEAN DEFAULT FALSE,
  er_visits INT DEFAULT 0,
  
  -- Lab Indicators
  wbc BOOLEAN DEFAULT FALSE,
  creatinine BOOLEAN DEFAULT FALSE,
  crp BOOLEAN DEFAULT FALSE,
  
  -- Notes
  notes TEXT,
  
  -- Risk Assessment (denormalized for performance)
  risk_score INT,
  risk_level VARCHAR(20),
  critical_escalation BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT age_check CHECK (age >= 0 AND age <= 150),
  CONSTRAINT heart_rate_check CHECK (heart_rate >= 0 AND heart_rate <= 200),
  CONSTRAINT bp_check CHECK (systolic_bp >= 0 AND systolic_bp <= 300),
  CONSTRAINT spo2_check CHECK (spo2 >= 0 AND spo2 <= 100),
  CONSTRAINT temp_check CHECK (temperature >= 30 AND temperature <= 45)
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  modified_by_id UUID NOT NULL REFERENCES users(id),
  
  "field" VARCHAR(255) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  
  risk_score_before INT,
  risk_level_before VARCHAR(20),
  risk_score_after INT,
  risk_level_after VARCHAR(20),
  
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Create indexes for performance
CREATE INDEX idx_patients_created_by ON patients(created_by_id);
CREATE INDEX idx_patients_admission_date ON patients(admission_date);
CREATE INDEX idx_patients_risk_level ON patients(risk_level);
CREATE INDEX idx_audit_logs_patient_id ON audit_logs(patient_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Create views for analytics
CREATE VIEW patient_risk_summary AS
SELECT 
  risk_level,
  COUNT(*) as count,
  ROUND(AVG(risk_score), 2) as avg_score
FROM patients
GROUP BY risk_level;
```

## API Endpoints

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - User login (returns JWT)
POST   /api/auth/logout         - User logout
POST   /api/auth/refresh        - Refresh JWT token
GET    /api/auth/me             - Get current user
```

### Patients
```
GET    /api/patients            - List all patients (paginated)
GET    /api/patients/:id        - Get patient by ID
POST   /api/patients            - Create new patient
PUT    /api/patients/:id        - Update patient
DELETE /api/patients/:id        - Delete patient
GET    /api/patients/search     - Search patients
```

### Audit Logs
```
GET    /api/patients/:id/audit  - Get audit log for patient
GET    /api/audit               - Get all audit logs (admin only)
```

### Analytics
```
GET    /api/analytics/summary   - Dashboard metrics
GET    /api/analytics/trends    - Risk trends
GET    /api/analytics/distribution - Risk distribution
```

## Frontend Integration Steps

### Step 1: Update API Service

Edit `src/services/api.ts`:

```typescript
import axios from 'axios';
import { Patient } from '../types/types';

const BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with auth token
const api = axios.create({
  baseURL: BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const patientAPI = {
  async getPatients(page = 1, limit = 10) {
    const response = await api.get('/patients', { params: { page, limit } });
    return response.data;
  },

  async getPatient(id: string) {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  async createPatient(patient: any) {
    const response = await api.post('/patients', patient);
    return response.data;
  },

  async updatePatient(id: string, updates: any) {
    const response = await api.put(`/patients/${id}`, updates);
    return response.data;
  },

  async deletePatient(id: string) {
    await api.delete(`/patients/${id}`);
  },

  async getAuditLog(patientId: string) {
    const response = await api.get(`/patients/${patientId}/audit`);
    return response.data;
  },

  async getDashboardMetrics() {
    const response = await api.get('/analytics/summary');
    return response.data;
  },
};

export const authAPI = {
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('authToken', response.data.token);
    return response.data;
  },

  async logout() {
    localStorage.removeItem('authToken');
    await api.post('/auth/logout');
  },

  async register(data: any) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
};
```

### Step 2: Update Context for API

Edit `src/context/PatientContext.tsx`:

```typescript
// Add loading and error states
interface PatientContextType {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  addPatient: (p: any) => Promise<void>;
  updatePatient: (id: string, updated: any) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  fetchPatients: () => Promise<void>;
}

// In useEffect, fetch from API instead of localStorage
useEffect(() => {
  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await patientAPI.getPatients();
      setPatients(data);
    } catch (err) {
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  loadPatients();
}, []);
```

### Step 3: Add Authentication Context

Create `src/context/AuthContext.tsx`:

```typescript
import React, { createContext, useState, useContext } from 'react';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: any | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const response = await authAPI.login(email, password);
    setUser(response.user);
    setToken(response.token);
    setLoading(false);
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
```

### Step 4: Create Protected Routes

Edit `src/routes/AppRoutes.tsx`:

```typescript
import { ProtectedRoute } from './ProtectedRoute';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } 
      />
      {/* ... other routes with ProtectedRoute */}
    </Routes>
  );
};
```

## Deployment Guide

### Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set VITE_API_URL=https://your-backend-api.herokuapp.com

# Deploy
git push heroku main
```

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: patient_risk_monitoring
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"

  api:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/patient_risk_monitoring
    depends_on:
      - db

  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:3001/api
    depends_on:
      - api
```

## Security Considerations

1. **Authentication**
   - Use JWT tokens
   - Implement refresh token rotation
   - Secure password hashing (bcrypt)

2. **Authorization**
   - Role-based access control (RBAC)
   - Patient data isolation
   - Audit logging for sensitive operations

3. **Data Protection**
   - HTTPS/TLS encryption
   - Database encryption at rest
   - PII data masking in logs

4. **HIPAA Compliance**
   - Audit trail for all access
   - Access control lists
   - Data retention policies
   - Encryption standards

## Performance Optimization

1. **Database**
   - Add indexes on frequently queried fields
   - Implement pagination
   - Cache common queries

2. **API**
   - Rate limiting
   - Request compression
   - Load balancing

3. **Frontend**
   - Lazy load components
   - Code splitting
   - Minification and bundling

## Monitoring & Logging

1. **Application Logs**
   - Winston logger (Node.js)
   - Structured logging (JSON)

2. **Error Tracking**
   - Sentry integration
   - Error notifications

3. **Performance Monitoring**
   - New Relic
   - DataDog
   - CloudWatch

## Testing

### API Testing
```bash
npm install --save-dev jest supertest
```

### Database Testing
```bash
npm install --save-dev pg-test pg-migrate
```

## Troubleshooting

### CORS Issues
```javascript
// Backend: Express
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

### Database Connection Issues
- Check connection string
- Verify firewall rules
- Check database user permissions

### Authentication Issues
- Verify JWT secret
- Check token expiration
- Verify CORS headers

## Next Steps

1. Choose backend framework
2. Set up PostgreSQL database
3. Implement API endpoints
4. Update frontend API service
5. Test all endpoints
6. Deploy to staging
7. Performance and security testing
8. Deploy to production

## Additional Resources

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Express.js Guide: https://expressjs.com/
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- FHIR Standard: https://www.hl7.org/fhir/
- HIPAA Compliance: https://www.hhs.gov/hipaa/
