import React, { useMemo } from "react";
import { usePatients } from "../context/PatientContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../components/PatientList/PatientList.css";

const PatientPage: React.FC = () => {
  const { patients } = usePatients();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const riskFilter = searchParams.get("risk");

  const filteredPatients = useMemo(() => {
    if (!riskFilter) return patients;
    return patients.filter((p) => p.riskLevel.toLowerCase() === riskFilter.toLowerCase());
  }, [patients, riskFilter]);

  const clearFilter = () => {
    setSearchParams({});
  };

  return (
    <div className="patient-page">
      <div className="page-header">
        <h1>Patient Management {riskFilter && `- ${riskFilter.toUpperCase()} Risk`}</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate("/patients/new")}>
            + Add New Patient
          </button>
          {riskFilter && (
            <button className="btn btn-secondary" onClick={clearFilter}>
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="empty-state">
          <p>{riskFilter ? `No ${riskFilter} risk patients found.` : "No patients registered yet."}</p>
          <button className="btn btn-primary" onClick={riskFilter ? clearFilter : () => navigate("/patients/new")}>
            {riskFilter ? "Clear Filter" : "Create First Patient"}
          </button>
        </div>
      ) : (
        <div className="patient-list-wrapper">
          <table className="patient-list-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Admission Date</th>
                <th>Risk Level</th>
                <th>Risk Score</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
                )
                .map((patient) => (
                  <tr key={patient.id} className={`risk-row risk-${patient.riskLevel.toLowerCase()}`}>
                    <td className="patient-name">
                      <strong>{patient.fullName}</strong>
                    </td>
                    <td>{patient.age}</td>
                    <td>{patient.gender}</td>
                    <td>{new Date(patient.admissionDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`risk-badge risk-${patient.riskLevel.toLowerCase()}`}>
                        {patient.riskLevel}
                      </span>
                    </td>
                    <td className="risk-score">{patient.riskScore}</td>
                    <td>{new Date(patient.lastUpdated).toLocaleString()}</td>
                    <td className="actions-cell">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                      >
                        View/Edit
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientPage;

