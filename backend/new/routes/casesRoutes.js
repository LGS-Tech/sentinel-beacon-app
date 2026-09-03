const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");

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


router.get("/", getAllCases);
router.get("/analytics", getAnalyticsSummary);
router.post("/assign", assignCaseToUser);
router.get("/:id", getCase);
router.post("/", createNewCase);
router.put("/:id", updateExistingCase);
router.delete("/:id", deleteExistingCase);
router.post("/assign", assignCaseToUser);
router.get("/analytics", getAnalyticsSummary);

module.exports = router;

