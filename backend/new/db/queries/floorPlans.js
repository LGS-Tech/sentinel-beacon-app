const { query } = require("../pool");
const { floorPlanToApi, nowMs, pick } = require("../mappers");
const { appendOrganizationFilter } = require("../orgScope");
const { parseFloorId } = require("../../storage/floorPlans");

const FLOOR_PLAN_SELECT = `
  SELECT
    p.id,
    p.organization_id,
    p.floor,
    p.filename,
    p.mime_type,
    p.storage_url,
    p.storage_provider,
    p.file_size_bytes,
    p.uploaded_by_user_id,
    u.name AS uploaded_by_name,
    p.created_at,
    p.updated_at
  FROM floor_plans p
  LEFT JOIN users u ON u.id = p.uploaded_by_user_id
`;

function requireFloorId(floorId) {
  const parsed = parseFloorId(floorId);
  if (!parsed) {
    throw new Error("floor must be 1 or 2");
  }
  return parsed;
}

async function listFloorPlans(organizationId) {
  const params = [];
  const clauses = [];
  appendOrganizationFilter(clauses, params, organizationId, "p.organization_id");
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const result = await query(
    `${FLOOR_PLAN_SELECT}
     ${where}
     ORDER BY p.floor`,
    params
  );
  return result.rows.map(floorPlanToApi);
}

async function getFloorPlanRow(organizationId, floorId) {
  const floor = requireFloorId(floorId);
  const params = [floor];
  const clauses = ["p.floor = $1"];
  appendOrganizationFilter(clauses, params, organizationId, "p.organization_id");
  const result = await query(
    `${FLOOR_PLAN_SELECT} WHERE ${clauses.join(" AND ")}`,
    params
  );
  return result.rows[0] || null;
}

async function getFloorPlan(organizationId, floorId) {
  return floorPlanToApi(await getFloorPlanRow(organizationId, floorId));
}

function buildFloorPlanFields(body) {
  return {
    filename: pick(body, "filename", "filename"),
    mime_type: pick(body, "mimeType", "mime_type"),
    storage_url: pick(body, "storageUrl", "storage_url"),
    storage_provider: pick(body, "storageProvider", "storage_provider"),
    file_size_bytes: pick(body, "fileSizeBytes", "file_size_bytes"),
    uploaded_by_user_id: pick(body, "uploadedByUserId", "uploaded_by_user_id"),
  };
}

async function upsertFloorPlan(organizationId, floorId, body) {
  const floor = requireFloorId(floorId);
  const f = buildFloorPlanFields(body);
  if (!f.filename || !f.storage_url) {
    throw new Error("filename and storageUrl are required");
  }

  const timestamp = nowMs();
  await query(
    `INSERT INTO floor_plans (
       organization_id, floor, filename, mime_type, storage_url,
       storage_provider, file_size_bytes, uploaded_by_user_id,
       created_at, updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9)
     ON CONFLICT (organization_id, floor)
     DO UPDATE SET
       filename = EXCLUDED.filename,
       mime_type = EXCLUDED.mime_type,
       storage_url = EXCLUDED.storage_url,
       storage_provider = EXCLUDED.storage_provider,
       file_size_bytes = EXCLUDED.file_size_bytes,
       uploaded_by_user_id = EXCLUDED.uploaded_by_user_id,
       updated_at = EXCLUDED.updated_at
     RETURNING id`,
    [
      organizationId,
      floor,
      f.filename,
      f.mime_type ?? null,
      f.storage_url,
      f.storage_provider ?? "r2",
      f.file_size_bytes ?? null,
      f.uploaded_by_user_id ?? null,
      timestamp,
    ]
  );

  return getFloorPlan(organizationId, floor);
}

async function deleteFloorPlan(organizationId, floorId) {
  const floor = requireFloorId(floorId);
  const params = [floor];
  const clauses = ["floor = $1"];
  appendOrganizationFilter(clauses, params, organizationId, "organization_id");
  const result = await query(
    `DELETE FROM floor_plans
     WHERE ${clauses.join(" AND ")}
     RETURNING id`,
    params
  );
  return result.rowCount > 0;
}

module.exports = {
  listFloorPlans,
  getFloorPlanRow,
  getFloorPlan,
  upsertFloorPlan,
  deleteFloorPlan,
};
