# Patient Risk Monitoring System

Clinical decision support app for patient data entry, risk scoring, and audit tracking.

## Tech Stack

- React 19 + TypeScript + Vite
- Supabase (PostgreSQL + Storage)
- React Router + Recharts

## Features

- Patient CRUD (create, edit, delete, list)
- Real-time risk calculation (LOW / MEDIUM / HIGH)
- Audit history for field changes
- Dashboard with risk metrics/charts
- PDF upload and form auto-fill (editable before save)

## Setup

### Prerequisites

- Node.js 18+
- Supabase project

### Install

```bash
npm install
```

### Environment

Create `.env.local` in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Database

Run `supabase-schema.sql` in Supabase SQL Editor.

### Run

```bash
npm run dev
```

App runs at `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Project Structure

- `src/pages` - route pages
- `src/components` - UI components
- `src/context/PatientContext.tsx` - app state
- `src/services/api.ts` - Supabase + PDF parsing
- `src/services/riskEngine.ts` - risk calculation logic
- `src/lib/supabase.ts` - Supabase client
- `supabase-schema.sql` - database schema

## Notes

- Risk values are system-calculated from patient inputs.
- Risk is recalculated whenever relevant fields change.
- Uploaded PDF values are used to pre-fill form fields; users can edit before saving.
