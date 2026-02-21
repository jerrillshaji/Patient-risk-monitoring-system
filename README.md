# Patient Risk Monitoring System

A comprehensive clinical decision support system for patient data collection, automated risk assessment, and audit tracking. Built with React, TypeScript, and **Supabase** (serverless PostgreSQL).

**Technical Assessment Submission for Amrita Technologies**

![Status](https://img.shields.io/badge/status-complete-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ⚡ Quick Start

```bash
# 1. Navigate to project
cd patient

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Configure Supabase
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Set up database (run in Supabase SQL Editor)
# Copy content of supabase-schema.sql and run it

# 5. Start the app
npm run dev
```

Access at: **http://localhost:5173**

📚 **Full Setup:** See [`patient/SUPABASE_SETUP.md`](patient/SUPABASE_SETUP.md)

---

## 🎯 Features

- ✅ **Patient Management** - CRUD operations for patient records
- ✅ **Automated Risk Calculation** - Real-time clinical risk scoring
- ✅ **Audit Trail** - Complete change history with before/after values
- ✅ **Dashboard Analytics** - Risk distribution metrics & charts
- ✅ **PDF Upload** - Document upload to Supabase Storage
- ✅ **Risk Filtering** - Filter by LOW/MEDIUM/HIGH risk levels

### Risk Scoring

| Level | Score | Color |
|-------|-------|-------|
| **LOW** | 0-2 | 🟢 Green |
| **MEDIUM** | 3-5 | 🟡 Yellow |
| **HIGH** | 6+ | 🔴 Red |

**Critical Escalation:** SpO2 <85%, SBP <80, or HR >140 → HIGH

---

## 🏗️ Architecture

### Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Database** | Supabase PostgreSQL (serverless) |
| **Storage** | Supabase Storage |
| **State** | React Context API |
| **Charts** | Recharts |

### System Architecture

```
┌─────────────────────────┐
│   React Frontend        │
│   (localhost:5173)      │
└───────────┬─────────────┘
            │
            ↓ HTTPS
┌─────────────────────────┐
│   Supabase Cloud        │
│   - PostgreSQL          │
│   - Storage             │
│   - RLS Security        │
└─────────────────────────┘
```

**No backend server required!** 100% serverless with Supabase.

---

## 📁 Project Structure

```
patient-risk-monitoring-system/
├── patient/
│   ├── src/              # React components & logic
│   ├── .env.local        # Supabase credentials
│   ├── supabase-schema.sql
│   ├── README.md
│   └── SUPABASE_SETUP.md
├── vercel.json           # Vercel deployment config
└── README.md             # This file
```

---

## 🚀 Deployment

### Deploy to Vercel

**Automatic:**
1. Push to GitHub
2. Import at https://vercel.com/new
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

**Manual:**
```bash
npm install -g vercel
vercel --prod
```

### Build Locally

```bash
cd patient
npm run build
# Output: dist/ folder
```

---

## 🧪 Testing Checklist

After setup, verify:

- [ ] Dashboard displays metrics
- [ ] Can create new patient
- [ ] Can edit patient
- [ ] Can delete patient
- [ ] Risk score updates dynamically
- [ ] Audit log tracks changes
- [ ] PDF upload works
- [ ] Data persists after refresh

---

## 🆘 Troubleshooting

| Error | Solution |
|-------|----------|
| Missing env variables | Check `.env.local` has Supabase credentials |
| relation does not exist | Run `supabase-schema.sql` in Supabase SQL Editor |
| Permission denied | Check RLS policies in Supabase dashboard |
| PDF upload fails | Ensure `pdf-uploads` bucket exists |

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| [`patient/README.md`](patient/README.md) | Frontend documentation |
| [`patient/SUPABASE_SETUP.md`](patient/SUPABASE_SETUP.md) | Supabase setup guide |
| [`vercel.json`](vercel.json) | Vercel deployment config |

---

## 🔐 Security

### Row Level Security (RLS)

Current: **Permissive policies** (development)
```sql
CREATE POLICY "Allow all operations" ON patients FOR ALL USING (true);
```

Production: **Enable Supabase Auth** and restrict access:
```sql
CREATE POLICY "Authenticated users only"
  ON patients FOR ALL USING (auth.role() = 'authenticated');
```

---

## 📈 Future Enhancements

- [ ] Supabase Authentication
- [ ] Real-time subscriptions
- [ ] Edge Functions for PDF parsing
- [ ] Email notifications
- [ ] Export to CSV/PDF
- [ ] Advanced analytics

---

## 🔗 Resources

- **Supabase:** https://supabase.com/docs
- **React:** https://react.dev
- **Vite:** https://vitejs.dev
- **Vercel:** https://vercel.com/docs

---

**🎉 Your serverless Patient Risk Monitoring System is ready!**
