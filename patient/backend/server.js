require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/mysql');

const patientRoutes = require('./routes/patientRoutes');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test MySQL connection on startup
(async () => {
  try {
    const [rows] = await db.query('SELECT 1 as ok');
    console.log('✅ MySQL connected successfully');
    console.log('📊 Database:', process.env.MYSQL_DATABASE);
    console.log('🔗 Host:', process.env.MYSQL_HOST || 'localhost');
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message || err);
    console.log('\n⚠️  Troubleshooting steps:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check your .env file has correct credentials');
    console.log('3. Create the database: CREATE DATABASE patientdb;');
    console.log('4. Run the schema: source backend/database/schema.sql\n');
    process.exit(1);
  }
})();

// Routes
app.use('/api/patients', patientRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Patient Risk Monitoring System API',
    version: '1.0.0',
    endpoints: {
      patients: '/api/patients',
      health: '/api/health',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
