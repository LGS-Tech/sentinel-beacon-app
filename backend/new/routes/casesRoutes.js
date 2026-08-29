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
} = require("../controllers/casesController");

router.use(authenticate); 


router.get("/", getAllCases);
router.get("/:id", getCase);
router.post("/", createNewCase);
router.put("/:id", updateExistingCase);
router.delete("/:id", deleteExistingCase);
router.post("/assign", assignCaseToUser);

module.exports = router;

