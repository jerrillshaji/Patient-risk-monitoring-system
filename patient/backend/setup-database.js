require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

(async () => {
  let connection;
  try {
    // Connect to MySQL (without database first)
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
      multipleStatements: true,
    });

    console.log('✅ Connected to MySQL server');

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE || 'patientdb'}`);
    console.log(`✅ Database '${process.env.MYSQL_DATABASE || 'patientdb'}' ready`);

    // Use the database
    await connection.query(`USE ${process.env.MYSQL_DATABASE || 'patientdb'}`);
    console.log('✅ Using database');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Remove comments
    schema = schema.replace(/--.*$/gm, '');
    schema = schema.replace(/\/\*[\s\S]*?\*\//g, '');
    
    console.log('📝 Executing schema...');
    await connection.query(schema);

    console.log('✅ Schema executed successfully');

    // Verify tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📊 Tables created:', tables.map(t => Object.values(t)[0]).join(', '));

    // Show table structures
    const [patientsCols] = await connection.query('DESCRIBE patients');
    console.log('\n📋 patients table columns:', patientsCols.length);
    
    const [auditCols] = await connection.query('DESCRIBE auditLogs');
    console.log('📋 auditLogs table columns:', auditCols.length);

    console.log('\n✅ Database setup complete!');
    console.log('🚀 You can now start the backend server: npm run dev');

  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message.includes('access denied')) {
      console.error('\n⚠️  Check your MySQL password in backend/.env');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
})();
