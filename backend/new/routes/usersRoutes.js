const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");


const {
  getAllUsers,
  getUser,
  createNewUser,
  updateExistingUser,
  deleteExistingUser,
} = require("../controllers/usersController");

router.use(authenticate);

router.get("/", getAllUsers);
router.get("/:id", getUser);
router.post("/", authorize(["maintainer", "lead"]), createNewUser);
router.put("/:id", authorize(["maintainer", "lead"]), updateExistingUser);
router.delete("/:id", authorize(["maintainer", "lead"]), deleteExistingUser);

module.exports = router;
