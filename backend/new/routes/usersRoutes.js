const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");

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
router.post("/", createNewUser);
router.put("/:id", updateExistingUser);
router.delete("/:id", deleteExistingUser);

module.exports = router;
