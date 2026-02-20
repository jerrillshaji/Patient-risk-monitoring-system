const db = require('../config/mysql');
const { calculateRisk } = require('../services/riskEngine');
const { extractFromPDF, savePDF } = require('../services/pdfService');
const AuditLog = require('../models/auditLog');
const util = require('util');

/**
 * Convert JavaScript Date/ISO string to MySQL datetime format
 * @param {string|Date|null} date - Date to convert
 * @returns {string|null} - MySQL datetime string (YYYY-MM-DD HH:MM:SS)
 */
const toMySqlDateTime = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Map application field names (camelCase) to database column names (snake_case)
 */
const toDbKey = (key) => {
  const map = {
    id: 'id',
    fullName: 'fullname',
    dateOfBirth: 'dateofbirth',
    age: 'age',
    gender: 'gender',
    contact: 'contact',
    admissionDate: 'admissiondate',

    heartRate: 'heartrate',
    systolicBP: 'systolicbp',
    diastolicBP: 'diastolicbp',
    spo2: 'spo2',
    temperature: 'temperature',
    respRate: 'resprate',

    diabetics: 'diabetics',
    copd: 'copd',
    cardiacDisease: 'cardiacdisease',
    erVisits: 'ervists',

    wbcElevated: 'wbcelevated',
    creatinineHigh: 'creatininehigh',
    crpHigh: 'crphigh',

    notes: 'notes',
    riskScore: 'riskscore',
    riskLevel: 'risklevel',
    lastUpdated: 'lastupdated',
  };
  return map[key] || key;
};

/**
 * Convert application data object to database format
 */
const toDb = (obj = {}) => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'chronicConditions' && typeof v === 'object') {
      out['diabetics'] = v.diabetes || false;
      out['copd'] = v.copd || false;
      out['cardiacdisease'] = v.cardiacDisease || false;
      continue;
    }
    if (k === 'labs' && typeof v === 'object') {
      out['wbcelevated'] = v.wbc || false;
      out['creatininehigh'] = v.creatinine || false;
      out['crphigh'] = v.crp || false;
      continue;
    }
    const dbKey = toDbKey(k);
    out[dbKey] = v;
  }
  return out;
};

/**
 * Convert database row to application format
 */
const fromDb = (row = {}) => {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.fullname ?? row.fullName,
    dateOfBirth: row.dateofbirth ?? row.dateOfBirth,
    age: row.age,
    gender: row.gender,
    contact: row.contact,
    admissionDate: row.admissiondate ?? row.admissionDate,

    heartRate: row.heartrate ?? row.heartRate,
    systolicBP: row.systolicbp ?? row.systolicBP,
    diastolicBP: row.diastolicbp ?? row.diastolicBP,
    spo2: row.spo2,
    temperature: row.temperature,
    respRate: row.resprate ?? row.respRate,

    chronicConditions: {
      diabetes: row.diabetics ?? false,
      copd: row.copd ?? false,
      cardiacDisease: row.cardiacdisease ?? row.cardiacDisease ?? false,
    },

    erVisits: row.ervists ?? row.erVisits ?? 0,

    labs: {
      wbc: row.wbcelevated ?? false,
      creatinine: row.creatininehigh ?? false,
      crp: row.crphigh ?? false,
    },

    notes: row.notes,
    riskScore: row.riskscore ?? row.riskScore,
    riskLevel: row.risklevel ?? row.riskLevel,
    lastUpdated: row.lastupdated ?? row.lastUpdated ?? row.updatedAt,
  };
};

/**
 * Create a new patient
 */
exports.createPatient = async (req, res) => {
  try {
    console.log('[createPatient] Received data:', JSON.stringify(req.body, null, 2));

    // Calculate risk score
    const risk = calculateRisk(req.body);

    // Build insert payload
    const insertPayload = {
      fullname: req.body.fullName,
      dateofbirth: req.body.dateOfBirth,
      age: req.body.age,
      gender: req.body.gender,
      contact: req.body.contact,
      admissiondate: toMySqlDateTime(req.body.admissionDate),
      heartrate: req.body.heartRate,
      systolicbp: req.body.systolicBP,
      diastolicbp: req.body.diastolicBP,
      spo2: req.body.spo2,
      temperature: req.body.temperature,
      resprate: req.body.respRate,
      diabetics: req.body.chronicConditions?.diabetes || false,
      copd: req.body.chronicConditions?.copd || false,
      cardiacdisease: req.body.chronicConditions?.cardiacDisease || false,
      ervists: req.body.erVisits || 0,
      wbcelevated: req.body.labs?.wbc || false,
      creatininehigh: req.body.labs?.creatinine || false,
      crphigh: req.body.labs?.crp || false,
      notes: req.body.notes,
      riskscore: risk.score,
      risklevel: risk.level,
      lastupdated: toMySqlDateTime(new Date()),
    };

    // Remove undefined values
    Object.keys(insertPayload).forEach(key => {
      if (insertPayload[key] === undefined) {
        delete insertPayload[key];
      }
    });

    console.log('[createPatient] Insert payload:', JSON.stringify(insertPayload, null, 2));

    // Insert into database
    const cols = Object.keys(insertPayload);
    const placeholders = cols.map(() => '?').join(',');
    const values = cols.map((k) => insertPayload[k]);
    const insertSql = `INSERT INTO patients (${cols.join(',')}) VALUES (${placeholders})`;
    
    console.log('[createPatient] SQL:', insertSql);
    
    const [result] = await db.query(insertSql, values);
    const insertedId = result.insertId;
    
    // Fetch the created patient
    const [rows] = await db.query('SELECT * FROM patients WHERE id = ?', [insertedId]);
    
    const createdPatient = fromDb(rows[0]);
    console.log('[createPatient] Created patient:', createdPatient);
    
    res.status(201).json(createdPatient);
  } catch (err) {
    console.error('[createPatient] Error:', err);
    const details = util.inspect(err, { depth: 5 });
    res.status(500).json({ 
      message: 'Error creating patient', 
      error: err?.message || String(err), 
      details: process.env.NODE_ENV === 'development' ? details : undefined 
    });
  }
};

/**
 * Update an existing patient
 */
exports.updatePatient = async (req, res) => {
  try {
    const patientId = Number(req.params.id);
    console.log("Updating patient ID:", patientId);

    // Fetch existing patient
    const [oldRows] = await db.query('SELECT * FROM patients WHERE id = ?', [patientId]);
    const oldData = oldRows && oldRows[0];

    if (!oldData) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Calculate new risk score
    const risk = calculateRisk(req.body);

    // Build update payload
    const updatePayload = {
      fullname: req.body.fullName,
      dateofbirth: req.body.dateOfBirth,
      age: req.body.age,
      gender: req.body.gender,
      contact: req.body.contact,
      admissiondate: toMySqlDateTime(req.body.admissionDate),
      heartrate: req.body.heartRate,
      systolicbp: req.body.systolicBP,
      diastolicbp: req.body.diastolicBP,
      spo2: req.body.spo2,
      temperature: req.body.temperature,
      resprate: req.body.respRate,
      diabetics: req.body.chronicConditions?.diabetes || false,
      copd: req.body.chronicConditions?.copd || false,
      cardiacdisease: req.body.chronicConditions?.cardiacDisease || false,
      ervists: req.body.erVisits || 0,
      wbcelevated: req.body.labs?.wbc || false,
      creatininehigh: req.body.labs?.creatinine || false,
      crphigh: req.body.labs?.crp || false,
      notes: req.body.notes,
      riskscore: risk.score,
      risklevel: risk.level,
      lastupdated: toMySqlDateTime(new Date()),
    };

    // Remove undefined values
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

    // Perform SQL update
    const setCols = Object.keys(updatePayload).map((k) => `${k} = ?`).join(', ');
    const params = [...Object.keys(updatePayload).map((k) => updatePayload[k]), patientId];
    const updateSql = `UPDATE patients SET ${setCols} WHERE id = ?`;
    
    await db.query(updateSql, params);

    // Fetch updated patient
    const [updatedRows] = await db.query('SELECT * FROM patients WHERE id = ?', [patientId]);
    const updatedDb = updatedRows[0];

    // Build audit logs
    const oldApp = fromDb(oldData);
    const newApp = fromDb(updatedDb);

    // Track field changes for audit
    const trackedFields = [
      'fullName', 'dateOfBirth', 'age', 'gender', 'contact', 'admissionDate',
      'heartRate', 'systolicBP', 'diastolicBP', 'spo2', 'temperature', 'respRate',
      'chronicConditions', 'erVisits', 'labs', 'notes', 'riskScore', 'riskLevel'
    ];

    for (const key of trackedFields) {
      const oldVal = oldApp[key];
      const newVal = newApp[key];
      
      // Compare values (handle objects)
      const oldStr = oldVal != null ? (typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal)) : null;
      const newStr = newVal != null ? (typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal)) : null;
      
      if (oldStr !== newStr) {
        await AuditLog.create({
          patientId,
          field: key,
          oldValue: oldStr,
          newValue: newStr,
          timestamp: new Date(),
        });
      }
    }

    res.json(newApp);
  } catch (err) {
    console.error('[updatePatient] Error:', err);
    res.status(500).json({ 
      message: 'Error updating patient', 
      error: err?.message || String(err) 
    });
  }
};

/**
 * Get all patients
 */
exports.getAllPatients = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM patients ORDER BY lastupdated DESC');
    const patients = (rows || []).map(fromDb);
    console.log('[getAllPatients] Found', patients.length, 'patients');
    res.json(patients);
  } catch (err) {
    console.error('[getAllPatients] Error:', err);
    res.status(500).json({ 
      message: 'Error fetching patients', 
      error: err?.message || String(err) 
    });
  }
};

/**
 * Get single patient by ID
 */
exports.getPatient = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    
    if (!rows || !rows[0]) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(fromDb(rows[0]));
  } catch (err) {
    console.error('[getPatient] Error:', err);
    res.status(500).json({ 
      message: 'Error fetching patient', 
      error: err?.message || String(err) 
    });
  }
};

/**
 * Delete a patient
 */
exports.deletePatient = async (req, res) => {
  try {
    // Check if patient exists
    const [rows] = await db.query('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    
    if (!rows || !rows[0]) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    await db.query('DELETE FROM patients WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    console.error('[deletePatient] Error:', err);
    res.status(500).json({ 
      message: 'Error deleting patient', 
      error: err?.message || String(err) 
    });
  }
};

/**
 * Get audit logs for a patient
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findByPatientId(req.params.id);
    res.json(logs);
  } catch (err) {
    console.error('[getAuditLogs] Error:', err);
    res.status(500).json({ 
      message: 'Error fetching audit logs', 
      error: err?.message || String(err) 
    });
  }
};

/**
 * Parse PDF file
 */
exports.parsePDF = async (req, res) => {
  try {
    console.log('[parsePDF] Request received');
    console.log('[parsePDF] req.file:', req.file ? 'exists' : 'null');
    
    if (!req.file) {
      console.log('[parsePDF] No file in request');
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    console.log('[parsePDF] File info:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferLength: req.file.buffer?.length
    });

    // Check if buffer exists and has data
    if (!req.file.buffer || req.file.buffer.length === 0) {
      console.log('[parsePDF] File buffer is empty');
      return res.status(400).json({ message: 'Uploaded file is empty' });
    }

    console.log('[parsePDF] Calling extractFromPDF...');
    const extractedData = await extractFromPDF(req.file.buffer);
    console.log('[parsePDF] Extracted data:', extractedData);

    // Optionally save the PDF
    if (req.file.originalname) {
      try {
        const savedPath = savePDF(req.file.buffer, req.file.originalname);
        console.log('[parsePDF] Saved PDF to:', savedPath);
      } catch (e) {
        console.warn('[parsePDF] Could not save PDF:', e.message);
      }
    }

    console.log('[parsePDF] Sending response:', extractedData);
    res.json(extractedData);
  } catch (err) {
    console.error('[parsePDF] Error:', err);
    console.error('[parsePDF] Error stack:', err.stack);
    res.status(500).json({
      message: 'Error parsing PDF',
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? {
        stack: err.stack,
        file: req.file?.originalname
      } : undefined
    });
  }
};
