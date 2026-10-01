const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { validateUuidParam } = require("../middleware/validateUuid");
const caseAttachmentsRoutes = require("./caseAttachmentsRoutes");

const {
  getAllCases,
  getCase,
  createNewCase,
  updateExistingCase,
  deleteExistingCase,
  assignCaseToUser,
  getAnalyticsSummary,
} = require("../controllers/casesController");

router.use(authenticate);

router.param("id", validateUuidParam);
router.param("caseId", validateUuidParam);

router.get("/", getAllCases);
router.get("/analytics", getAnalyticsSummary);
router.post("/assign", assignCaseToUser);
router.use("/:caseId/attachments", caseAttachmentsRoutes);
router.get("/:id", getCase);
router.post("/", createNewCase);
router.put("/:id", updateExistingCase);
router.delete("/:id", deleteExistingCase);

module.exports = router;

