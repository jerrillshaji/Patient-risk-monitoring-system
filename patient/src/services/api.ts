import axios from "axios";
import type { Patient } from "../types/types";

/**
 * API Service Layer
 * Communicates with the Express backend (MySQL backend storage)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // Do not set a global Content-Type here — allow axios/browser to set
  // appropriate headers per-request (important for multipart/form-data)
  headers: {},
});

export const patientAPI = {
  // Get all patients
  async getPatients(): Promise<Patient[]> {
    try {
      const response = await apiClient.get("/patients");
      return response.data || [];
    } catch (err) {
      console.error("Error fetching patients:", err);
      // Fallback to localStorage if backend unavailable
      return this.getPatientsFromCache();
    }
  },

  // Get single patient by ID
  async getPatient(id: string): Promise<Patient> {
    try {
      const response = await apiClient.get(`/patients/${id}`);
      return response.data;
    } catch (err) {
      console.error(`Error fetching patient ${id}:`, err);
      throw err;
    }
  },

  // Create new patient
  async createPatient(patient: Omit<Patient, "id" | "riskScore" | "riskLevel" | "lastUpdated" | "history">): Promise<Patient> {
    try {
      const response = await apiClient.post("/patients", patient);
      return response.data;
    } catch (err) {
      console.error("Error creating patient:", err);
      throw err;
    }
  },

  // Update patient
  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    try {
      const response = await apiClient.put(`/patients/${id}`, updates);
      return response.data;
    } catch (err) {
      console.error(`Error updating patient ${id}:`, err);
      throw err;
    }
  },

  // Delete patient
  async deletePatient(id: string): Promise<void> {
    try {
      await apiClient.delete(`/patients/${id}`);
    } catch (err) {
      console.error(`Error deleting patient ${id}:`, err);
      throw err;
    }
  },

  // Get audit logs for patient
  async getAuditLogs(id: string) {
    try {
      const response = await apiClient.get(`/patients/audit/${id}`);
      return response.data || [];
    } catch (err) {
      console.error(`Error fetching audit logs for patient ${id}:`, err);
      return [];
    }
  },

  // Parse PDF (placeholder)
  async parsePDF(file: File): Promise<Partial<Patient>> {
    try {
      console.log('[parsePDF] Starting PDF upload. File:', file.name, 'Size:', file.size, 'Type:', file.type);
      const formData = new FormData();
      formData.append("pdf", file);
      console.log('[parsePDF] Sending to API...');
      // Let the browser/axios set the Content-Type (including boundary)
      const response = await apiClient.post("/patients/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('[parsePDF] Response:', response.data);
      return response.data;
    } catch (err: any) {
      console.error("[parsePDF] Full error:", err);
      console.error("[parsePDF] Error response data (stringified):", JSON.stringify(err.response?.data, null, 2));
      console.error("[parsePDF] Error status:", err.response?.status);
      console.error("[parsePDF] Error message:", err.response?.data?.error || err.response?.data?.message || err.message);
      alert(`PDF Upload Error: ${err.response?.data?.error || err.response?.data?.message || err.message}\n\nCheck console for details`);
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
