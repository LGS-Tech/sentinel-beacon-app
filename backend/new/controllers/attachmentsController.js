const {
  listAttachmentsByCaseId,
  getAttachmentForCase,
  getAttachmentRowForCase,
  createAttachment,
  deleteAttachment,
} = require("../db/queries/attachments");
const { getCaseById } = require("../db/queries/cases");
const { canViewCase, canModifyCase } = require("../utils/casePolicy");
const r2 = require("../storage/r2");
const { validateVaultFile, objectKey, contentPath } = require("../storage/vaultFiles");

function clientError(res, err, fallbackStatus, fallbackMessage) {
  const status = err.status || err.statusCode || fallbackStatus;
  const message = err.status || err.statusCode ? err.message : fallbackMessage;
  return res.status(status).json({ error: message || fallbackMessage });
}

// Sends 404 (case hidden from this user) or 403 (visible, not modifiable)
// and returns false when the user may not act on the parent case.
async function checkCaseAccess(req, res, { modify = false } = {}) {
  const found = await getCaseById(req.params.caseId);
  if (!canViewCase(req.user, found)) {
    res.status(404).json({ error: "Case not found" });
    return false;
  }
  if (modify && !canModifyCase(req.user, found)) {
    res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    return false;
  }
  return true;
}

const listCaseAttachments = async (req, res, next) => {
  try {
    if (!(await checkCaseAccess(req, res))) return;
    const { caseId } = req.params;
    const items = await listAttachmentsByCaseId(caseId);
    res.json(items);
  } catch (err) {
    return next(err);
  }
};

const getCaseAttachment = async (req, res, next) => {
  try {
    if (!(await checkCaseAccess(req, res))) return;
    const { caseId, attachmentId } = req.params;
    const found = await getAttachmentForCase(caseId, attachmentId);
    if (!found) {
      return res.status(404).json({ error: "Attachment not found" });
    }
    res.json(found);
  } catch (err) {
    return next(err);
  }
};

const getCaseAttachmentContent = async (req, res, next) => {
  try {
    if (!(await checkCaseAccess(req, res))) return;
    const { caseId, attachmentId } = req.params;
    const row = await getAttachmentRowForCase(caseId, attachmentId);
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

    res.setHeader("Content-Type", row.mime_type || "application/pdf");
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

const addCaseAttachment = async (req, res, next) => {
  const { caseId } = req.params;
  let uploadedKey = null;

  try {
    if (!(await checkCaseAccess(req, res, { modify: true }))) return;

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        error: "Upload a PDF in the file field.",
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
    const created = await createAttachment(caseId, {
      filename: check.filename,
      mimeType: check.mimeType,
      storageUrl: uploadedKey,
      storageProvider: "r2",
      fileSizeBytes: file.size,
      uploadedByUserId,
    });

    if (!created) {
      await r2.deleteObject(uploadedKey);
      return res.status(404).json({ error: "Case not found" });
    }

    res.status(201).json({
      ...created,
      storageUrl: contentPath(caseId, created.id),
    });
  } catch (err) {
    if (uploadedKey) {
      try {
        await r2.deleteObject(uploadedKey);
      } catch {
        // The storage helper already logged the failure.
      }
    }
    if (err.status || err.statusCode) {
      return clientError(res, err, 400, "Failed to add attachment");
    }
    return next(err);
  }
};

const removeCaseAttachment = async (req, res, next) => {
  try {
    if (!(await checkCaseAccess(req, res, { modify: true }))) return;
    const { caseId, attachmentId } = req.params;
    const row = await getAttachmentRowForCase(caseId, attachmentId);
    if (!row) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    // Confirm Postgres metadata is gone before touching R2. Deleting the
    // object first could leave a row pointing at a missing file.
    const removed = await deleteAttachment(caseId, attachmentId);
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
