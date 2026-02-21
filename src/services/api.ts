import { supabase } from "../lib/supabase";
import type { Patient, AuditLog } from "../types/types";

/**
 * API Service Layer
 * Communicates directly with Supabase (PostgreSQL + Storage)
 */

// Type for database patient row (snake_case)
interface DbPatient {
  id: number;
  full_name: string;
  date_of_birth: string;
  age: number | null;
  gender: string | null;
  contact: string | null;
  admission_date: string | null;
  heart_rate: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  spo2: number | null;
  temperature: number | null;
  resp_rate: number | null;
  diabetes: boolean;
  copd: boolean;
  cardiac_disease: boolean;
  er_visits: number;
  wbc_elevated: boolean;
  creatinine_high: boolean;
  crp_high: boolean;
  notes: string | null;
  risk_score: number | null;
  risk_level: string | null;
  created_at: string;
  updated_at: string;
}

// Type for database audit log row
interface DbAuditLog {
  id: number;
  patient_id: number;
  field: string;
  old_value: string | null;
  new_value: string | null;
  risk_score_before: number | null;
  risk_level_before: string | null;
  risk_score_after: number | null;
  risk_level_after: string | null;
  created_at: string;
}

/**
 * Convert database patient row to application format
 */
const fromDbPatient = (row: DbPatient): Patient => {
  return {
    id: row.id,
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth,
    age: row.age || 0,
    gender: (row.gender as "Male" | "Female" | "Other") || "Other",
    contact: row.contact || "",
    admissionDate: row.admission_date || "",
    heartRate: row.heart_rate || 0,
    systolicBP: row.systolic_bp || 0,
    diastolicBP: row.diastolic_bp || 0,
    spo2: row.spo2 || 0,
    temperature: row.temperature || 0,
    respRate: row.resp_rate || 0,
    chronicConditions: {
      diabetes: row.diabetes || false,
      copd: row.copd || false,
      cardiacDisease: row.cardiac_disease || false,
    },
    erVisits: row.er_visits || 0,
    labs: {
      wbc: row.wbc_elevated || false,
      creatinine: row.creatinine_high || false,
      crp: row.crp_high || false,
    },
    notes: row.notes || "",
    riskScore: row.risk_score || 0,
    riskLevel: (row.risk_level as "LOW" | "MEDIUM" | "HIGH") || "LOW",
    lastUpdated: row.updated_at,
    history: [],
  };
};

/**
 * Convert application patient to database format
 */
const toDbPatient = (patient: Partial<Patient>): Partial<DbPatient> => {
  const db: Partial<DbPatient> = {};
  
  if (patient.fullName !== undefined) db.full_name = patient.fullName;
  if (patient.dateOfBirth !== undefined) db.date_of_birth = patient.dateOfBirth;
  if (patient.age !== undefined) db.age = patient.age;
  if (patient.gender !== undefined) db.gender = patient.gender;
  if (patient.contact !== undefined) db.contact = patient.contact;
  if (patient.admissionDate !== undefined) db.admission_date = patient.admissionDate;
  if (patient.heartRate !== undefined) db.heart_rate = patient.heartRate;
  if (patient.systolicBP !== undefined) db.systolic_bp = patient.systolicBP;
  if (patient.diastolicBP !== undefined) db.diastolic_bp = patient.diastolicBP;
  if (patient.spo2 !== undefined) db.spo2 = patient.spo2;
  if (patient.temperature !== undefined) db.temperature = patient.temperature;
  if (patient.respRate !== undefined) db.resp_rate = patient.respRate;
  if (patient.chronicConditions !== undefined) {
    db.diabetes = patient.chronicConditions.diabetes;
    db.copd = patient.chronicConditions.copd;
    db.cardiac_disease = patient.chronicConditions.cardiacDisease;
  }
  if (patient.erVisits !== undefined) db.er_visits = patient.erVisits;
  if (patient.labs !== undefined) {
    db.wbc_elevated = patient.labs.wbc;
    db.creatinine_high = patient.labs.creatinine;
    db.crp_high = patient.labs.crp;
  }
  if (patient.notes !== undefined) db.notes = patient.notes;
  if (patient.riskScore !== undefined) db.risk_score = patient.riskScore;
  if (patient.riskLevel !== undefined) db.risk_level = patient.riskLevel;
  
  return db;
};

/**
 * Convert database audit log to application format
 */
const fromDbAuditLog = (row: DbAuditLog): AuditLog => {
  return {
    id: row.id,
    timestamp: row.created_at,
    field: row.field,
    oldValue: row.old_value,
    newValue: row.new_value,
    riskScoreBefore: row.risk_score_before || undefined,
    riskLevelBefore: row.risk_level_before as "LOW" | "MEDIUM" | "HIGH" | undefined,
    riskScoreAfter: row.risk_score_after || undefined,
    riskLevelAfter: row.risk_level_after as "LOW" | "MEDIUM" | "HIGH" | undefined,
  };
};

export const patientAPI = {
  // Get all patients
  async getPatients(): Promise<Patient[]> {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Supabase error fetching patients:", error);
        throw error;
      }

      return (data || []).map(fromDbPatient);
    } catch (err) {
      console.error("Error fetching patients:", err);
      // Fallback to localStorage if Supabase unavailable
      return this.getPatientsFromCache();
    }
  },

  // Get single patient by ID with audit logs
  async getPatient(id: string): Promise<Patient> {
    try {
      // Fetch patient
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();

      if (patientError) throw patientError;
      if (!patientData) throw new Error("Patient not found");

      // Fetch audit logs
      const { data: auditData, error: auditError } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("patient_id", id)
        .order("created_at", { ascending: false });

      if (auditError) console.warn("Error fetching audit logs:", auditError);

      const patient = fromDbPatient(patientData);
      patient.history = (auditData || []).map(fromDbAuditLog);

      return patient;
    } catch (err) {
      console.error(`Error fetching patient ${id}:`, err);
      throw err;
    }
  },

  // Create new patient
  async createPatient(patient: Omit<Patient, "id" | "riskScore" | "riskLevel" | "lastUpdated" | "history">): Promise<Patient> {
    try {
      const dbPatient = toDbPatient(patient);
      
      const { data, error } = await supabase
        .from("patients")
        .insert([dbPatient])
        .select()
        .single();

      if (error) throw error;

      return fromDbPatient(data);
    } catch (err) {
      console.error("Error creating patient:", err);
      throw err;
    }
  },

  // Update patient
  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    try {
      // Fetch old patient data for audit
      const { data: oldData, error: fetchError } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Convert updates to DB format
      const dbUpdates = toDbPatient(updates);

      // Update patient
      const { data: updatedData, error: updateError } = await supabase
        .from("patients")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Create audit log entries for changed fields
      const trackedFields = [
        { app: "fullName", db: "full_name" },
        { app: "dateOfBirth", db: "date_of_birth" },
        { app: "age", db: "age" },
        { app: "gender", db: "gender" },
        { app: "contact", db: "contact" },
        { app: "admissionDate", db: "admission_date" },
        { app: "heartRate", db: "heart_rate" },
        { app: "systolicBP", db: "systolic_bp" },
        { app: "diastolicBP", db: "diastolic_bp" },
        { app: "spo2", db: "spo2" },
        { app: "temperature", db: "temperature" },
        { app: "respRate", db: "resp_rate" },
        { app: "notes", db: "notes" },
        { app: "riskScore", db: "risk_score" },
        { app: "riskLevel", db: "risk_level" },
      ];

      const auditEntries = trackedFields
        .filter(({ db }) => dbUpdates[db as keyof DbPatient] !== undefined)
        .map(({ app, db }) => {
          const oldVal = oldData[db as keyof DbPatient];
          const newVal = dbUpdates[db as keyof DbPatient];
          
          // Skip if values are the same
          if (oldVal === newVal) return null;

          return {
            patient_id: Number(id),
            field: app,
            old_value: oldVal != null ? String(oldVal) : null,
            new_value: newVal != null ? String(newVal) : null,
            risk_score_before: oldData.risk_score,
            risk_level_before: oldData.risk_level,
            risk_score_after: updatedData.risk_score,
            risk_level_after: updatedData.risk_level,
          };
        })
        .filter(Boolean);

      // Insert audit logs if there are changes
      if (auditEntries.length > 0) {
        await supabase.from("audit_logs").insert(auditEntries);
      }

      return fromDbPatient(updatedData);
    } catch (err) {
      console.error(`Error updating patient ${id}:`, err);
      throw err;
    }
  },

  // Delete patient
  async deletePatient(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("patients")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (err) {
      console.error(`Error deleting patient ${id}:`, err);
      throw err;
    }
  },

  // Get audit logs for patient
  async getAuditLogs(id: string): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("patient_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(`Error fetching audit logs for patient ${id}:`, error);
        return [];
      }

      return (data || []).map(fromDbAuditLog);
    } catch (err) {
      console.error(`Error fetching audit logs for patient ${id}:`, err);
      return [];
    }
  },

  // Upload PDF to Supabase Storage
  async parsePDF(file: File): Promise<Partial<Patient>> {
    try {
      console.log("[parsePDF] Starting PDF upload. File:", file.name, "Size:", file.size, "Type:", file.type);
      
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("pdf-uploads")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      console.log("[parsePDF] Uploaded to:", uploadData.path);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("pdf-uploads")
        .getPublicUrl(fileName);

      console.log("[parsePDF] Public URL:", urlData.publicUrl);

      // For now, return basic info - actual PDF parsing would need a serverless function
      // You can add Supabase Edge Function for PDF parsing if needed
      return {
        notes: `PDF uploaded: ${file.name}`,
      };
    } catch (err: any) {
      console.error("[parsePDF] Full error:", err);
      alert(`PDF Upload Error: ${err.message}\n\nCheck console for details`);
      throw err;
    }
  },

  // Fallback: Get patients from localStorage cache
  async getPatientsFromCache(): Promise<Patient[]> {
    try {
      const data = localStorage.getItem("patients_cache");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Cache patients locally as fallback
  async cachePatients(patients: Patient[]): Promise<void> {
    try {
      localStorage.setItem("patients_cache", JSON.stringify(patients));
    } catch (err) {
      console.warn("Could not cache patients:", err);
    }
  },
};

// Initialize with sample data if empty
export async function initializeSampleData() {
  const existing = await patientAPI.getPatients();
  if (existing.length === 0) {
    const samplePatients: Omit<Patient, "id" | "riskScore" | "riskLevel" | "lastUpdated" | "history">[] = [
      {
        fullName: "Sarah Jenkins",
        dateOfBirth: "1952-03-15",
        age: 72,
        gender: "Female",
        contact: "555-0101",
        admissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        heartRate: 102,
        systolicBP: 110,
        diastolicBP: 70,
        spo2: 91,
        temperature: 36.8,
        respRate: 20,
        chronicConditions: {
          diabetes: true,
          copd: true,
          cardiacDisease: false,
        },
        erVisits: 1,
        labs: {
          wbc: true,
          creatinine: false,
          crp: false,
        },
        notes: "Stable condition, requires monitoring",
      },
      {
        fullName: "John Smith",
        dateOfBirth: "1940-06-20",
        age: 84,
        gender: "Male",
        contact: "555-0102",
        admissionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        heartRate: 95,
        systolicBP: 140,
        diastolicBP: 85,
        spo2: 94,
        temperature: 37.2,
        respRate: 18,
        chronicConditions: {
          diabetes: false,
          copd: false,
          cardiacDisease: true,
        },
        erVisits: 0,
        labs: {
          wbc: false,
          creatinine: true,
          crp: true,
        },
        notes: "Post-cardiac event, careful monitoring",
      },
    ];

    for (const patient of samplePatients) {
      await patientAPI.createPatient(patient);
    }
  }
}
