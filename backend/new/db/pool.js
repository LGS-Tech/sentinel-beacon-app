/**
 * PostgreSQL connection pool for LGS Tech.
 * Uses DATABASE_URL from the environment.
 *
 * The URL is checked when a connection or query is attempted, not at import,
 * so unit tests can load modules that only reference the query helpers.
 */
require("dotenv").config();

const { Pool } = require("pg");

const MISSING_DATABASE_URL =
  "DATABASE_URL is missing. Copy .env.example → .env and set the Postgres URL.";

let pool;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error(MISSING_DATABASE_URL);
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    pool.on("error", (err) => {
      console.error("Unexpected PostgreSQL pool error:", err);
    });
  }
  return pool;
}

async function query(text, params) {
  return getPool().query(text, params);
}

async function getClient() {
  return getPool().connect();
}

async function ping() {
  const result = await getPool().query("SELECT NOW() AS now");
  return result.rows[0];
}

module.exports = {
  get pool() {
    return getPool();
  },
  query,
  getClient,
  ping,
};
