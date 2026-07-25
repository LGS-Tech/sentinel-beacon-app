/**
 * Quick connectivity check: node scripts/ping-postgres.js
 */
require("dotenv").config();
const { ping } = require("../db/pool");

ping()
  .then((row) => {
    console.log("PostgreSQL OK:", row.now);
    process.exit(0);
  })
  .catch((err) => {
    console.error("PostgreSQL ping failed:", err.message);
    process.exit(1);
  });
