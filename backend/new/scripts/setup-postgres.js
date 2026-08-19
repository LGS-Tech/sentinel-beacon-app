/**
 * Apply schema.sql using DATABASE_URL (LGS_Tech credentials).
 * Usage: node scripts/setup-postgres.js
 */
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL missing in .env");
  }

  const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query(sql);
    const departments = await client.query(
      "SELECT COUNT(*)::int AS count FROM departments"
    );
    const cases = await client.query("SELECT COUNT(*)::int AS count FROM cases");
    const users = await client.query("SELECT COUNT(*)::int AS count FROM users");
    const events = await client.query(
      "SELECT COUNT(*)::int AS count FROM case_events"
    );
    console.log("PostgreSQL schema applied.");
    console.log(`departments rows: ${departments.rows[0].count}`);
    console.log(`users rows: ${users.rows[0].count}`);
    console.log(`cases rows: ${cases.rows[0].count}`);
    console.log(`case_events rows: ${events.rows[0].count}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("setup-postgres failed:", err.message);
  process.exit(1);
});
