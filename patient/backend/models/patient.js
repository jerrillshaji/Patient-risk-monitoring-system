const db = require('../config/mysql');

class Patient {
  // Get all patients
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM patients ORDER BY lastupdated DESC');
    return rows;
  }

  // Get patient by ID
  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM patients WHERE id = ?', [id]);
    return rows[0] || null;
  }

  // Create patient
  static async create(data) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(',');
    const values = fields.map(field => data[field]);
    
    const [result] = await db.query(
      `INSERT INTO patients (${fields.join(',')}) VALUES (${placeholders})`,
      values
    );
    
    return this.findById(result.insertId);
  }

  // Update patient
  static async update(id, data) {
    const fields = Object.keys(data);
    const setClause = fields.map(field => `${field} = ?`).join(',');
    const values = [...fields.map(field => data[field]), id];
    
    await db.query(
      `UPDATE patients SET ${setClause} WHERE id = ?`,
      values
    );
    
    return this.findById(id);
  }

  // Delete patient
  static async delete(id) {
    await db.query('DELETE FROM patients WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Patient;
