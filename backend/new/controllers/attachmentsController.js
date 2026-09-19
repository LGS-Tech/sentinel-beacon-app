const {
  listAttachmentsByCaseId,
  getAttachmentForCase,
  createAttachment,
  deleteAttachment,
} = require("../db/queries/attachments");

const listCaseAttachments = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const items = await listAttachmentsByCaseId(caseId);
    res.json(items);
  } catch (err) {
    return next(err);
  }
};

const getCaseAttachment = async (req, res, next) => {
  try {
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
