import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePatients } from "../context/PatientContext";
import type { Patient, Gender, RiskCalculationResult } from "../types/types";
import { calculateRisk, getRiskScoreDetails } from "../services/riskEngine";
import { formatDateForInput } from "../utils/dateUtils";
import { patientAPI } from "../services/api";
import type { AuditLog as AuditLogType } from "../types/types";
import PatientDetails from "../components/PatientDetails/PatientDetails";
import AuditLog from "../components/AuditLog/AuditLog";
import "../components/PatientDetails/PatientDetails.css";

const PatientEditPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { addPatient, updatePatient, deletePatient, fetchPatientById } = usePatients();

  const isNewPatient = !id || id === "new";

  // Default empty patient form
  const defaultFormData: Partial<Patient> = {
    fullName: "",
    dateOfBirth: "",
    age: 0,
    gender: "Male" as Gender,
    contact: "",
    admissionDate: new Date().toISOString().split("T")[0],
    heartRate: 0,
    systolicBP: 0,
    diastolicBP: 0,
    spo2: 100,
    temperature: 36.5,
    respRate: 0,
    chronicConditions: {
      diabetes: false,
      copd: false,
      cardiacDisease: false,
    },
    erVisits: 0,
    labs: {
      wbc: false,
      creatinine: false,
      crp: false,
    },
    notes: "",
  };

  const [activeTab, setActiveTab] = useState<"details" | "audit">("details");
  const [formData, setFormData] = useState<Partial<Patient>>(defaultFormData);
  const [riskResult, setRiskResult] = useState<RiskCalculationResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [auditHistory, setAuditHistory] = useState<AuditLogType[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Fetch patient data from API when loading an existing patient
  useEffect(() => {
    const loadPatient = async () => {
      if (isNewPatient) {
        setFormData(defaultFormData);
        setRiskResult(null);
        setIsLoading(false);
      } else if (id) {
        setIsLoading(true);
        try {
          const patient = await fetchPatientById(id);
          if (patient) {
            const formattedPatient = {
              ...patient,
              dateOfBirth: formatDateForInput(patient.dateOfBirth),
              admissionDate: formatDateForInput(patient.admissionDate),
            };
            setFormData(formattedPatient);
            setRiskResult(calculateRisk(patient));
            // Load audit history for this patient
            try {
              const logs = await patientAPI.getAuditLogs(String(id));
              setAuditHistory(Array.isArray(logs) ? logs : []);
            } catch (err) {
              console.error("[PatientEditPage] Error loading audit logs:", err);
              setAuditHistory([]);
            }
          }
        } catch (error) {
          console.error("[PatientEditPage] Error loading patient:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPatient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNewPatient]);

  // Handle input change and recalculate risk
  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Recalculate risk only when all required vitals are filled and valid
      const hasValidVitals =
        updated.heartRate! > 0 &&
        updated.systolicBP! > 0 &&
        updated.spo2! > 0 &&
        updated.temperature! > 0 &&
        updated.respRate! > 0;

      if (hasValidVitals && updated.fullName) {
        const fullPatient = {
          ...updated,
          id: updated.id || "temp",
        } as Patient;
        const risk = calculateRisk(fullPatient);
        setRiskResult(risk);
      } else if (!hasValidVitals) {
        // Clear risk result if vitals are incomplete
        setRiskResult(null);
      }

      return updated;
    });

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleNestedChange = (parent: string, child: string, value: string | number | boolean) => {
    setFormData((prev) => {
      const parentObj = (prev[parent as keyof typeof prev] as Record<string, string | number | boolean>) || {};
      const updated = {
        ...prev,
        [parent]: {
          ...parentObj,
          [child]: value,
        },
      };

      // Recalculate risk only when all required vitals are filled and valid
      const hasValidVitals =
        updated.heartRate! > 0 &&
        updated.systolicBP! > 0 &&
        updated.spo2! > 0 &&
        updated.temperature! > 0 &&
        updated.respRate! > 0;

      if (hasValidVitals && updated.fullName) {
        const fullPatient = {
          ...updated,
          id: updated.id || "temp",
        } as Patient;
        const risk = calculateRisk(fullPatient);
        setRiskResult(risk);
      } else if (!hasValidVitals) {
        // Clear risk result if vitals are incomplete
        setRiskResult(null);
      }

      return updated;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName?.trim()) newErrors.fullName = "Full name is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.contact?.trim()) newErrors.contact = "Contact is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    console.log("[handleSave] Starting save. isNewPatient:", isNewPatient);
    console.log("[handleSave] formData:", formData);

    if (!validateForm()) {
      console.warn("[handleSave] Form validation failed");
      alert("Please fill in all required fields");
      return;
    }

    try {
      if (isNewPatient) {
        console.log("[handleSave] Creating new patient with data:", formData);
        // Extract only the fields needed for addPatient, filtering out undefined values
        const patientInput: Omit<Patient, "id" | "riskScore" | "riskLevel" | "lastUpdated" | "history"> = {
          fullName: formData.fullName || "",
          dateOfBirth: formData.dateOfBirth || "",
          age: formData.age || 0,
          gender: formData.gender || "Male",
          contact: formData.contact || "",
          admissionDate: formData.admissionDate || "",
          heartRate: formData.heartRate || 0,
          systolicBP: formData.systolicBP || 0,
          diastolicBP: formData.diastolicBP || 0,
          spo2: formData.spo2 || 100,
          temperature: formData.temperature || 36.5,
          respRate: formData.respRate || 0,
          chronicConditions: formData.chronicConditions || { diabetes: false, copd: false, cardiacDisease: false },
          erVisits: formData.erVisits || 0,
          labs: formData.labs || { wbc: false, creatinine: false, crp: false },
          notes: formData.notes || "",
        };
        console.log("[handleSave] Prepared patient input:", patientInput);
        console.log("[handleSave] Calling addPatient...");
        await addPatient(patientInput);
        console.log("[handleSave] addPatient completed, navigating...");
        navigate("/patients");
      } else {
        // For update, use the id from the URL params and formData
        console.log("[handleSave] Updating patient:", id);
        console.log("[handleSave] formData:", formData);
        await updatePatient(id!, formData as Partial<Patient>);
        navigate("/patients");
      }
    } catch (error) {
      console.error("[handleSave] Error saving patient:", error);
      alert("Error saving patient: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this patient?")) {
      try {
        await deletePatient(id!);
        navigate("/patients");
      } catch (error) {
        console.error("[handleDelete] Error deleting patient:", error);
        alert("Error deleting patient: " + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  return (
    <div className="patient-edit-page">
      {isLoading ? (
        <div className="loading-state">
          <div className="loading-spinner">
            <p>Loading patient data...</p>
          </div>
        </div>
      ) : (
        <>
      <div className="page-header">
        <h1>{isNewPatient ? "Add New Patient" : `Edit Patient: ${formData?.fullName}`}</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate("/patients")}>
            ← Back to List
          </button>
        </div>
      </div>

      {/* Risk Alert */}
      {riskResult && (
        <div className={`risk-alert alert-${riskResult.level.toLowerCase()}`}>
          <h3>Current Risk Assessment</h3>
          <p>
            <strong>Risk Level:</strong> {riskResult.level} (Score: {riskResult.score})
          </p>
          {riskResult.criticalEscalation && (
            <p className="critical-warning">⚠️ CRITICAL ESCALATION - Immediate attention required!</p>
          )}
          <p className="risk-details">{getRiskScoreDetails(formData as Patient)}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Patient Details
        </button>
        {!isNewPatient && (
          <button
            className={`tab ${activeTab === "audit" ? "active" : ""}`}
            onClick={() => setActiveTab("audit")}
          >
            Audit History
          </button>
        )}
      </div>

      {/* Details Tab */}
      {activeTab === "details" && formData && (
        <div className="form-section">
          <PatientDetails
            patient={formData as Patient}
            onInputChange={handleInputChange}
            onNestedChange={handleNestedChange}
            errors={errors}
          />

          {/* Form Actions */}
          <div className="form-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  setIsLoading(true);
                  const extracted = await patientAPI.parsePDF(f);
                  console.log("[handlePdfUpload] Extracted data:", extracted);

                  // Map returned values safely into formData and recalculate risk
                  setFormData((prev) => {
                    const merged = { ...prev } as any;
                    if (extracted.fullName) merged.fullName = extracted.fullName;
                    if (extracted.dateOfBirth) merged.dateOfBirth = formatDateForInput(extracted.dateOfBirth);
                    if (extracted.age != null) merged.age = Number(extracted.age);
                    if (extracted.gender) merged.gender = extracted.gender;
                    if (extracted.contact) merged.contact = extracted.contact;
                    if (extracted.admissionDate) merged.admissionDate = formatDateForInput(extracted.admissionDate);
                    if (extracted.heartRate != null) merged.heartRate = Number(extracted.heartRate);
                    if (extracted.systolicBP != null) merged.systolicBP = Number(extracted.systolicBP);
                    if (extracted.diastolicBP != null) merged.diastolicBP = Number(extracted.diastolicBP);
                    if (extracted.spo2 != null) merged.spo2 = Number(extracted.spo2);
                    if (extracted.temperature != null) merged.temperature = Number(extracted.temperature);
                    if (extracted.respRate != null) merged.respRate = Number(extracted.respRate);
                    if (extracted.notes) merged.notes = extracted.notes;

                    try {
                      const fullPatient = merged as Patient;
                      setRiskResult(calculateRisk(fullPatient));
                    } catch (e) {
                      // ignore risk calc errors
                    }

                    return merged;
                  });
                } catch (err) {
                  console.error("[handlePdfUpload] Error:", err);
                  alert("Failed to parse PDF: " + (err instanceof Error ? err.message : String(err)));
                } finally {
                  setIsLoading(false);
                  // clear file input
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }
              }}
            />
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload PDF
            </button>

            <button className="btn btn-primary" onClick={handleSave}>
              {isNewPatient ? "Create Patient" : "Update Patient"}
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/patients")}>
              Cancel
            </button>
            {!isNewPatient && (
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete Patient
              </button>
            )}
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === "audit" && !isNewPatient && formData && (
        <div className="audit-section">
          <AuditLog history={auditHistory} />
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default PatientEditPage;

