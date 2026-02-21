# Patient Risk Monitoring System

A comprehensive clinical decision support system for patient data collection, automated risk assessment, and audit tracking. Built with React, TypeScript, and **Supabase** (serverless PostgreSQL).

**Technical Assessment Submission for Amrita Technologies**

![Status](https://img.shields.io/badge/status-complete-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)

### 1. Install Dependencies
```bash
cd patient
npm install --legacy-peer-deps
```

### 2. Configure Supabase
Create `.env.local` file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Get credentials from:** Supabase Dashboard → Project Settings → API

### 3. Set Up Database
1. Go to Supabase Dashboard → SQL Editor
2. Copy entire content of `supabase-schema.sql`
3. Paste and click **Run**

This creates:
- `patients` table
- `audit_logs` table
- Row Level Security policies
- Storage bucket for PDFs

### 4. Start the App
```bash
npm run dev
```

Access at: **http://localhost:5173**

---

## 📚 Documentation

- **Setup Guide:** See [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) for detailed instructions
- **Architecture:** Serverless with Supabase (no backend server needed)

---

## 🎯 Features

### Core Features
- ✅ **Patient Management** - Create, read, update, delete patients
- ✅ **Automated Risk Calculation** - Real-time risk scoring based on clinical parameters
- ✅ **Audit Trail System** - Complete change history with before/after values
- ✅ **Dashboard Analytics** - Risk distribution metrics and visualizations
- ✅ **PDF Upload** - Document upload to Supabase Storage
- ✅ **Risk Filtering** - Filter patients by LOW/MEDIUM/HIGH risk

### Risk Calculation
- **LOW** (Green): Score 0-2
- **MEDIUM** (Yellow/Orange): Score 3-5
- **HIGH** (Red): Score 6+ or critical escalation

**Scoring Factors:**
- Age, vital signs (HR, BP, SpO2, temperature, resp rate)
- Chronic conditions (diabetes, COPD, cardiac disease)
- ER visits in last 30 days
- Lab indicators (WBC, creatinine, CRP)

---

## 🏗️ Architecture

### Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Database** | Supabase PostgreSQL |
| **Storage** | Supabase Storage (S3-compatible) |
| **State** | React Context API |
| **Charts** | Recharts |
| **Routing** | React Router v6 |

### System Architecture

```
┌─────────────────────────────────────┐
│   React Frontend (Vite)             │
│   http://localhost:5173             │
├─────────────────────────────────────┤
│   Components → Context → Supabase   │
│   Risk Engine (frontend)            │
└─────────────────────────────────────┘
                ↓ HTTPS
┌─────────────────────────────────────┐
│   Supabase Cloud                    │
│   - PostgreSQL Database             │
│   - Row Level Security              │
│   - File Storage                    │
└─────────────────────────────────────┘
```

**No backend server required!** Supabase handles everything.

---

## 📁 Project Structure

```
patient/
├── src/
│   ├── components/
│   │   ├── Dashboard/       # Analytics dashboard
│   │   ├── PatientList/     # Patient table view
│   │   ├── PatientDetails/  # Patient form & details
│   │   └── AuditLog/        # Change history timeline
│   ├── context/
│   │   └── PatientContext.tsx  # Global state management
│   ├── services/
│   │   ├── api.ts           # Supabase API client
│   │   └── riskEngine.ts    # Risk calculation logic
│   ├── lib/
│   │   └── supabase.ts      # Supabase client init
│   ├── pages/               # Route pages
│   ├── types/               # TypeScript types
│   └── utils/               # Helper functions
├── .env.local               # Supabase credentials
├── .env.example             # Environment template
├── supabase-schema.sql      # Database schema
├── SUPABASE_SETUP.md        # Detailed setup guide
├── package.json             # Dependencies
└── README.md                # This file
```

---

## 🧪 Testing

After setup, verify:

- [ ] Dashboard displays metrics
- [ ] Can create new patient
- [ ] Can edit patient (changes saved to Supabase)
- [ ] Can delete patient
- [ ] Risk score updates dynamically
- [ ] Audit log tracks all changes
- [ ] PDF upload works
- [ ] Data persists after refresh

---

## 🔐 Security

### Row Level Security (RLS)

Current setup uses **permissive policies** (development mode):
```sql
CREATE POLICY "Allow all operations on patients"
  ON patients FOR ALL USING (true) WITH CHECK (true);
```

**For production**, enable Supabase Authentication and update policies:
```sql
CREATE POLICY "Authenticated users only"
  ON patients FOR ALL
  USING (auth.role() = 'authenticated');
```

---

## 🚀 Deployment

### Frontend
Deploy to Vercel, Netlify, or Cloudflare Pages:
```bash
npm run build
```

### Environment Variables
Set in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Database
Use the same Supabase project (or create production project).

---

## 🆘 Troubleshooting

### "Missing Supabase environment variables"
**Fix:** Create `.env.local` with your Supabase credentials

### "relation does not exist"
**Fix:** Run `supabase-schema.sql` in Supabase SQL Editor

### "Permission denied"
**Fix:** Check RLS policies in Supabase dashboard

### PDF upload fails
**Fix:** Ensure `pdf-uploads` storage bucket exists

---

## 📈 Future Enhancements

- [ ] Enable Supabase Authentication
- [ ] Add real-time subscriptions for live updates
- [ ] Create Supabase Edge Function for server-side PDF parsing
- [ ] Add email notifications for high-risk patients
- [ ] Export patient data to CSV/PDF
- [ ] Advanced analytics and reporting

---

## 📚 Resources

- **Supabase Docs:** https://supabase.com/docs
- **React Docs:** https://react.dev
- **Vite Docs:** https://vitejs.dev

---

## 📄 License

MIT License - See LICENSE file for details.

---

**🎉 Your Patient Risk Monitoring System is fully serverless and ready to use!**
