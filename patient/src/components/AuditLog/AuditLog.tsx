import React from "react";
import type { AuditLog as AuditLogType } from "../../types/types";
import "./AuditLog.css";

interface AuditLogProps {
  history: AuditLogType[];
}

const AuditLog: React.FC<AuditLogProps> = ({ history }) => {
  const formatValue = (value: unknown): string => {
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "number") return value.toString();
    if (typeof value === "string") return value;
    return String(value);
  };

  return (
    <div className="audit-log-container">
      <h2>Audit History</h2>

      {history.length === 0 ? (
        <p className="empty-history">No changes recorded yet</p>
      ) : (
        <div className="timeline">
          {history
            .slice()
            .reverse()
            .map((log) => (
              <div key={log.id} className="timeline-item">
                <div className="timeline-marker">
                  {/** Guard riskLevelAfter — default to LOW if missing */}
                  <div
                    className={`marker-dot risk-${String(log.riskLevelAfter || 'LOW').toLowerCase()}`}
                  ></div>
                </div>

                <div className="timeline-content">
                  <div className="log-header">
                    <h3 className="log-field">{log.field}</h3>
                    <span className="log-timestamp">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="log-body">
                    <div className="change-container">
                      <div className="change-item">
                        <strong>Before:</strong>
                        <span className="old-value">{formatValue(log.oldValue)}</span>
                      </div>
                      <div className="arrow">→</div>
                      <div className="change-item">
                        <strong>After:</strong>
                        <span className="new-value">{formatValue(log.newValue)}</span>
                      </div>
                    </div>

                    {log.riskScoreBefore !== log.riskScoreAfter && (
                      <div className="risk-change">
                        <strong>Risk Assessment:</strong> {log.riskLevelBefore}
                        ({log.riskScoreBefore}) → {log.riskLevelAfter}({log.riskScoreAfter})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AuditLog;
