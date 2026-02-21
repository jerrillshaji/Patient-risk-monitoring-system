import { BrowserRouter as Router } from "react-router-dom";
import { PatientProvider } from "./context/PatientContext";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

function App() {
  return (
    <PatientProvider>
      <Router>
        <div className="app-container">
          <header className="app-header">
            <div className="app-header-content">
              <h1>Patient Risk Monitoring System</h1>
              <nav className="app-nav">
                <a href="/" className="nav-link">Dashboard</a>
                <a href="/patients" className="nav-link">Patients</a>
              </nav>
            </div>
          </header>
          <main className="app-main">
            <AppRoutes />
          </main>
          <footer className="app-footer">
            <p>&copy; 2026 Patient Risk Monitoring System. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </PatientProvider>
  );
}

export default App;

