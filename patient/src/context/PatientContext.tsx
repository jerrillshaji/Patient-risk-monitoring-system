import React, { createContext, useState, useContext, useEffect } from "react";
import type { Patient } from "../types/types";
import { calculateRisk } from "../services/riskEngine";
import { patientAPI } from "../services/api";
import { v4 as uuidv4 } from "uuid";

const PATIENTS_STORAGE_KEY = "patients";

interface PatientContextType {
  patients: Patient[];
  addPatient: (p: Omit<Patient, "id" | "riskScore" | "riskLevel" | "lastUpdated" | "history">) => Promise<Patient>;
  updatePatient: (id: string, updated: Partial<Patient>) => Promise<Patient>;
  deletePatient: (id: string) => Promise<void>;
  getPatient: (id: string) => Patient | undefined;
  fetchPatientById: (id: string) => Promise<Patient | null>;
  getDashboardMetrics: () => {
    totalPatients: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    recentAdmissionsCount: number;
  };
  loading: boolean;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(() => {
    // Load patients from localStorage as initial cache
    console.log("[useState init] Loading patients from localStorage cache");
    try {
      const stored = localStorage.getItem(PATIENTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("[useState init] Loaded cached patients:", Array.isArray(parsed) ? parsed.length : "not array");
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error("[useState init] Error loading from localStorage:", error);
    }
    return [];
  });

  const [loading, setLoading] = useState(true);

  // Load patients from API on component mount
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        const data = await patientAPI.getPatients();
        console.log("[useEffect loadPatients] API returned", data.length, "patients");
        setPatients(data);
        localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("[useEffect loadPatients] Error loading from API:", error);
        // Fallback to localStorage cache remains in place (no action needed)
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  // Save patients to localStorage whenever they change
  useEffect(() => {
    console.log("[useEffect Save] Caching patients to localStorage. Count:", patients.length);
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
  }, [patients]);

  const addPatient = async (
    p: Omit<Patient, "id" | "riskScore" | "riskLevel" | "lastUpdated" | "history">
  ): Promise<Patient> => {
    console.log("[addPatient] Input patient data:", p);
    try {
      // Create local patient object for initial state
      const localPatient: Patient = {
        ...p,
        id: uuidv4(),
        lastUpdated: new Date().toISOString(),
        history: [],
        riskScore: 0,
        riskLevel: "LOW",
      };

      const risk = calculateRisk(localPatient);
      const newPatient: Patient = {
        ...localPatient,
        riskScore: risk.score,
        riskLevel: risk.level,
      };

      console.log("[addPatient] Sending to API:", newPatient);
      // Call API to create patient (API will handle Supabase storage)
      const apiResponse = await patientAPI.createPatient(newPatient);
      console.log("[addPatient] API response:", apiResponse);

      // Update local state with API response
      setPatients((prev) => [...prev, apiResponse]);
      return apiResponse;
    } catch (error) {
      console.error("[addPatient] Error:", error);
      throw error;
    }
  };

  const updatePatient = async (id: string, updated: Partial<Patient>): Promise<Patient> => {
    console.log("[updatePatient] Updating patient", id, "with:", updated);
    try {
      const oldPatient = patients.find((p) => String(p.id) === String(id));
      if (!oldPatient) {
        throw new Error("Patient not found");
      }

      // Create updated patient object
      const updatedPatient: Patient = {
        ...oldPatient,
        ...updated,
        lastUpdated: new Date().toISOString(),
      };

      // Recalculate risk
      const risk = calculateRisk(updatedPatient);
      updatedPatient.riskScore = risk.score;
      updatedPatient.riskLevel = risk.level;

      console.log("[updatePatient] Sending to API:", updatedPatient);
      // Call API to update patient
      const apiResponse = await patientAPI.updatePatient(id, updatedPatient);
      console.log("[updatePatient] API response:", apiResponse);

      // Update local state
      setPatients((prev) =>
        prev.map((p) => (String(p.id) === String(id) ? apiResponse : p))
      );
      return apiResponse;
    } catch (error) {
      console.error("[updatePatient] Error:", error);
      throw error;
    }
  };

  const deletePatient = async (id: string): Promise<void> => {
    console.log("[deletePatient] Deleting patient", id);
    try {
      // Call API to delete patient
      await patientAPI.deletePatient(id);
      console.log("[deletePatient] API delete successful");

      // Update local state
      setPatients((prev) => prev.filter((p) => String(p.id) !== String(id)));
    } catch (error) {
      console.error("[deletePatient] Error:", error);
      throw error;
    }
  };

  const getPatient = (id: string): Patient | undefined => {
    return patients.find((p) => String(p.id) === String(id));
  };

  const fetchPatientById = async (id: string): Promise<Patient | null> => {
    try {
      const patient = await patientAPI.getPatient(id);
      // Update local state with the fetched patient
      setPatients((prev) => {
        const exists = prev.find((p) => String(p.id) === String(id));
        if (exists) {
          return prev.map((p) => (String(p.id) === String(id) ? patient : p));
        }
        return [...prev, patient];
      });
      return patient;
    } catch (error) {
      console.error(`[fetchPatientById] Error fetching patient ${id}:`, error);
      return null;
    }
  };

  const getDashboardMetrics = () => {
    console.log("[getDashboardMetrics] Called with", patients.length, "patients");
    const highRiskCount = patients.filter((p) => p.riskLevel === "HIGH").length;
    const mediumRiskCount = patients.filter((p) => p.riskLevel === "MEDIUM").length;
    const lowRiskCount = patients.filter((p) => p.riskLevel === "LOW").length;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentAdmissionsCount = patients.filter(
      (p) => new Date(p.admissionDate) >= thirtyDaysAgo
    ).length;

    return {
      totalPatients: patients.length,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      recentAdmissionsCount,
    };
  };

  return (
    <PatientContext.Provider
      value={{ patients, addPatient, updatePatient, deletePatient, getPatient, fetchPatientById, getDashboardMetrics, loading }}
    >
      {children}
    </PatientContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePatients = () => {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("usePatients must be inside PatientProvider");
  return ctx;
};
