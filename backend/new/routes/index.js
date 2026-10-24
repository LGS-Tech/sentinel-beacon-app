const express = require("express");
const router = express.Router();

const casesRoutes = require("./casesRoutes");
const usersRoutes = require("./usersRoutes");
const authRoutes = require("./authRoutes");
const departmentRoutes = require("./departmentRoutes");
const floorPlansRoutes = require("./floorPlansRoutes");

router.use("/auth", authRoutes);
router.use("/cases", casesRoutes);
router.use("/users", usersRoutes);
router.use("/departments", departmentRoutes);
router.use("/floors", floorPlansRoutes);

module.exports = router;
