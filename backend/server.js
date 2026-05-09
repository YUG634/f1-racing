const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Test database on startup
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Connected to Neon PostgreSQL at:', result.rows[0].now);
  }
});

// CORS - Allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'F1 Racing API is running!',
    endpoints: ['/api/teams', '/api/drivers', '/api/circuits', '/api/races', '/api/predictions']
  });
});

// TEAMS
app.get('/api/teams', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teams ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/teams', async (req, res) => {
  try {
    const { id, name, hq, principal } = req.body;
    const result = await pool.query(
      'INSERT INTO teams (id, name, hq, principal) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, name, hq, principal]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/teams/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM teams WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DRIVERS
app.get('/api/drivers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, t.name as team_name 
      FROM drivers d
      LEFT JOIN teams t ON d.teamid = t.id
      ORDER BY d.lastname
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/drivers', async (req, res) => {
  try {
    const { id, teamid, firstname, lastname, nationality, dob } = req.body;
    const result = await pool.query(
      'INSERT INTO drivers (id, teamid, firstname, lastname, nationality, dob) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, teamid, firstname, lastname, nationality, dob]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/drivers/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM drivers WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CIRCUITS
app.get('/api/circuits', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM circuits ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/circuits', async (req, res) => {
  try {
    const { id, name, location, lengthkm } = req.body;
    const result = await pool.query(
      'INSERT INTO circuits (id, name, location, lengthkm) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, name, location, lengthkm]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/circuits/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM circuits WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RACES
app.get('/api/races', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, c.name as circuit_name, c.location 
      FROM races r
      LEFT JOIN circuits c ON r.circuitid = c.id
      ORDER BY r.date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/races', async (req, res) => {
  try {
    const { id, circuitid, name, date, laps } = req.body;
    const result = await pool.query(
      'INSERT INTO races (id, circuitid, name, date, laps) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, circuitid, name, date, laps]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/races/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM races WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PREDICTIONS
app.get('/api/predictions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM predictions ORDER BY predictiontimestamp DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/predictions', async (req, res) => {
  try {
    const { id, raceid, driverid, predictedposition, userid, predictiontimestamp } = req.body;
    const result = await pool.query(
      'INSERT INTO predictions (id, raceid, driverid, predictedposition, userid, predictiontimestamp) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, raceid, driverid, predictedposition, userid, predictiontimestamp]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/predictions/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM predictions WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: https://f1-racing-c1im.onrender.com/api/teams`);
});
