# Supabase Setup Guide

## Quick Setup (5 Minutes)

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up (free)
3. Click **"New Project"**
4. Fill in:
   - **Name:** `patient-risk-monitoring`
   - **Database Password:** (save it!)
   - **Region:** Choose closest to you
5. Click **"Create new project"** (wait 2-3 minutes)

---

### Step 2: Get Credentials

1. Click **⚙️ Settings** (bottom-left sidebar)
2. Click **API**
3. Copy these values:
   - **Project URL**
   - **anon/public key**

---

### Step 3: Configure Environment

Create `patient/.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Step 4: Run Database Schema

1. Go to **SQL Editor** (left sidebar in Supabase)
2. Click **"New Query"**
3. Open `patient/supabase-schema.sql`
4. Copy **ALL content** (Ctrl+A, Ctrl+C)
5. Paste into Supabase SQL Editor
6. Click **"Run"** (or Ctrl+Enter)

✅ You should see: `SUCCESS: Table "patients" created`, etc.

---

### Step 5: Start the App

```bash
cd patient
npm install --legacy-peer-deps
npm run dev
```

Open: **http://localhost:5173**

---

## ✅ Verify Setup

1. **Dashboard loads** with metrics
2. **Click "Add New Patient"**
3. Fill in the form and save
4. Check **Supabase Dashboard → Table Editor** to see the data

---

## 📊 Database Schema

### Tables Created

**patients** - All patient data
- Demographics, vitals, medical history
- Risk score & level (calculated by frontend)
- Automatic timestamps

**audit_logs** - Change history
- Tracks all field changes
- Before/after values
- Risk score changes

### Storage Bucket

**pdf-uploads** - PDF document storage
- Public read access
- Secure upload with RLS

---

## 🔐 Security (RLS)

Current setup: **Permissive policies** (allows all - good for development)

For production: Enable Supabase Auth and restrict access:
```sql
CREATE POLICY "Authenticated users only"
  ON patients FOR ALL
  USING (auth.role() = 'authenticated');
```

---

## 🆘 Troubleshooting

| Error | Solution |
|-------|----------|
| Missing env variables | Check `.env.local` has correct credentials |
| relation does not exist | Run `supabase-schema.sql` in SQL Editor |
| Permission denied | Check RLS policies in Supabase dashboard |
| PDF upload fails | Ensure `pdf-uploads` bucket exists in Storage |

---

## 📚 What's Next?

- ✅ Test all features (create, edit, delete patients)
- ✅ Check audit log tracks changes
- ✅ Try PDF upload
- ✅ Deploy to production (Vercel/Netlify)

---

**Need Help?** https://supabase.com/docs

**🎉 You're all set!**
