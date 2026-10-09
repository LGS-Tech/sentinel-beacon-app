/**
 * Organisation id helpers.
 * HTTP routes must pass organizationId from the authenticated user (JWT),
 * never from the request body or query string.
 */
const { query } = require("./pool");

const DEMO_ORGANISATION_SLUG = "lgs-demo";

function parseOrganizationId(value) {
  if (value == null || value === "") return null;
  const id = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("organizationId must be a positive integer");
  }
  return id;
}

async function resolveOrganizationId(value) {
  const parsed = parseOrganizationId(value);
  if (parsed != null) return parsed;

  const result = await query(
    `SELECT id FROM organisations WHERE slug = $1 LIMIT 1`,
    [DEMO_ORGANISATION_SLUG]
  );
  if (!result.rows[0]) {
    throw new Error(
      "default organisation lgs-demo is missing; run npm run db:setup"
    );
  }
  return result.rows[0].id;
}

function appendOrganizationFilter(clauses, params, organizationId, column) {
  const id = parseOrganizationId(organizationId);
  if (id == null) return;
  params.push(id);
  clauses.push(`${column} = $${params.length}`);
}

function organizationIdFromUser(user) {
  if (!user || typeof user !== "object") return null;
  const raw = user.organizationId ?? user.organisationId;
  if (raw == null || raw === "") return null;
  const id = typeof raw === "number" ? raw : Number(String(raw).trim());
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function requireRequestOrganization(req, res) {
  const organizationId = organizationIdFromUser(req.user);
  if (organizationId == null) {
    res.status(403).json({ error: "Organisation access is required" });
    return null;
  }
  return organizationId;
}

function omitClientOrganisation(source) {
  if (!source || typeof source !== "object") return {};
  const {
    organizationId,
    organization_id,
    organisationId,
    organisation_id,
    ...rest
  } = source;
  return rest;
}

module.exports = {
  DEMO_ORGANISATION_SLUG,
  parseOrganizationId,
  resolveOrganizationId,
  appendOrganizationFilter,
  organizationIdFromUser,
  requireRequestOrganization,
  omitClientOrganisation,
};
