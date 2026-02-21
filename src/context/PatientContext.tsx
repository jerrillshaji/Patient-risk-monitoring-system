import React, { createContext, useState, useContext, useEffect } from "react";
import type { Patient } from "../types/types";
import { calculateRisk } from "../services/riskEngine";
import { patientAPI } from "../services/api";

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
  refreshPatients: () => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Load patients from Supabase on component mount
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        console.log("[useEffect loadPatients] Loading from Supabase...");
        const data = await patientAPI.getPatients();
        console.log("[useEffect loadPatients] Supabase returned", data.length, "patients");
        setPatients(data);
        localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("[useEffect loadPatients] Error loading from Supabase:", error);
        // Fallback to localStorage cache
        try {
          const stored = localStorage.getItem(PATIENTS_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            setPatients(Array.isArray(parsed) ? parsed : []);
          }
        } catch (fallbackError) {
          console.error("[useEffect loadPatients] Fallback also failed:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  // Save patients to localStorage whenever they change (local cache)
  useEffect(() => {
    if (patients.length > 0) {
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
    }
  }, [patients]);

  const refreshPatients = async () => {
    try {
      const data = await patientAPI.getPatients();
      setPatients(data);
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("[refreshPatients] Error:", error);
    }
  };

  const addPatient = async (
    p: Omit<Patient, "id" | "riskScore" | "riskLevel" | "lastUpdated" | "history">
  ): Promise<Patient> => {
    try {
      // Calculate risk score before sending to Supabase
      const tempPatient: Patient = {
        ...p,
        id: 0, // Temporary ID, will be replaced by Supabase
        lastUpdated: new Date().toISOString(),
        history: [],
        riskScore: 0,
        riskLevel: "LOW",
      };

      const risk = calculateRisk(tempPatient);
      
      const patientToCreate = {
        ...p,
        riskScore: risk.score,
        riskLevel: risk.level,
      };

      console.log("[addPatient] Creating patient in Supabase:", patientToCreate);
      const apiResponse = await patientAPI.createPatient(patientToCreate);
      console.log("[addPatient] Created patient with ID:", apiResponse.id);

      // Update local state with Supabase response
      setPatients((prev) => [...prev, apiResponse]);
      return apiResponse;
    } catch (error) {
      console.error("[addPatient] Error:", error);
      throw error;
    }
  };

  const updatePatient = async (id: string, updated: Partial<Patient>): Promise<Patient> => {
    try {
      const oldPatient = patients.find((p) => String(p.id) === String(id));
      if (!oldPatient) {
        throw new Error("Patient not found");
      }

      // Calculate new risk score
      const updatedPatient: Patient = {
        ...oldPatient,
        ...updated,
        lastUpdated: new Date().toISOString(),
      };

      const risk = calculateRisk(updatedPatient);
      const patientToUpdate = {
        ...updated,
        riskScore: risk.score,
        riskLevel: risk.level,
      };

      console.log("[updatePatient] Updating patient in Supabase:", patientToUpdate);
      const apiResponse = await patientAPI.updatePatient(id, patientToUpdate);
      console.log("[updatePatient] Updated patient:", apiResponse.id);

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
    try {
      console.log("[deletePatient] Deleting patient from Supabase:", id);
      await patientAPI.deletePatient(id);
      console.log("[deletePatient] Deleted successfully");

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
      value={{ 
        patients, 
        addPatient, 
        updatePatient, 
        deletePatient, 
        getPatient, 
        fetchPatientById, 
        getDashboardMetrics, 
        loading,
        refreshPatients,
      }}
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
