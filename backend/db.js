const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to Neon:', err.message);
  } else {
    console.log('✅ Connected to Neon PostgreSQL');
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};