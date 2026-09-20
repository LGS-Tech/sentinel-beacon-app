const express = require("express");
const router = express.Router({ mergeParams: true });
const multer = require("multer");

const { authenticate } = require("../middleware/auth");
const { uploadFile } = require("../controllers/uploadController");

const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.post("/", upload.single("file"), uploadFile);

module.exports = router;