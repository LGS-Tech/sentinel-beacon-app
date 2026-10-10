const {
  listAttachmentsByCaseId,
  getAttachmentForCase,
  getAttachmentRowForCase,
  createAttachment,
  deleteAttachment,
} = require("../db/queries/attachments");
const { getCaseById } = require("../db/queries/cases");
const { requireRequestOrganization } = require("../db/orgScope");
const { canViewCase, canModifyCase } = require("../utils/casePolicy");
const r2 = require("../storage/r2");
const { validateVaultFile, objectKey } = require("../storage/vaultFiles");

function clientError(res, err, fallbackStatus, fallbackMessage) {
  const status = err.status || fallbackStatus;
  const message =
    err.status && err.message ? err.message : fallbackMessage;
  return res.status(status).json({ error: message });
}

// Sends 403 when the session has no organisation, 404 when the case is
// outside that organisation or hidden by role, and 403 when a write is
// not allowed. Returns the organisation id when the caller may continue.
async function checkCaseAccess(req, res, { modify = false } = {}) {
  const organizationId = requireRequestOrganization(req, res);
  if (organizationId == null) return null;

  const found = await getCaseById(req.params.caseId, organizationId);
  if (!canViewCase(req.user, found)) {
    res.status(404).json({ error: "Case not found" });
    return null;
  }
  if (modify && !canModifyCase(req.user, found)) {
    res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    return null;
  }
  return organizationId;
}

const listCaseAttachments = async (req, res) => {
  try {
    const organizationId = await checkCaseAccess(req, res);
    if (organizationId == null) return;
    const { caseId } = req.params;
    const items = await listAttachmentsByCaseId(caseId, organizationId);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list attachments" });
  }
};

const getCaseAttachment = async (req, res) => {
  try {
    const organizationId = await checkCaseAccess(req, res);
    if (organizationId == null) return;
    const { caseId, attachmentId } = req.params;
    const found = await getAttachmentForCase(
      caseId,
      attachmentId,
      organizationId
    );
    if (!found) {
      return res.status(404).json({ error: "Attachment not found" });
    }
    res.json(found);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch attachment" });
  }
};

const getCaseAttachmentContent = async (req, res) => {
  try {
    const organizationId = await checkCaseAccess(req, res);
    if (organizationId == null) return;
    const { caseId, attachmentId } = req.params;
    const row = await getAttachmentRowForCase(
      caseId,
      attachmentId,
      organizationId
    );
    if (!row) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    if (row.storage_provider !== "r2" && row.storage_provider !== "s3") {
      return res.status(409).json({
        error: "This attachment is not stored in object storage.",
      });
    }

    const object = await r2.getObject(row.storage_url);
    const bytes = await object.Body.transformToByteArray();

    res.setHeader(
      "Content-Type",
      row.mime_type || "application/octet-stream"
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${String(row.filename).replace(/"/g, "")}"`
    );
    res.send(Buffer.from(bytes));
  } catch (err) {
    return clientError(res, err, 500, "Failed to open attachment");
  }
};

const addCaseAttachment = async (req, res) => {
  const { caseId } = req.params;
  let uploadedKey = null;

  try {
    const organizationId = await checkCaseAccess(req, res, { modify: true });
    if (organizationId == null) return;

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        error: "Upload a file in the file field (TXT, PDF, JPG, or PNG).",
      });
    }

    const check = validateVaultFile({
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
    if (!check.ok) {
      return res.status(check.status).json({ error: check.error });
    }

    if (!r2.isConfigured()) {
      return res.status(503).json({
        error: "File storage is not configured.",
      });
    }

    uploadedKey = objectKey(caseId, check.ext);
    await r2.putObject({
      key: uploadedKey,
      body: file.buffer,
      contentType: check.mimeType,
    });

    const uploadedByUserId = req.user?.userId ?? req.user?.id ?? null;

    const created = await createAttachment(
      caseId,
      {
        filename: check.filename,
        mimeType: check.mimeType,
        storageUrl: uploadedKey,
        storageProvider: "r2",
        fileSizeBytes: file.size,
        uploadedByUserId,
      },
      organizationId
    );

    if (!created) {
      await r2.deleteObject(uploadedKey);
      return res.status(404).json({ error: "Case not found" });
    }

    res.status(201).json(created);
  } catch (err) {
    if (uploadedKey) {
      try {
        await r2.deleteObject(uploadedKey);
      } catch {
        // already logged in r2 helper
      }
    }
    return clientError(res, err, 400, "Failed to add attachment");
  }
};

const removeCaseAttachment = async (req, res) => {
  try {
    const organizationId = await checkCaseAccess(req, res, { modify: true });
    if (organizationId == null) return;
    const { caseId, attachmentId } = req.params;
    const row = await getAttachmentRowForCase(
      caseId,
      attachmentId,
      organizationId
    );
    if (!row) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    // Confirm Postgres metadata is gone before touching R2. Deleting the
    // object first could leave a row pointing at a missing file.
    const removed = await deleteAttachment(
      caseId,
      attachmentId,
      organizationId
    );
    if (!removed) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    if (row.storage_provider === "r2" || row.storage_provider === "s3") {
      try {
        await r2.deleteObject(row.storage_url);
      } catch (storageErr) {
        console.error(
          "R2 delete after metadata removal failed:",
          storageErr.name || "Error"
        );
      }
    }

    res.sendStatus(204);
  } catch (err) {
    return clientError(res, err, 500, "Failed to remove attachment");
  }
};

module.exports = {
  listCaseAttachments,
  getCaseAttachment,
  getCaseAttachmentContent,
  addCaseAttachment,
  removeCaseAttachment,
};
