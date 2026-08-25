const { query } = require("../pool");
const { departmentToApi } = require("../mappers");

const COLS = `id, name, slug, kind, is_active`;

async function listDepartments({ activeOnly = true } = {}) {
  const sql = activeOnly
    ? `SELECT ${COLS} FROM departments WHERE is_active = TRUE ORDER BY name`
    : `SELECT ${COLS} FROM departments ORDER BY name`;
  const result = await query(sql);
  return result.rows.map(departmentToApi);
}

async function getDepartmentById(id) {
  const result = await query(
    `SELECT ${COLS} FROM departments WHERE id = $1`,
    [id]
  );
  return departmentToApi(result.rows[0]);
}

async function getDepartmentByName(name) {
  const result = await query(
    `SELECT ${COLS} FROM departments WHERE LOWER(name) = LOWER($1) LIMIT 1`,
    [name]
  );
  return departmentToApi(result.rows[0]);
}

module.exports = {
  listDepartments,
  getDepartmentById,
  getDepartmentByName,
};
