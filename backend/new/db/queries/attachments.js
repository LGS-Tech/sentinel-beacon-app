const { query } = require("../pool");
const { attachmentToApi, nowMs, pick } = require("../mappers");
const { getCaseById } = require("./cases");
const { appendOrganizationFilter } = require("../orgScope");

const ATTACHMENT_SELECT = `
  SELECT
    a.id,
    a.case_id,
    a.filename,
    a.mime_type,
    a.storage_url,
    a.storage_provider,
    a.file_size_bytes,
    a.uploaded_by_user_id,
    u.name AS uploaded_by_name,
    a.created_at,
    a.organization_id
  FROM case_attachments a
  LEFT JOIN users u ON u.id = a.uploaded_by_user_id
`;

async function listAttachmentsByCaseId(caseId, organizationId) {
  const params = [caseId];
  const clauses = ["a.case_id = $1"];
  appendOrganizationFilter(clauses, params, organizationId, "a.organization_id");
  const result = await query(
    `${ATTACHMENT_SELECT}
     WHERE ${clauses.join(" AND ")}
     ORDER BY a.created_at DESC`,
    params
  );
  return result.rows.map(attachmentToApi);
}

async function getAttachmentById(id, organizationId) {
  const params = [id];
  const clauses = ["a.id = $1"];
  appendOrganizationFilter(clauses, params, organizationId, "a.organization_id");
  const result = await query(
    `${ATTACHMENT_SELECT} WHERE ${clauses.join(" AND ")}`,
    params
  );
  return attachmentToApi(result.rows[0]);
}

async function getAttachmentForCase(caseId, attachmentId) {
  const result = await query(
    `${ATTACHMENT_SELECT} WHERE a.case_id = $1 AND a.id = $2`,
    [caseId, attachmentId]
  );
  return attachmentToApi(result.rows[0]);
}

function buildAttachmentFields(body) {
  return {
    filename: pick(body, "filename", "filename"),
    mime_type: pick(body, "mimeType", "mime_type"),
    storage_url: pick(body, "storageUrl", "storage_url"),
    storage_provider: pick(body, "storageProvider", "storage_provider"),
    file_size_bytes: pick(body, "fileSizeBytes", "file_size_bytes"),
    uploaded_by_user_id: pick(body, "uploadedByUserId", "uploaded_by_user_id"),
  };
}

async function createAttachment(caseId, body, organizationId) {
  const existingCase = await getCaseById(caseId, organizationId);
  if (!existingCase) {
    return null;
  }

  const f = buildAttachmentFields(body);
  if (!f.filename || !f.storage_url) {
    throw new Error("filename and storageUrl are required");
  }

  const result = await query(
    `INSERT INTO case_attachments (
       case_id, filename, mime_type, storage_url, storage_provider,
       file_size_bytes, uploaded_by_user_id, created_at, organization_id
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id`,
    [
      caseId,
      f.filename,
      f.mime_type ?? null,
      f.storage_url,
      f.storage_provider ?? "external",
      f.file_size_bytes ?? null,
      f.uploaded_by_user_id ?? null,
      nowMs(),
      existingCase.organizationId,
    ]
  );

  return getAttachmentById(result.rows[0].id);
}

async function deleteAttachment(caseId, attachmentId, organizationId) {
  const params = [caseId, attachmentId];
  const clauses = ["case_id = $1", "id = $2"];
  appendOrganizationFilter(clauses, params, organizationId, "organization_id");
  const result = await query(
    `DELETE FROM case_attachments
     WHERE ${clauses.join(" AND ")}
     RETURNING id`,
    params
  );
  return result.rowCount > 0;
}

module.exports = {
  listAttachmentsByCaseId,
  getAttachmentById,
  getAttachmentForCase,
  createAttachment,
  deleteAttachment,
};
