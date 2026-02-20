/**
 * Risk Engine Service
 * Calculates patient risk score based on vital signs, medical history, and lab results
 */

module.exports.calculateRisk = (patient) => {
  let score = 0;

  // Age scoring
  const age = parseInt(patient.age) || 0;
  if (age >= 60 && age <= 75) score += 1;
  if (age > 75) score += 2;

  // Heart Rate scoring
  const heartRate = parseInt(patient.heartRate) || 0;
  if (heartRate > 100 && heartRate <= 120) score += 1;
  if (heartRate > 120) score += 2;

  // Blood Pressure scoring (Systolic)
  const systolicBP = parseInt(patient.systolicBP) || 0;
  if (systolicBP < 90) score += 2;

  // SpO2 scoring
  const spo2 = parseInt(patient.spo2) || 0;
  if (spo2 < 90) score += 2;
  else if (spo2 <= 93) score += 1;

  // Temperature scoring
  const temperature = parseFloat(patient.temperature) || 0;
  if (temperature > 38 && temperature <= 39) score += 1;
  if (temperature > 39) score += 2;

  // Respiratory Rate scoring
  const respRate = parseInt(patient.respRate) || 0;
  if (respRate > 24) score += 1;

  // Chronic conditions scoring (diabetes, COPD, cardiac disease)
  const chronicConditions = patient.chronicConditions || {};
  if (chronicConditions.diabetes) score += 1;
  if (chronicConditions.copd) score += 1;
  if (chronicConditions.cardiacDisease) score += 1;

  // ER Visits scoring
  const erVisits = parseInt(patient.erVisits) || 0;
  if (erVisits >= 2 && erVisits <= 3) score += 1;
  if (erVisits > 3) score += 2;

  // Lab results scoring
  const labs = patient.labs || {};
  if (labs.wbc) score += 1;
  if (labs.creatinine) score += 1;
  if (labs.crp) score += 1;

  // Critical condition overrides
  if (spo2 < 85 || systolicBP < 80 || heartRate > 140) {
    return { score, level: 'HIGH' };
  }

  // Determine risk level based on total score
  if (score <= 2) return { score, level: 'LOW' };
  if (score <= 5) return { score, level: 'MEDIUM' };
  return { score, level: 'HIGH' };
};
