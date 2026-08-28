/**
 * Nested under /api/cases/:caseId/attachments
 * Mount from casesRoutes.js BEFORE router.get("/:id", ...) so :id does not swallow "attachments".
 */
const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  listCaseAttachments,
  getCaseAttachment,
  addCaseAttachment,
  removeCaseAttachment,
} = require("../controllers/attachmentsController");

// When merging with feature/core-api-auth, add authenticate here:
// const { authenticate } = require("../middleware/auth");
// router.use(authenticate);

router.get("/", listCaseAttachments);
router.post("/", addCaseAttachment);
router.get("/:attachmentId", getCaseAttachment);
router.delete("/:attachmentId", removeCaseAttachment);

module.exports = router;
