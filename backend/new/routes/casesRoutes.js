const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { validateUuidParam } = require("../middleware/validateUuid");
const caseAttachmentsRoutes = require("./caseAttachmentsRoutes");
const {
  CASE_DELETE_ROLES,
  CASE_ANALYTICS_ROLES,
  CASE_ASSIGN_ROLES,
} = require("../utils/casePolicy");

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
router.get("/analytics", authorize(CASE_ANALYTICS_ROLES), getAnalyticsSummary);
router.post("/assign", authorize(CASE_ASSIGN_ROLES), assignCaseToUser);
router.use("/:caseId/attachments", caseAttachmentsRoutes);
router.get("/:id", getCase);
router.post("/", createNewCase);
router.put("/:id", updateExistingCase);
router.delete("/:id", authorize(CASE_DELETE_ROLES), deleteExistingCase);

module.exports = router;

