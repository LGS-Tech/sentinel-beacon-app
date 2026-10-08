const express = require("express");
const router = express.Router({ mergeParams: true });
const { authenticate } = require("../middleware/auth");
const { validateUuidParam } = require("../middleware/validateUuid");

const {
  listCaseAttachments,
  getCaseAttachment,
  addCaseAttachment,
  removeCaseAttachment,
} = require("../controllers/attachmentsController");

router.use(authenticate);

router.param("attachmentId", validateUuidParam);

router.get("/", listCaseAttachments);
router.post("/", addCaseAttachment);
router.get("/:attachmentId", getCaseAttachment);
router.delete("/:attachmentId", removeCaseAttachment);

module.exports = router;
