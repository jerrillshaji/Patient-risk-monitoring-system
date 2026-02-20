const db = require('../config/mysql');

class AuditLog {
  // Get audit logs by patient ID
  static async findByPatientId(patientId) {
    const [rows] = await db.query(
      'SELECT * FROM auditLogs WHERE patientId = ? ORDER BY timestamp DESC',
      [patientId]
    );
    return rows;
  }

  // Get all audit logs
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM auditLogs ORDER BY timestamp DESC');
    return rows;
  }

  // Create audit log
  static async create(data) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(',');
    const values = fields.map(field => data[field]);
    
    const [result] = await db.query(
      `INSERT INTO auditLogs (${fields.join(',')}) VALUES (${placeholders})`,
      values
    );
    
    return { id: result.insertId, ...data };
  }
}

module.exports = AuditLog;
