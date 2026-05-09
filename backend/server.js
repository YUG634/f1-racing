const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({ origin: '*' }));
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Test API route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', timestamp: new Date().toISOString() });
});

// Teams route
app.get('/api/teams', async (req, res) => {
  console.log('Teams endpoint hit');
  try {
    const result = await pool.query('SELECT NOW() as time');
    res.json({ 
      message: 'Database connected!',
      time: result.rows[0].time,
      teams: []
    });
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test URL: https://f1-backend.onrender.com/api/test`);
});
