const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");

const {
    getAllDepartments,
    getDepartment
} = require("../controllers/departmentController");

router.use(authenticate);

router.get("/", getAllDepartments);
router.get("/:id", getDepartment);


module.exports = router;