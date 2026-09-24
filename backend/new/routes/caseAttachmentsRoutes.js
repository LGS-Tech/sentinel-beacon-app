const express = require("express");
const router = express.Router({ mergeParams: true });
const { authenticate } = require("../middleware/auth");
const { handleVaultUpload } = require("../middleware/uploadFile");

const {
  listCaseAttachments,
  getCaseAttachment,
  getCaseAttachmentContent,
  addCaseAttachment,
  removeCaseAttachment,
} = require("../controllers/attachmentsController");

router.use(authenticate);

router.get("/", listCaseAttachments);
router.post("/", handleVaultUpload, addCaseAttachment);
router.get("/:attachmentId/content", getCaseAttachmentContent);
router.get("/:attachmentId", getCaseAttachment);
router.delete("/:attachmentId", removeCaseAttachment);

module.exports = router;
