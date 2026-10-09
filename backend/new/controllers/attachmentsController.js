const {
  listAttachmentsByCaseId,
  getAttachmentForCase,
  createAttachment,
  deleteAttachment,
} = require("../db/queries/attachments");
const { getCaseById } = require("../db/queries/cases");
const { canViewCase, canModifyCase } = require("../utils/casePolicy");

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

const addCaseAttachment = async (req, res, next) => {
  const { filename, storageUrl } = req.body;

  if (!filename || !storageUrl) {
    return res.status(400).json({
      error: "filename and storageUrl are required",
    });
  }

  try {
    if (!(await checkCaseAccess(req, res, { modify: true }))) return;
    const { caseId } = req.params;
    const uploadedByUserId =
      req.user?.userId ?? req.user?.id ?? req.body.uploadedByUserId ?? null;

    const created = await createAttachment(caseId, {
      ...req.body,
      uploadedByUserId,
    });

    if (!created) {
      return res.status(404).json({ error: "Case not found" });
    }

    res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
};

const removeCaseAttachment = async (req, res, next) => {
  try {
    if (!(await checkCaseAccess(req, res, { modify: true }))) return;
    const { caseId, attachmentId } = req.params;
    const removed = await deleteAttachment(caseId, attachmentId);
    if (!removed) {
      return res.status(404).json({ error: "Attachment not found" });
    }
    res.sendStatus(204);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listCaseAttachments,
  getCaseAttachment,
  addCaseAttachment,
  removeCaseAttachment,
};
