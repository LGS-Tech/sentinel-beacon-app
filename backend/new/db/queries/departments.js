const { query } = require("../pool");
const { departmentToApi } = require("../mappers");
const {
  appendOrganizationFilter,
  resolveOrganizationId,
} = require("../orgScope");

const COLS = `id, name, slug, kind, is_active, organization_id`;

async function listDepartments({ activeOnly = true, organizationId } = {}) {
  const clauses = [];
  const params = [];
  if (activeOnly) clauses.push("is_active = TRUE");
  appendOrganizationFilter(clauses, params, organizationId, "organization_id");
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const result = await query(
    `SELECT ${COLS} FROM departments ${where} ORDER BY name`,
    params
  );
  return result.rows.map(departmentToApi);
}

async function getDepartmentById(id, organizationId) {
  const params = [id];
  const clauses = ["id = $1"];
  appendOrganizationFilter(clauses, params, organizationId, "organization_id");
  const result = await query(
    `SELECT ${COLS} FROM departments WHERE ${clauses.join(" AND ")}`,
    params
  );
  return departmentToApi(result.rows[0]);
}

async function getDepartmentByName(name, organizationId) {
  const params = [name];
  const clauses = ["LOWER(name) = LOWER($1)"];
  appendOrganizationFilter(clauses, params, organizationId, "organization_id");
  const result = await query(
    `SELECT ${COLS} FROM departments WHERE ${clauses.join(" AND ")} LIMIT 1`,
    params
  );
  return departmentToApi(result.rows[0]);
}

async function createDepartment({ name, slug, kind = "other", organizationId }) {
  if (!name || !slug) {
    throw new Error("name and slug are required");
  }
  const orgId = await resolveOrganizationId(organizationId);
  const result = await query(
    `INSERT INTO departments (name, slug, kind, organization_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [name, slug, kind, orgId]
  );
  return getDepartmentById(result.rows[0].id);
}

async function deleteDepartment(id, organizationId) {
  const params = [id];
  const clauses = ["id = $1"];
  appendOrganizationFilter(clauses, params, organizationId, "organization_id");
  const result = await query(
    `DELETE FROM departments WHERE ${clauses.join(" AND ")}`,
    params
  );
  return result.rowCount > 0;
}

module.exports = {
  listDepartments,
  getDepartmentById,
  getDepartmentByName,
  createDepartment,
  deleteDepartment,
};
