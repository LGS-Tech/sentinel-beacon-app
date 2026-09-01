/**
 * PostgreSQL data layer for LGS Tech.
 *
 *   const db = require("./db");
 *   await db.cases.listCases({ openOnly: true });
 */

const pool = require("./pool");
const departments = require("./queries/departments");
const users = require("./queries/users");
const cases = require("./queries/cases");
const attachments = require("./queries/attachments");

async function ping() {
  return pool.ping();
}

module.exports = {
  pool,
  ping,
  departments,
  users,
  cases,
  attachments,
};
