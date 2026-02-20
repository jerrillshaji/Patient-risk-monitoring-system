# 🚀 Quick Start Guide - Patient Risk Monitoring System

This guide will get your Patient Risk Monitoring System up and running with MySQL database in minutes.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **MySQL Server** installed and running
- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **npm** (comes with Node.js)

---

## ⚡ Quick Setup (5 Steps)

### Step 1: Setup MySQL Database

Open MySQL command line or MySQL Workbench and run:

```sql
-- Create database
CREATE DATABASE patientdb;

-- Use the database
USE patientdb;
```

Then run the schema file:

**Windows (Command Prompt):**
```cmd
mysql -u root -p patientdb < "c:\Users\MI\Documents\Patient risk monitoring system\patient\backend\database\schema.sql"
```

**Windows (PowerShell):**
```powershell
Get-Content "c:\Users\MI\Documents\Patient risk monitoring system\patient\backend\database\schema.sql" | mysql -u root -p patientdb
```

**MySQL Workbench:**
1. Open `backend/database/schema.sql`
2. Select the `patientdb` schema
3. Click Execute (⚡)

---

### Step 2: Configure Backend

Open `patient\backend\.env` and update your MySQL password:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=YOUR_MYSQL_PASSWORD  # ← Change this!
MYSQL_DATABASE=patientdb
MYSQL_PORT=3306
PORT=5000
NODE_ENV=development
```

---

### Step 3: Install Dependencies

**Backend:**
```cmd
cd "c:\Users\MI\Documents\Patient risk monitoring system\patient\backend"
npm install
```

**Frontend:**
```cmd
cd "c:\Users\MI\Documents\Patient risk monitoring system\patient"
npm install --legacy-peer-deps
```

---

### Step 4: Start the Backend Server

Open a terminal:

```cmd
cd "c:\Users\MI\Documents\Patient risk monitoring system\patient\backend"
npm run dev
```

✅ You should see:
```
✅ MySQL connected successfully
📊 Database: patientdb
🔗 Host: localhost
🚀 Backend running on port 5000
📡 API available at http://localhost:5000/api
```

**Keep this terminal open!**

---

### Step 5: Start the Frontend

Open a **NEW terminal** (keep backend running):

```cmd
cd "c:\Users\MI\Documents\Patient risk monitoring system\patient"
npm run dev
```

✅ You should see:
```
VITE v7.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## 🎉 You're Ready!

Open your browser and go to: **http://localhost:5173**

You should see the Patient Risk Monitoring System interface.

---

## ✅ Verify Everything Works

### Test Backend API

Open browser: http://localhost:5000/api/health

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

### Test Database Connection

In MySQL:
```sql
USE patientdb;
SHOW TABLES;
```

You should see:
```
+---------------------+
| Tables_in_patientdb |
+---------------------+
| patients            |
| auditLogs           |
+---------------------+
```

### Create a Test Patient

Use the frontend UI to create a patient, then verify in MySQL:

```sql
SELECT * FROM patients;
```

---

## 🔧 Troubleshooting

### ❌ MySQL Connection Failed

**Error:** `ER_ACCESS_DENIED_ERROR`

**Solution:**
1. Check your MySQL password in `backend/.env`
2. Verify MySQL is running: `mysqladmin -u root -p status`

---

### ❌ Database Doesn't Exist

**Error:** `Unknown database 'patientdb'`

**Solution:**
```sql
CREATE DATABASE patientdb;
```

Then run the schema again.

---

### ❌ Tables Don't Exist

**Error:** `Table 'patientdb.patients' doesn't exist`

**Solution:** Run the schema file again (see Step 1)

---

### ❌ Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
1. Close any other apps using port 5000
2. Or change the PORT in `backend/.env` to another value (e.g., 5001)

---

### ❌ Frontend Can't Connect to Backend

**Error:** `Network Error` or CORS error

**Solution:**
1. Make sure backend is running (check terminal)
2. Verify backend shows "MySQL connected successfully"
3. Check frontend `.env` has: `VITE_API_URL=http://localhost:5000/api`

---

### ❌ npm Install Fails

**Error:** `ERESOLVE could not resolve`

**Solution:**
```cmd
npm install --legacy-peer-deps
```

---

## 📁 Project Structure

```
Patient risk monitoring system/
├── patient/                    # Frontend React app
│   ├── .env                    # Frontend environment (already configured)
│   ├── src/                    # React source code
│   ├── backend/                # Backend API
│   │   ├── .env                # Backend environment (configure MySQL password)
│   │   ├── config/             # Database config
│   │   ├── controllers/        # API handlers
│   │   ├── models/             # Data models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── database/           # SQL schema
│   │   └── server.js           # Express server
│   └── SETUP_MYSQL_GUIDE.md    # Detailed setup guide
└── README_QUICKSTART.md        # This file
```

---

## 🔑 Default Configuration

| Component | URL | Port |
|-----------|-----|------|
| Frontend | http://localhost:5173 | 5173 |
| Backend API | http://localhost:5000 | 5000 |
| MySQL | localhost | 3306 |

---

## 📝 Environment Files

### Backend (.env)
```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password  # ← CHANGE THIS
MYSQL_DATABASE=patientdb
PORT=5000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```
(Already configured correctly)

---

## 🧪 Test the System

1. **Start both servers** (backend and frontend)
2. **Open** http://localhost:5173
3. **Add a new patient** using the form
4. **Check the database:**
   ```sql
   SELECT id, fullname, risklevel FROM patients;
   ```
5. **Check audit logs:**
   ```sql
   SELECT * FROM auditLogs;
   ```

---

## 📚 Additional Documentation

- `SETUP_MYSQL_GUIDE.md` - Detailed MySQL setup
- `backend/README.md` - Backend API documentation
- `BACKEND_INTEGRATION_GUIDE.md` - Integration details

---

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review backend terminal for error messages
3. Verify MySQL is running: `mysqladmin -u root -p status`
4. Check database exists: `mysql -u root -p -e "SHOW DATABASES;"`

---

## ✨ Features

- ✅ MySQL database storage
- ✅ Real-time risk calculation
- ✅ Audit logging for all changes
- ✅ Responsive UI
- ✅ RESTful API
- ✅ CORS enabled

---

**Happy monitoring! 🏥**
