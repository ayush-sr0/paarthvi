import pg from 'pg';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });


const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 15,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
});

// Single pre-warm query so the first API call uses a warm TCP/TLS connection
(async () => {
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.warn('[DB] Connection pool warm-up notice:', err.message);
  }
})();

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});



const normalizeSql = (sql) => {
  if (!sql.includes('?')) return sql;
  let idx = 1;
  return sql.replace(/\?/g, () => `$${idx++}`);
};

/**
 * Run a SELECT query — returns array of rows.
 */
export const query = async (sql, params = []) => {
  const { rows } = await pool.query(normalizeSql(sql), params);
  return rows;
};

/**
 * Run a SELECT query — returns the first row only, or undefined.
 */
export const get = async (sql, params = []) => {
  const { rows } = await pool.query(normalizeSql(sql), params);
  return rows[0];
};

/**
 * Run an INSERT / UPDATE / DELETE.
 * For INSERTs that need the new row ID, append RETURNING id to the SQL.
 * Returns { lastID, changes } to keep parity with the old SQLite wrapper.
 */
export const run = async (sql, params = []) => {
  let querySql = normalizeSql(sql);
  if (/^\s*INSERT/i.test(querySql) && !/RETURNING/i.test(querySql)) {
    querySql += ' RETURNING id';
  }
  const { rows, rowCount } = await pool.query(querySql, params);
  const lastID = rows && rows[0] ? rows[0].id : null;
  const changes = rowCount || 0;
  return { lastID, changes };
};



export default pool;
