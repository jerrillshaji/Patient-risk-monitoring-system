import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePatients } from "../context/PatientContext";
import "../components/Dashboard/Dashboard.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { patients, getDashboardMetrics } = usePatients();
  const metrics = getDashboardMetrics();

  // Prepare chart data
  const riskDistribution = useMemo(() => {
    return [
      { name: "Low", value: metrics.lowRiskCount, color: "#4caf50" },
      { name: "Medium", value: metrics.mediumRiskCount, color: "#ff9800" },
      { name: "High", value: metrics.highRiskCount, color: "#f44336" },
    ];
  }, [metrics]);

  const handleMetricClick = (filter?: "high" | "medium" | "low") => {
    if (filter) {
      navigate(`/patients?risk=${filter}`);
    } else {
      navigate("/patients");
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard - Patient Risk Overview</h1>

      {/* Key Metrics Section */}
      <section className="metrics-section">
        <div className="metric-card" onClick={() => handleMetricClick()}>
          <h3>Total Patients</h3>
          <p className="metric-value">{metrics.totalPatients}</p>
        </div>
        <div className="metric-card risk-high" onClick={() => handleMetricClick("high")}>
          <h3>High Risk</h3>
          <p className="metric-value">{metrics.highRiskCount}</p>
        </div>
        <div className="metric-card risk-medium" onClick={() => handleMetricClick("medium")}>
          <h3>Medium Risk</h3>
          <p className="metric-value">{metrics.mediumRiskCount}</p>
        </div>
        <div className="metric-card risk-low" onClick={() => handleMetricClick("low")}>
          <h3>Low Risk</h3>
          <p className="metric-value">{metrics.lowRiskCount}</p>
        </div>
        <div className="metric-card" onClick={() => handleMetricClick()}>
          <h3>Recent Admissions</h3>
          <p className="metric-value">{metrics.recentAdmissionsCount}</p>
        </div>
      </section>

      {/* Charts Section */}
      <section className="dashboard-charts">
        <div className="chart-container">
          <h2>Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h2>Risk Level Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Recent Patients Table */}
      <section className="recent-patients">
        <h2>Recent Patient Updates</h2>
        {patients.length === 0 ? (
          <p className="empty-state">No patients yet. Go to Patients to add one.</p>
        ) : (
          <div className="table-wrapper">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Age</th>
                  <th>Admission Date</th>
                  <th>Risk Level</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {patients
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
                  )
                  .slice(0, 10)
                  .map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <a href={`/patients/${patient.id}`}>{patient.fullName}</a>
                      </td>
                      <td>{patient.age}</td>
                      <td>{new Date(patient.admissionDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`risk-badge risk-${patient.riskLevel.toLowerCase()}`}>
                          {patient.riskLevel}
                        </span>
                      </td>
                      <td>{new Date(patient.lastUpdated).toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
