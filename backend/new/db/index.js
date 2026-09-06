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

module.exports = {
  pool,
  departments,
  users,
  cases,
  attachments,
  ping: pool.ping,
};
