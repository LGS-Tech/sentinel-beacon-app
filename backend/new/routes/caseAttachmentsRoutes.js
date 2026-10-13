const express = require("express");
const router = express.Router({ mergeParams: true });
const { authenticate } = require("../middleware/auth");
const { validateUuidParam } = require("../middleware/validateUuid");
const { handleVaultUpload } = require("../middleware/uploadFile");

const {
  listCaseAttachments,
  getCaseAttachment,
  getCaseAttachmentContent,
  addCaseAttachment,
  removeCaseAttachment,
} = require("../controllers/attachmentsController");

router.use(authenticate);

router.param("attachmentId", validateUuidParam);

router.get("/", listCaseAttachments);
router.post("/", handleVaultUpload, addCaseAttachment);
router.get("/:attachmentId/content", getCaseAttachmentContent);
router.get("/:attachmentId", getCaseAttachment);
router.delete("/:attachmentId", removeCaseAttachment);

module.exports = router;
