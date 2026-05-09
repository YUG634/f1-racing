const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ============ API ENDPOINTS ============

// Teams
app.get('/api/teams', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM teams ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/teams', async (req, res) => {
  try {
    const { id, name, hq, principal } = req.body;
    const result = await db.query(
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
    await db.query('DELETE FROM teams WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Drivers - FIXED with lowercase column names
app.post('/api/drivers', async (req, res) => {
  try {
    const { id, teamid, firstname, lastname, nationality, dob } = req.body;
    
    const result = await db.query(
      'INSERT INTO drivers (id, teamid, firstname, lastname, nationality, dob) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, teamid, firstname, lastname, nationality, dob]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error adding driver:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all drivers - FIXED with lowercase column names
app.get('/api/drivers', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT d.*, t.name as team_name 
      FROM drivers d
      JOIN teams t ON d.teamid = t.id
      ORDER BY d.lastname
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete driver
app.delete('/api/drivers/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM drivers WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Circuits
app.get('/api/circuits', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM circuits ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/circuits', async (req, res) => {
  try {
    const { id, name, location, lengthkm } = req.body;
    const result = await db.query(
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
    await db.query('DELETE FROM circuits WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Races
app.get('/api/races', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.*, c.name as circuit_name, c.location 
      FROM races r
      JOIN circuits c ON r.circuitid = c.id
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
    const result = await db.query(
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
    await db.query('DELETE FROM races WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Predictions
app.get('/api/predictions', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM predictions ORDER BY predictiontimestamp DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('GET predictions error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/predictions', async (req, res) => {
  try {
    const { id, raceId, driverId, predictedPosition, userId, predictiontimestamp } = req.body;
    const result = await db.query(
      'INSERT INTO predictions (id, raceid, driverid, predictedposition, userid, predictiontimestamp) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, raceId, driverId, predictedPosition, userId, predictiontimestamp]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error adding prediction:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/predictions/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM predictions WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sessions');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sessions', async (req, res) => {
  try {
    const { id, raceid, type, starttime, weather } = req.body;
    const result = await db.query(
      'INSERT INTO sessions (id, raceid, type, starttime, weather) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, raceid, type, starttime, weather]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});