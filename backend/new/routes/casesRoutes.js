const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const caseAttachmentsRoutes = require("./caseAttachmentsRoutes");

const {
  getAllCases,
  getCase,
  createNewCase,
  updateExistingCase,
  deleteExistingCase,
  assignCaseToUser,
} = require("../controllers/casesController");

router.use(authenticate);

router.get("/", getAllCases);
router.post("/assign", assignCaseToUser);
router.use("/:caseId/attachments", caseAttachmentsRoutes);
router.get("/:id", getCase);
router.post("/", createNewCase);
router.put("/:id", updateExistingCase);
router.delete("/:id", deleteExistingCase);

module.exports = router;
