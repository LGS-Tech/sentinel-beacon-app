const {
  listAttachmentsByCaseId,
  getAttachmentForCase,
  createAttachment,
  deleteAttachment,
} = require("../db/queries/attachments");

const listCaseAttachments = async (req, res) => {
  try {
    const { caseId } = req.params;
    const items = await listAttachmentsByCaseId(caseId);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list attachments" });
  }
};

const getCaseAttachment = async (req, res) => {
  try {
    const { caseId, attachmentId } = req.params;
    const found = await getAttachmentForCase(caseId, attachmentId);
    if (!found) {
      return res.status(404).json({ error: "Attachment not found" });
    }
    res.json(found);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch attachment" });
  }
};

const addCaseAttachment = async (req, res) => {
  try {
    const { caseId } = req.params;
    const uploadedByUserId =
      req.body.uploadedByUserId ?? req.user?.userId ?? req.user?.id ?? null;

    const created = await createAttachment(caseId, {
      ...req.body,
      uploadedByUserId,
    });

    if (!created) {
      return res.status(404).json({ error: "Case not found" });
    }

    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to add attachment" });
  }
};

const removeCaseAttachment = async (req, res) => {
  try {
    const { caseId, attachmentId } = req.params;
    const removed = await deleteAttachment(caseId, attachmentId);
    if (!removed) {
      return res.status(404).json({ error: "Attachment not found" });
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: "Failed to remove attachment" });
  }
};

module.exports = {
  listCaseAttachments,
  getCaseAttachment,
  addCaseAttachment,
  removeCaseAttachment,
};
