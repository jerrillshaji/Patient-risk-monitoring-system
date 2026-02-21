import type { Patient, RiskCalculationResult, RiskLevel } from "../types/types";

/**
 * Risk Calculation Engine
 * Implements deterministic scoring based on clinical parameters
 */

/**
 * Calculate demographics score
 */
function calculateDemographicsScore(age: number): number {
  let score = 0;
  if (age > 75) {
    score += 2;
  } else if (age >= 60 && age <= 75) {
    score += 1;
  }
  return score;
}

/**
 * Calculate vitals score
 */
function calculateVitalsScore(
  heartRate: number,
  systolicBP: number,
  spo2: number,
  temperature: number,
  respRate: number
): number {
  let score = 0;

  // Heart Rate
  if (heartRate > 120) {
    score += 2;
  } else if (heartRate >= 100 && heartRate <= 120) {
    score += 1;
  }

  // Systolic BP
  if (systolicBP < 90) {
    score += 2;
  }

  // Oxygen Saturation
  if (spo2 < 90) {
    score += 2;
  } else if (spo2 >= 90 && spo2 <= 93) {
    score += 1;
  }

  // Temperature
  if (temperature > 39) {
    score += 2;
  } else if (temperature >= 38 && temperature <= 39) {
    score += 1;
  }

  // Respiratory Rate
  if (respRate > 24) {
    score += 1;
  }

  return score;
}

/**
 * Calculate clinical history score
 */
function calculateHistoryScore(
  chronicConditions: { diabetes: boolean; copd: boolean; cardiacDisease: boolean },
  erVisits: number
): number {
  let score = 0;

  // Chronic Conditions (1 point per condition)
  if (chronicConditions.diabetes) score += 1;
  if (chronicConditions.copd) score += 1;
  if (chronicConditions.cardiacDisease) score += 1;

  // ER Visits
  if (erVisits > 3) {
    score += 2;
  } else if (erVisits >= 2 && erVisits <= 3) {
    score += 1;
  }

  return score;
}

/**
 * Calculate lab indicators score
 */
function calculateLabsScore(labs: { wbc: boolean; creatinine: boolean; crp: boolean }): number {
  let score = 0;

  // 1 point per elevated indicator
  if (labs.wbc) score += 1;
  if (labs.creatinine) score += 1;
  if (labs.crp) score += 1;

  return score;
}

/**
 * Check for critical escalation criteria
 * These override the calculated score
 */
function checkCriticalEscalation(
  spo2: number,
  systolicBP: number,
  heartRate: number
): boolean {
  // SpO2 < 85%
  if (spo2 < 85) return true;
  // Systolic BP < 80 mmHg
  if (systolicBP < 80) return true;
  // Heart Rate > 140 bpm
  if (heartRate > 140) return true;

  return false;
}

/**
 * Convert score to risk level
 */
function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 6) {
    return "HIGH";
  } else if (score >= 3) {
    return "MEDIUM";
  }
  return "LOW";
}

/**
 * Main risk calculation function
 */
export function calculateRisk(patient: Patient): RiskCalculationResult {
  // Calculate component scores
  const demographicsScore = calculateDemographicsScore(patient.age);
  const vitalsScore = calculateVitalsScore(
    patient.heartRate,
    patient.systolicBP,
    patient.spo2,
    patient.temperature,
    patient.respRate
  );
  const historyScore = calculateHistoryScore(patient.chronicConditions, patient.erVisits);
  const labsScore = calculateLabsScore(patient.labs);

  // Total score
  const totalScore = demographicsScore + vitalsScore + historyScore + labsScore;

  // Check for critical escalation
  const isCritical = checkCriticalEscalation(patient.spo2, patient.systolicBP, patient.heartRate);

  // Determine risk level
  let riskLevel: RiskLevel;
  if (isCritical) {
    riskLevel = "HIGH";
  } else {
    riskLevel = scoreToRiskLevel(totalScore);
  }

  return {
    score: isCritical ? Math.max(totalScore, 6) : totalScore,
    level: riskLevel,
    breakdown: {
      demographics: demographicsScore,
      vitals: vitalsScore,
      history: historyScore,
      labs: labsScore,
    },
    criticalEscalation: isCritical,
  };
}

/**
 * Get risk score details for display
 */
export function getRiskScoreDetails(patient: Patient): string {
  const result = calculateRisk(patient);
  const parts = [];

  if (result.breakdown.demographics > 0) {
    parts.push(`Age (+${result.breakdown.demographics})`);
  }
  if (result.breakdown.vitals > 0) {
    parts.push(`Vitals (+${result.breakdown.vitals})`);
  }
  if (result.breakdown.history > 0) {
    parts.push(`History (+${result.breakdown.history})`);
  }
  if (result.breakdown.labs > 0) {
    parts.push(`Labs (+${result.breakdown.labs})`);
  }
  if (result.criticalEscalation) {
    parts.push("CRITICAL ESCALATION");
  }

  return parts.join(" | ");
}
