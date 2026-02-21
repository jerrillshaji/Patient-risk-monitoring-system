import React from "react";
import type { Patient, Gender } from "../../types/types";
import { formatDateForInput, calculateAge } from "../../utils/dateUtils";
import "./PatientDetails.css";

interface PatientDetailsProps {
  patient: Partial<Patient>;
  onInputChange: (field: string, value: string | number | boolean) => void;
  onNestedChange: (parent: string, child: string, value: string | number | boolean) => void;
  errors: Record<string, string>;
}

const PatientDetails: React.FC<PatientDetailsProps> = ({
  patient,
  onInputChange,
  onNestedChange,
  errors,
}) => {
  const handleDOBChange = (value: string) => {
    // Store the date in YYYY-MM-DD format
    onInputChange("dateOfBirth", value);
    // Calculate age from the input date
    const age = calculateAge(value);
    onInputChange("age", age);
  };

  return (
    <div className="patient-details-form">
      {/* Demographics Section */}
      <section className="form-section">
        <h2>Demographics</h2>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              type="text"
              value={patient.fullName || ""}
              onChange={(e) => onInputChange("fullName", e.target.value)}
              className={`form-input ${errors.fullName ? "error" : ""}`}
              placeholder="Enter full name"
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth *</label>
            <input
              id="dateOfBirth"
              type="date"
              value={formatDateForInput(patient.dateOfBirth)}
              onChange={(e) => handleDOBChange(e.target.value)}
              className={`form-input ${errors.dateOfBirth ? "error" : ""}`}
            />
            {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              id="age"
              type="number"
              value={patient.age || 0}
              onChange={(e) => onInputChange("age", parseInt(e.target.value))}
              className={`form-input ${errors.age ? "error" : ""}`}
              disabled
            />
            {errors.age && <span className="error-message">{errors.age}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              value={patient.gender || "Male"}
              onChange={(e) => onInputChange("gender", e.target.value as Gender)}
              className="form-input"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="contact">Contact Details *</label>
            <input
              id="contact"
              type="text"
              value={patient.contact || ""}
              onChange={(e) => onInputChange("contact", e.target.value)}
              className={`form-input ${errors.contact ? "error" : ""}`}
              placeholder="Phone/Email"
            />
            {errors.contact && <span className="error-message">{errors.contact}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="admissionDate">Admission Date</label>
            <input
              id="admissionDate"
              type="date"
              value={patient.admissionDate?.split("T")[0] || ""}
              onChange={(e) => onInputChange("admissionDate", e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </section>

      {/* Vitals Section */}
      <section className="form-section">
        <h2>Clinical Vitals</h2>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="heartRate">
              Heart Rate (bpm) *
              <span className="range-hint">{patient.heartRate || 0} bpm</span>
            </label>
            <input
              id="heartRate"
              type="number"
              value={patient.heartRate || 0}
              onChange={(e) => onInputChange("heartRate", parseInt(e.target.value))}
              className={`form-input ${errors.heartRate ? "error" : ""}`}
              placeholder="60-100"
            />
            {errors.heartRate && <span className="error-message">{errors.heartRate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="systolicBP">
              Systolic BP (mmHg) *
              <span className="range-hint">{patient.systolicBP || 0} mmHg</span>
            </label>
            <input
              id="systolicBP"
              type="number"
              value={patient.systolicBP || 0}
              onChange={(e) => onInputChange("systolicBP", parseInt(e.target.value))}
              className={`form-input ${errors.systolicBP ? "error" : ""}`}
              placeholder="120"
            />
            {errors.systolicBP && <span className="error-message">{errors.systolicBP}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="diastolicBP">Diastolic BP (mmHg)</label>
            <input
              id="diastolicBP"
              type="number"
              value={patient.diastolicBP || 0}
              onChange={(e) => onInputChange("diastolicBP", parseInt(e.target.value))}
              className="form-input"
              placeholder="80"
            />
          </div>

          <div className="form-group">
            <label htmlFor="spo2">
              Oxygen Saturation (%) *
              <span className="range-hint">{patient.spo2 || 100}%</span>
            </label>
            <input
              id="spo2"
              type="number"
              min="0"
              max="100"
              value={patient.spo2 || 100}
              onChange={(e) => onInputChange("spo2", parseInt(e.target.value))}
              className={`form-input ${errors.spo2 ? "error" : ""}`}
              placeholder="95-100"
            />
            {errors.spo2 && <span className="error-message">{errors.spo2}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="temperature">
              Temperature (°C) *
              <span className="range-hint">{patient.temperature || 36.5}°C</span>
            </label>
            <input
              id="temperature"
              type="number"
              step="0.1"
              value={patient.temperature || 36.5}
              onChange={(e) => onInputChange("temperature", parseFloat(e.target.value))}
              className={`form-input ${errors.temperature ? "error" : ""}`}
              placeholder="37"
            />
            {errors.temperature && <span className="error-message">{errors.temperature}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="respRate">
              Respiratory Rate (/min) *
              <span className="range-hint">{patient.respRate || 0}/min</span>
            </label>
            <input
              id="respRate"
              type="number"
              value={patient.respRate || 0}
              onChange={(e) => onInputChange("respRate", parseInt(e.target.value))}
              className={`form-input ${errors.respRate ? "error" : ""}`}
              placeholder="12-20"
            />
            {errors.respRate && <span className="error-message">{errors.respRate}</span>}
          </div>
        </div>
      </section>

      {/* Medical History Section */}
      <section className="form-section">
        <h2>Medical History</h2>
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={patient.chronicConditions?.diabetes || false}
              onChange={(e) =>
                onNestedChange("chronicConditions", "diabetes", e.target.checked)
              }
            />
            Diabetes
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={patient.chronicConditions?.copd || false}
              onChange={(e) =>
                onNestedChange("chronicConditions", "copd", e.target.checked)
              }
            />
            COPD
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={patient.chronicConditions?.cardiacDisease || false}
              onChange={(e) =>
                onNestedChange("chronicConditions", "cardiacDisease", e.target.checked)
              }
            />
            Cardiac Disease
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="erVisits">ER Visits (Last 30 days)</label>
          <input
            id="erVisits"
            type="number"
            min="0"
            value={patient.erVisits || 0}
            onChange={(e) => onInputChange("erVisits", parseInt(e.target.value))}
            className="form-input"
            placeholder="0"
          />
        </div>
      </section>

      {/* Lab Indicators Section */}
      <section className="form-section">
        <h2>Lab Indicators</h2>
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={patient.labs?.wbc || false}
              onChange={(e) => onNestedChange("labs", "wbc", e.target.checked)}
            />
            Elevated WBC
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={patient.labs?.creatinine || false}
              onChange={(e) => onNestedChange("labs", "creatinine", e.target.checked)}
            />
            High Creatinine
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={patient.labs?.crp || false}
              onChange={(e) => onNestedChange("labs", "crp", e.target.checked)}
            />
            High CRP
          </label>
        </div>
      </section>

      {/* Notes Section */}
      <section className="form-section">
        <h2>Clinical Notes</h2>
        <div className="form-group">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            value={patient.notes || ""}
            onChange={(e) => onInputChange("notes", e.target.value)}
            className="form-input textarea"
            rows={5}
            placeholder="Enter any additional clinical observations..."
          />
        </div>
      </section>
    </div>
  );
};

export default PatientDetails;
