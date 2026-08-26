import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../../../.env', import.meta.url).pathname });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

/**
 * Run a SELECT query — returns array of rows.
 * Use $1, $2, ... placeholders (PostgreSQL style).
 */
export const query = async (sql, params = []) => {
  const { rows } = await pool.query(sql, params);
  return rows;
};

/**
 * Run a SELECT query — returns the first row only, or undefined.
 * Use $1, $2, ... placeholders (PostgreSQL style).
 */
export const get = async (sql, params = []) => {
  const { rows } = await pool.query(sql, params);
  return rows[0];
};

/**
 * Run an INSERT / UPDATE / DELETE.
 * For INSERTs that need the new row ID, append RETURNING id to the SQL.
 * Returns { lastID, changes } to keep parity with the old SQLite wrapper.
 */
export const run = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  const lastID = result.rows && result.rows[0] ? result.rows[0].id : null;
  const changes = result.rowCount || 0;
  return { lastID, changes };
};

export default pool;
