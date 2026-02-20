# Quick Start - Get Running in 15 Minutes

## Step 1: Set up MySQL (5 min)

1. Create a MySQL database (local or cloud).
2. Run the SQL in [MYSQL_SETUP.md](MYSQL_SETUP.md) to create the required tables.
3. Copy connection details for the backend `.env` file.

## Step 2: Get Credentials (1 min)

1. Project dashboard → **Settings → API**
2. Copy these values:
   - **Project URL** → SUPABASE_URL
   - **anon key** → SUPABASE_ANON_KEY  
   - **service_role key** → SUPABASE_SERVICE_ROLE_KEY

3. Keep them safe (you'll need them in next 2 steps)

## Step 3: Create Database Tables (2 min)

1. In Supabase dashboard → **SQL Editor → New Query**
2. Paste SQL from [MIGRATION_AND_SETUP.md](MIGRATION_AND_SETUP.md#step-3-create-database-tables) (around line 150)
3. Click **Run**
4. Verify tables appear in left sidebar

## Step 4: Setup Backend (3 min)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file (example shown in backend/.env.example)
echo "MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=patientdb
PORT=5000
NODE_ENV=development" > .env

# Start backend
npm run dev

# You should see: ✅ MySQL connected successfully
```

## Step 5: Setup Frontend (2 min)

```bash
# In new terminal, navigate to frontend
cd patient

# Install dependencies
npm install

# Create .env.local file
echo "VITE_API_URL=http://localhost:5000/api" > .env.local

# Start frontend
npm run dev

# Opens: http://localhost:5173
```

## Step 6: Test It (2 min)

✅ Backend running on **http://localhost:5000**  
✅ Frontend running on **http://localhost:5173**

1. Click **"Add New Patient"**
2. Fill in form (Name, Date of Birth, Gender, Contact)
3. Add vital signs (all fields required)
4. Click **Save**
5. Patient appears in list!

## Common Issues

**"Cannot POST /api/patients"**
- ❌ Backend not running
- ✅ Check terminal 1 for backend

**"Cannot connect to Supabase"**
- ❌ Wrong SUPABASE_SERVICE_ROLE_KEY
- ✅ Copy from Settings → API (not anon key)

**Empty patient list despite adding**
- ❌ Using old localStorage cache
- ✅ Press Ctrl+Shift+R to hard refresh

**CORS error**
- ❌ Frontend URL not localhost:5173
- ✅ Check VITE_API_URL in .env.local

## Next Steps

- 📖 [Full Setup Guide](MIGRATION_AND_SETUP.md)
- 💻 [Developer Reference](DEVELOPER_QUICK_REFERENCE.md)
- 🏗️ [System Architecture](ARCHITECTURE_AND_INTEGRATION.md)
- ✅ [Project Summary](PROJECT_COMPLETION_SUMMARY.md)

## Verify Everything Works

- [ ] Backend shows `✅ MySQL connected successfully`
- [ ] Frontend loads at http://localhost:5173
- [ ] Can create new patient
- [ ] Patient appears in list
- [ ] Can edit patient
- [ ] Audit log shows changes
- [ ] Can delete patient
- [ ] Dashboard shows metric counts
- [ ] No errors in browser console (F12)

**You're Done!** 🎉

Your Patient Risk Monitoring System is now running with Supabase.

---

**Need Help?**
1. Check troubleshooting above
2. View [MIGRATION_AND_SETUP.md](MIGRATION_AND_SETUP.md#phase-7-troubleshooting)
3. Check browser console for errors (F12 → Console)
4. Check backend terminal for logs

**Want to Deploy?**
See [MIGRATION_AND_SETUP.md Phase 8](MIGRATION_AND_SETUP.md#phase-8-production-deployment-optional)
