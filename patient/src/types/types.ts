export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type Gender = "Male" | "Female" | "Other";

export interface Patient {
  id: number | string;
  // Demographics
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: Gender;
  contact: string;
  admissionDate: string;

  // Vitals
  heartRate: number;
  systolicBP: number;
  diastolicBP: number;
  spo2: number;
  temperature: number;
  respRate: number;

  // Medical History
  chronicConditions: {
    diabetes: boolean;
    copd: boolean;
    cardiacDisease: boolean;
  };
  erVisits: number; // Last 30 days

  // Lab Indicators
  labs: {
    wbc: boolean;
    creatinine: boolean;
    crp: boolean;
  };

  // Additional
  notes: string;

  // Risk Assessment (calculated)
  riskScore: number;
  riskLevel: RiskLevel;
  lastUpdated: string;

  // Audit History
  history: AuditLog[];
}

export interface AuditLog {
  id: number | string;
  timestamp: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  riskScoreBefore?: number;
  riskLevelBefore?: RiskLevel;
  riskScoreAfter?: number;
  riskLevelAfter?: RiskLevel;
}

export interface RiskCalculationResult {
  score: number;
  level: RiskLevel;
  breakdown: {
    demographics: number;
    vitals: number;
    history: number;
    labs: number;
  };
  criticalEscalation: boolean;
}

export interface DashboardMetrics {
  totalPatients: number;
  highRiskPatients: number;
  mediumRiskPatients: number;
  lowRiskPatients: number;
  recentAdmissions: number;
}
