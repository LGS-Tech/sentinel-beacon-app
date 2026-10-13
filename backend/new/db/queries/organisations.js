const { query } = require("../pool");
const { organisationToApi } = require("../mappers");
const { DEMO_ORGANISATION_SLUG } = require("../orgScope");

const COLS = `id, name, slug, is_active, created_at`;

async function listOrganisations({ activeOnly = true } = {}) {
  const sql = activeOnly
    ? `SELECT ${COLS} FROM organisations WHERE is_active = TRUE ORDER BY id`
    : `SELECT ${COLS} FROM organisations ORDER BY id`;
  const result = await query(sql);
  return result.rows.map(organisationToApi);
}

async function getOrganisationById(id) {
  const result = await query(`SELECT ${COLS} FROM organisations WHERE id = $1`, [
    id,
  ]);
  return organisationToApi(result.rows[0]);
}

async function getOrganisationBySlug(slug) {
  const result = await query(
    `SELECT ${COLS} FROM organisations WHERE slug = $1 LIMIT 1`,
    [slug]
  );
  return organisationToApi(result.rows[0]);
}

async function getDefaultOrganisation() {
  return getOrganisationBySlug(DEMO_ORGANISATION_SLUG);
}

async function createOrganisation({ name, slug }) {
  if (!name || !slug) {
    throw new Error("name and slug are required");
  }
  const result = await query(
    `INSERT INTO organisations (name, slug) VALUES ($1, $2) RETURNING id`,
    [name, slug]
  );
  return getOrganisationById(result.rows[0].id);
}

async function deleteOrganisation(id) {
  const result = await query(
    `DELETE FROM organisations WHERE id = $1 AND slug <> $2`,
    [id, DEMO_ORGANISATION_SLUG]
  );
  return result.rowCount > 0;
}

module.exports = {
  listOrganisations,
  getOrganisationById,
  getOrganisationBySlug,
  getDefaultOrganisation,
  createOrganisation,
  deleteOrganisation,
};
