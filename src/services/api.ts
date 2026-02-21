import { supabase } from "../lib/supabase";
import type { Patient, AuditLog } from "../types/types";
import { calculateAge, formatDateForInput } from "../utils/dateUtils";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min?url";

GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

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

const normalizeText = (text: string): string => text.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

const extractFirstMatch = (text: string, patterns: RegExp[]): string | undefined => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return undefined;
};

const parseNumber = (value?: string): number | undefined => {
  if (!value) return undefined;
  const parsed = Number.parseFloat(value.replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseDate = (value?: string): string | undefined => {
  if (!value) return undefined;

  const trimmed = value.trim();
  const normalized = trimmed.replace(/\./g, "/").replace(/-/g, "/");
  const splitDate = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);

  if (splitDate) {
    const first = Number(splitDate[1]);
    const second = Number(splitDate[2]);
    let year = Number(splitDate[3]);

    if (year < 100) {
      year += year > 30 ? 1900 : 2000;
    }

    const isLikelyDayFirst = first > 12;
    const month = String(isLikelyDayFirst ? second : first).padStart(2, "0");
    const day = String(isLikelyDayFirst ? first : second).padStart(2, "0");

    return formatDateForInput(`${year}-${month}-${day}`);
  }

  const formatted = formatDateForInput(trimmed);
  return formatted || undefined;
};

const parseBooleanValue = (value?: string): boolean | undefined => {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();

  if (["yes", "true", "1", "positive", "present", "elevated", "high", "abnormal", "checked"].includes(normalized)) {
    return true;
  }
  if (["no", "false", "0", "negative", "none", "normal", "not present", "absent", "unchecked"].includes(normalized)) {
    return false;
  }

  return undefined;
};

const parseGender = (value?: string): Patient["gender"] | undefined => {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();

  if (normalized.startsWith("m")) return "Male";
  if (normalized.startsWith("f")) return "Female";
  if (normalized.startsWith("o")) return "Other";

  return undefined;
};

const cleanInlineField = (value?: string): string | undefined => {
  if (!value) return undefined;
  const cleaned = value
    .replace(/\s{2,}/g, " ")
    .replace(/[|•]/g, " ")
    .trim();
  return cleaned || undefined;
};

const STOP_LABELS_PATTERN =
  "age|gender|sex|patient\\s*id|date\\s*of\\s*(?:birth|examination)|admission\\s*date|hospital|contact(?:\\s*(?:details|number|no\\.?))?|phone(?:\\s*number)?|mobile(?:\\s*number)?|email|vital\\s*signs|clinical\\s*notes|heart\\s*rate|blood\\s*pressure|oxygen\\s*saturation|spo2|body\\s*temperature|respiratory\\s*rate|er\\s*visits|diabetes|copd|cardiac\\s*disease|heart\\s*disease|wbc|creatinine|crp";

const extractValueByLabel = (text: string, labelPattern: string): string | undefined => {
  const match = text.match(
    new RegExp(
      `(?:${labelPattern})\\s*[:\\-]?\\s*(.+?)(?=\\s+(?:${STOP_LABELS_PATTERN})\\b\\s*:?|$)`,
      "i"
    )
  );
  return cleanInlineField(match?.[1]);
};

const sanitizeFullName = (value?: string): string | undefined => {
  const cleaned = cleanInlineField(value);
  if (!cleaned) return undefined;

  const withoutTrailingLabels = cleaned.replace(
    /\s+(?:age|gender|patient\s*id|date\s*of\s*examination|date\s*of\s*birth|hospital|vital\s*signs|parameter|clinical\s*notes)\b[\s\S]*$/i,
    ""
  );

  const normalizedName = withoutTrailingLabels
    .replace(/[^A-Za-z.'\-\s]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  return normalizedName || undefined;
};

const extractNameFallback = (text: string): string | undefined => {
  const match = text.match(
    /(?:^|\b)([A-Z][A-Za-z.'\-]+(?:\s+[A-Z][A-Za-z.'\-]+){1,3})(?=\s+(?:age|gender|patient\s*id|date\s*of\s*(?:birth|examination)|hospital)\b)/i
  );
  return sanitizeFullName(match?.[1]);
};

const extractBooleanByLabel = (text: string, labelPattern: string): boolean | undefined => {
  const stateAfterLabel = text.match(
    new RegExp(
      `(?:${labelPattern})\\s*(?:[:\\-]?\\s*)?(yes|no|true|false|positive|negative|present|absent|normal|abnormal|checked|unchecked)\\b`,
      "i"
    )
  )?.[1];

  const directState = parseBooleanValue(stateAfterLabel);
  if (directState !== undefined) {
    return directState;
  }

  const checkedBeforeLabel = new RegExp(`(?:☑|✅|\\[(?:x|X|✓|✔)\\]|\\((?:x|X|✓|✔)\\))\\s*(?:${labelPattern})\\b`, "i").test(text);
  if (checkedBeforeLabel) {
    return true;
  }

  const uncheckedBeforeLabel = new RegExp(`(?:☐|\\[\\s?\\]|\\(\\s?\\))\\s*(?:${labelPattern})\\b`, "i").test(text);
  if (uncheckedBeforeLabel) {
    return false;
  }

  const checkedAfterLabel = new RegExp(`(?:${labelPattern})\\b\\s*(?:☑|✅|\\[(?:x|X|✓|✔)\\]|\\((?:x|X|✓|✔)\\))`, "i").test(text);
  if (checkedAfterLabel) {
    return true;
  }

  const uncheckedAfterLabel = new RegExp(`(?:${labelPattern})\\b\\s*(?:☐|\\[\\s?\\]|\\(\\s?\\))`, "i").test(text);
  if (uncheckedAfterLabel) {
    return false;
  }

  const nearbyWindow = text.match(new RegExp(`(?:${labelPattern})\\b(.{0,35})`, "i"))?.[1] ?? "";
  const nearbyChecked = /(?:☑|✅|\[(?:x|X|✓|✔)\]|\((?:x|X|✓|✔)\)|\bchecked\b|\byes\b|\btrue\b)/i.test(nearbyWindow);
  const nearbyUnchecked = /(?:☐|\[\s?\]|\(\s?\)|\bunchecked\b|\bno\b|\bfalse\b)/i.test(nearbyWindow);

  if (nearbyChecked && !nearbyUnchecked) return true;
  if (nearbyUnchecked && !nearbyChecked) return false;

  const widerWindow = text.match(new RegExp(`(?:${labelPattern})\\b(.{0,80})`, "i"))?.[1] ?? "";
  if (/(?:\byes\b|\btrue\b|\bpositive\b|☑|✅|☒|■|\[(?:x|X|✓|✔)\]|\((?:x|X|✓|✔)\))/i.test(widerWindow)) {
    return true;
  }
  if (/(?:\bno\b|\bfalse\b|\bnegative\b|☐|□|\[\s?\]|\(\s?\))/i.test(widerWindow)) {
    return false;
  }

  return undefined;
};

const findDateFallback = (text: string): string | undefined => {
  const match = text.match(/\b([0-3]?\d[\-\/.][01]?\d[\-\/.](?:\d{2}|\d{4})|(?:19|20)\d{2}[\-\/.][01]?\d[\-\/.][0-3]?\d)\b/);
  return match?.[1];
};

const findContactFallback = (text: string): string | undefined => {
  const email = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  if (email?.[0]) return email[0];

  const phone = text.match(/\b(?:\+?\d{1,3}[\s\-]?)?(?:\(?\d{2,4}\)?[\s\-]?)\d{3,4}[\s\-]?\d{3,4}\b/);
  return phone?.[0];
};

const parsePatientText = (rawText: string): Partial<Patient> => {
  const text = normalizeText(rawText);

  const fullName =
    sanitizeFullName(
      extractValueByLabel(text, "patient\\s*name|full\\s*name")
    ) ?? extractNameFallback(text);
  const dob = parseDate(
    extractValueByLabel(text, "date\\s*of\\s*birth|dob|birth\\s*date") ??
      extractFirstMatch(text, [
        /(?:date\s*of\s*birth|dob|birth\s*date)\s*[:\-]?\s*([0-3]?\d[\-\/.][01]?\d[\-\/.](?:\d{2}|\d{4})|(?:\d{4}[\-\/.][01]?\d[\-\/.][0-3]?\d))/i,
      ]) ??
      findDateFallback(text)
  );
  const age = parseNumber(
    extractFirstMatch(text, [
      /(?:age)\s*[:\-]?\s*(\d{1,3})(?:\s*years?)?/i,
    ])
  );
  const gender = parseGender(
    extractFirstMatch(text, [
      /(?:gender|sex)\s*[:\-]?\s*(male|female|other)/i,
    ])
  );
  const contact = cleanInlineField(
    extractValueByLabel(text, "contact(?:\\s*(?:details|number|no\\.?))?|phone(?:\\s*number)?|mobile(?:\\s*number)?|email") ??
      extractFirstMatch(text, [
        /(?:contact(?:\s*(?:details|number|no\.?))?|phone(?:\s*number)?|mobile(?:\s*number)?|email)\s*[:\-]?\s*([+()\-\d\s]{7,20}|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i,
      ]) ??
      findContactFallback(text)
  );
  const admissionDate = parseDate(
    extractFirstMatch(text, [
      /(?:admission\s*date|admitted\s*on|date\s*of\s*examination|exam(?:ination)?\s*date)\s*[:\-]?\s*([A-Za-z0-9\-\/.\s,]+)/i,
    ])
  );

  const bpMatch = text.match(/(?:blood\s*pressure|bp)\s*[:\-]?\s*(\d{2,3})\s*\/\s*(\d{2,3})/i);

  const heartRate = parseNumber(
    extractFirstMatch(text, [
      /(?:heart\s*rate|hr|pulse)\s*[:\-]?\s*(\d{2,3}(?:\.\d+)?)/i,
    ])
  );
  const systolicBP =
    parseNumber(
      extractFirstMatch(text, [
        /(?:systolic\s*bp|sbp)\s*[:\-]?\s*(\d{2,3}(?:\.\d+)?)/i,
      ])
    ) ?? (bpMatch ? Number(bpMatch[1]) : undefined);
  const diastolicBP =
    parseNumber(
      extractFirstMatch(text, [
        /(?:diastolic\s*bp|dbp)\s*[:\-]?\s*(\d{2,3}(?:\.\d+)?)/i,
      ])
    ) ?? (bpMatch ? Number(bpMatch[2]) : undefined);
  const spo2 = parseNumber(
    extractFirstMatch(text, [
      /(?:spo2|oxygen\s*saturation(?:\s*\(spo2\))?|o2\s*sat)\s*[:\-]?\s*(\d{1,3}(?:\.\d+)?)/i,
    ])
  );
  const temperature = parseNumber(
    extractFirstMatch(text, [
      /(?:body\s*temperature|temperature|temp)\s*[:\-]?\s*(\d{2,3}(?:\.\d+)?)/i,
    ])
  );
  const respRate = parseNumber(
    extractFirstMatch(text, [
      /(?:respiratory\s*rate|resp\s*rate|rr)\s*[:\-]?\s*(\d{1,3}(?:\.\d+)?)/i,
    ])
  );

  const erVisits = parseNumber(
    extractFirstMatch(text, [
      /(?:er\s*visits|emergency\s*visits)\s*[:\-]\s*(\d+)/i,
    ])
  );

  const diabetes = extractBooleanByLabel(text, "diabetes");
  const copd = extractBooleanByLabel(text, "copd");
  const cardiacDisease = extractBooleanByLabel(text, "cardiac\\s*disease|heart\\s*disease");

  const wbc = extractBooleanByLabel(text, "(?:elevated\\s*)?wbc");
  const creatinine = extractBooleanByLabel(text, "(?:high\\s*)?creatinine");
  const crp = extractBooleanByLabel(text, "(?:high\\s*)?crp");

  const notes = extractFirstMatch(text, [
    /(?:notes|clinical\s*notes|summary)\s*[:\-]?\s*(.+?)(?=\s+(?:doctor|physician|signature|end\s*of\s*report)\b|$)/i,
  ]);

  const parsed: Partial<Patient> = {};

  if (fullName) parsed.fullName = fullName;
  if (dob) parsed.dateOfBirth = dob;
  if (age !== undefined) parsed.age = Math.max(0, Math.round(age));
  if (!parsed.age && dob) parsed.age = calculateAge(dob);
  if (gender) parsed.gender = gender;
  if (contact) parsed.contact = contact;
  if (admissionDate) parsed.admissionDate = admissionDate;
  if (heartRate !== undefined) parsed.heartRate = heartRate;
  if (systolicBP !== undefined) parsed.systolicBP = systolicBP;
  if (diastolicBP !== undefined) parsed.diastolicBP = diastolicBP;
  if (spo2 !== undefined) parsed.spo2 = spo2;
  if (temperature !== undefined) parsed.temperature = temperature;
  if (respRate !== undefined) parsed.respRate = respRate;
  if (erVisits !== undefined) parsed.erVisits = Math.max(0, Math.round(erVisits));
  if (notes) parsed.notes = notes;

  if ([diabetes, copd, cardiacDisease].some((value) => value !== undefined)) {
    parsed.chronicConditions = {
      diabetes: diabetes ?? false,
      copd: copd ?? false,
      cardiacDisease: cardiacDisease ?? false,
    };
  }

  if ([wbc, creatinine, crp].some((value) => value !== undefined)) {
    parsed.labs = {
      wbc: wbc ?? false,
      creatinine: creatinine ?? false,
      crp: crp ?? false,
    };
  }

  return parsed;
};

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

  // Parse PDF in-browser and return extracted patient fields
  async parsePDF(file: File): Promise<Partial<Patient>> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDocument = await getDocument({ data: arrayBuffer }).promise;

      let fullText = "";
      for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
        const page = await pdfDocument.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");
        fullText += ` ${pageText}`;
      }

      const parsed = parsePatientText(fullText);
      if (Object.keys(parsed).length === 0) {
        throw new Error("No patient fields could be detected in this PDF.");
      }

      return parsed;
    } catch (err: unknown) {
      console.error("[parsePDF] Full error:", err);
      const message = err instanceof Error ? err.message : "Unknown PDF parsing error";
      alert(`PDF Parse Error: ${message}`);
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
