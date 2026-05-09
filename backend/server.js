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

// ============ ROOT ROUTE ============
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'F1 Racing API is running!',
    endpoints: ['/api/teams', '/api/drivers', '/api/circuits', '/api/races', '/api/predictions']
  });
});

// ============ TEAMS ROUTES ============
app.get('/api/teams', async (req, res) => {
  console.log('📡 GET /api/teams received');
  try {
    const result = await pool.query('SELECT * FROM teams ORDER BY name');
    console.log(`✅ Found ${result.rows.length} teams`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Teams error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/teams', async (req, res) => {
  console.log('📡 POST /api/teams received', req.body);
  try {
    const { id, name, hq, principal } = req.body;
    const result = await pool.query(
      'INSERT INTO teams (id, name, hq, principal) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, name, hq, principal]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ POST teams error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/teams/:id', async (req, res) => {
  console.log('📡 DELETE /api/teams', req.params.id);
  try {
    await pool.query('DELETE FROM teams WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ DELETE teams error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============ DRIVERS ROUTES ============
app.get('/api/drivers', async (req, res) => {
  console.log('📡 GET /api/drivers received');
  try {
    const result = await pool.query(`
      SELECT d.*, t.name as team_name 
      FROM drivers d
      LEFT JOIN teams t ON d.teamid = t.id
      ORDER BY d.lastname
    `);
    console.log(`✅ Found ${result.rows.length} drivers`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Drivers error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/drivers', async (req, res) => {
  console.log('📡 POST /api/drivers received', req.body);
  try {
    const { id, teamid, firstname, lastname, nationality, dob } = req.body;
    const result = await pool.query(
      'INSERT INTO drivers (id, teamid, firstname, lastname, nationality, dob) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, teamid, firstname, lastname, nationality, dob]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ POST drivers error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/drivers/:id', async (req, res) => {
  console.log('📡 DELETE /api/drivers', req.params.id);
  try {
    await pool.query('DELETE FROM drivers WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ DELETE drivers error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============ CIRCUITS ROUTES ============
app.get('/api/circuits', async (req, res) => {
  console.log('📡 GET /api/circuits received');
  try {
    const result = await pool.query('SELECT * FROM circuits ORDER BY name');
    console.log(`✅ Found ${result.rows.length} circuits`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Circuits error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/circuits', async (req, res) => {
  console.log('📡 POST /api/circuits received', req.body);
  try {
    const { id, name, location, lengthkm } = req.body;
    const result = await pool.query(
      'INSERT INTO circuits (id, name, location, lengthkm) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, name, location, lengthkm]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ POST circuits error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/circuits/:id', async (req, res) => {
  console.log('📡 DELETE /api/circuits', req.params.id);
  try {
    await pool.query('DELETE FROM circuits WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ DELETE circuits error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============ RACES ROUTES ============
app.get('/api/races', async (req, res) => {
  console.log('📡 GET /api/races received');
  try {
    const result = await pool.query(`
      SELECT r.*, c.name as circuit_name, c.location 
      FROM races r
      LEFT JOIN circuits c ON r.circuitid = c.id
      ORDER BY r.date DESC
    `);
    console.log(`✅ Found ${result.rows.length} races`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Races error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/races', async (req, res) => {
  console.log('📡 POST /api/races received', req.body);
  try {
    const { id, circuitid, name, date, laps } = req.body;
    const result = await pool.query(
      'INSERT INTO races (id, circuitid, name, date, laps) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, circuitid, name, date, laps]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ POST races error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/races/:id', async (req, res) => {
  console.log('📡 DELETE /api/races', req.params.id);
  try {
    await pool.query('DELETE FROM races WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ DELETE races error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============ PREDICTIONS ROUTES ============
app.get('/api/predictions', async (req, res) => {
  console.log('📡 GET /api/predictions received');
  try {
    const result = await pool.query('SELECT * FROM predictions ORDER BY predictiontimestamp DESC');
    console.log(`✅ Found ${result.rows.length} predictions`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Predictions error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/predictions', async (req, res) => {
  console.log('📡 POST /api/predictions received', req.body);
  try {
    const { id, raceid, driverid, predictedposition, userid, predictiontimestamp } = req.body;
    const result = await pool.query(
      'INSERT INTO predictions (id, raceid, driverid, predictedposition, userid, predictiontimestamp) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, raceid, driverid, predictedposition, userid, predictiontimestamp]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ POST predictions error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/predictions/:id', async (req, res) => {
  console.log('📡 DELETE /api/predictions', req.params.id);
  try {
    await pool.query('DELETE FROM predictions WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ DELETE predictions error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: https://f1-backend.onrender.com/api/teams`);
});
