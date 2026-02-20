const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Extract patient data from PDF buffer
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<Object>} - Extracted patient data
 */
module.exports.extractFromPDF = async (buffer) => {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error('PDF buffer is empty');
    }

    console.log('[extractFromPDF] Buffer size:', buffer.length, 'bytes');

    // Parse PDF using pdf-parse
    const data = await pdfParse(buffer);
    console.log('[extractFromPDF] PDF parsed successfully');
    console.log('[extractFromPDF] PDF pages:', data.numpages);
    console.log('[extractFromPDF] PDF text length:', data.text.length);

    const text = data.text;

    // Helper function to extract values with different patterns
    const extract = (patterns) => {
      for (const pattern of patterns) {
        try {
          const regex = new RegExp(pattern, 'i');
          const match = text.match(regex);
          if (match && match[1]) {
            return match[1].trim();
          }
        } catch (e) {
          console.warn('[extractFromPDF] Regex error:', e.message, 'Pattern:', pattern);
        }
      }
      return null;
    };

    // Extract numeric values
    const extractNumber = (patterns) => {
      const value = extract(patterns);
      if (value) {
        const num = parseInt(value, 10);
        return isNaN(num) ? null : num;
      }
      return null;
    };

    // Extract patient information with multiple pattern variations
    const result = {
      fullName: extract([
        'name:\\s*([a-zA-Z\\s]+)',
        'patient:\\s*([a-zA-Z\\s]+)',
        'full\\s*name:\\s*([a-zA-Z\\s]+)',
      ]),
      dateOfBirth: extract([
        'date\\s*of\\s*birth:\\s*([\\d/-]+)',
        'dob:\\s*([\\d/-]+)',
        'birth\\s*date:\\s*([\\d/-]+)',
      ]),
      age: extractNumber([
        'age:\\s*(\\d+)',
      ]),
      gender: extract([
        'gender:\\s*([a-zA-Z]+)',
        'sex:\\s*([a-zA-Z]+)',
      ]),
      heartRate: extractNumber([
        'hr:\\s*(\\d+)',
        'heart\\s*rate:\\s*(\\d+)',
        'pulse:\\s*(\\d+)',
      ]),
      systolicBP: extractNumber([
        'bp:\\s*(\\d+)',
        'blood\\s*pressure:\\s*(\\d+)',
        'systolic:\\s*(\\d+)',
        'bp\\s*systolic:\\s*(\\d+)',
      ]),
      diastolicBP: extractNumber([
        'diastolic:\\s*(\\d+)',
        'bp\\s*diastolic:\\s*(\\d+)',
      ]),
      spo2: extractNumber([
        'spo2:\\s*(\\d+)',
        'o2\\s*saturation:\\s*(\\d+)',
        'oxygen\\s*saturation:\\s*(\\d+)',
      ]),
      temperature: extractNumber([
        'temp:\\s*(\\d+\\.?\\d*)',
        'temperature:\\s*(\\d+\\.?\\d*)',
      ]),
      respRate: extractNumber([
        'rr:\\s*(\\d+)',
        'resp\\s*rate:\\s*(\\d+)',
        'respiratory\\s*rate:\\s*(\\d+)',
      ]),
      notes: extract([
        'notes:\\s*([\\s\\S]+?)(?=\\n\\s*[a-zA-Z]+:|$)',
        'comments:\\s*([\\s\\S]+?)(?=\\n\\s*[a-zA-Z]+:|$)',
      ]),
    };

    console.log('[extractFromPDF] Extracted result:', result);
    return result;
  } catch (err) {
    console.error('[extractFromPDF] Error:', err.message);
    console.error('[extractFromPDF] Stack:', err.stack);
    throw new Error('Failed to extract data from PDF: ' + err.message);
  }
};

/**
 * Save PDF file to uploads directory
 * @param {Buffer} buffer - PDF file buffer
 * @param {string} filename - Original filename
 * @returns {string} - Saved file path
 */
module.exports.savePDF = (buffer, filename) => {
  try {
    const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, safeFilename);
    fs.writeFileSync(filePath, buffer);
    console.log('[savePDF] Saved to:', filePath);
    return filePath;
  } catch (err) {
    console.error('[savePDF] Error:', err.message);
    throw err;
  }
};
