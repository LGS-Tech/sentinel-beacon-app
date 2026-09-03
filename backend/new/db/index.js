/**
 * PostgreSQL data layer for LGS Tech.
 * Live Express routes in server.js still use Mongo / users.json until the team switches.
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
