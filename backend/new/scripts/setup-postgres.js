/**
 * Apply the baseline (new databases only) and incremental migrations using DATABASE_URL.
 * Usage: node scripts/setup-postgres.js
 */
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

// Shared with upgrade regression tests; never replays legacy seeds on migrated databases.
async function applySchema(client) {
  await client.query('BEGIN');
  try {
    const installed = await client.query("SELECT to_regclass('public.organisation_domains') AS name");
    // The legacy baseline mutates seed IDs. Never replay it after migration.
    if (!installed.rows[0].name) await client.query(fs.readFileSync(path.join(__dirname, "..", "db", "schema.sql"), "utf8"));
    const migration = fs.readFileSync(path.join(__dirname, '..', 'db', 'migrations', '20261029-organisation-domains.sql'), 'utf8');
    await client.query(migration);
    const reportMigration = fs.readFileSync(path.join(__dirname, '..', 'db', 'migrations', '20261121-report-incident-fields.sql'), 'utf8');
    await client.query(reportMigration);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL missing in .env");
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await applySchema(client);
    const { resetTestOrganisations, cleanupResetStorage } = require('./reset-test-organisations');
    const reset = await resetTestOrganisations(client, process.env.LGS_TEST_RESET_MANIFEST);
    await cleanupResetStorage(client, require('../storage/r2'));
    if (reset) console.log('Authorised test reset completed: two organisations, eight users.');
    const departments = await client.query(
      "SELECT COUNT(*)::int AS count FROM departments"
    );
    const cases = await client.query("SELECT COUNT(*)::int AS count FROM cases");
    const users = await client.query("SELECT COUNT(*)::int AS count FROM users");
    const events = await client.query(
      "SELECT COUNT(*)::int AS count FROM case_events"
    );
    const attachments = await client.query(
      "SELECT COUNT(*)::int AS count FROM case_attachments"
    );
    const organisations = await client.query(
      "SELECT COUNT(*)::int AS count FROM organisations"
    );
    const floorPlans = await client.query(
      "SELECT COUNT(*)::int AS count FROM floor_plans"
    );
    console.log("PostgreSQL schema applied.");
    console.log(`departments rows: ${departments.rows[0].count}`);
    console.log(`users rows: ${users.rows[0].count}`);
    console.log(`cases rows: ${cases.rows[0].count}`);
    console.log(`case_events rows: ${events.rows[0].count}`);
    console.log(`case_attachments rows: ${attachments.rows[0].count}`);
    console.log(`organisations rows: ${organisations.rows[0].count}`);
    console.log(`floor_plans rows: ${floorPlans.rows[0].count}`);
  } finally {
    await client.end();
  }
}

module.exports = { applySchema };

if (require.main === module) main().catch((err) => {
  console.error("setup-postgres failed:", err.message);
  process.exit(1);
});
