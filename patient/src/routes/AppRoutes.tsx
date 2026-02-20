import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import PatientPage from "../pages/PatientPage";
import PatientEditPage from "../pages/PatientEditPage";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/patients" element={<PatientPage />} />
      <Route path="/patients/new" element={<PatientEditPage />} />
      <Route path="/patients/:id" element={<PatientEditPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
