const express = require("express");
const router = express.Router();

const casesRoutes = require("./casesRoutes");
const usersRoutes = require("./usersRoutes");
const authRoutes = require("./authRoutes");



router.use("/auth", authRoutes);  
router.use("/cases", casesRoutes); 
router.use("/users", usersRoutes); 

module.exports = router;
