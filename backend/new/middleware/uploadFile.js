const multer = require("multer");
const { MAX_FILE_BYTES, validateVaultFile } = require("../storage/vaultFiles");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
  fileFilter(_req, file, cb) {
    const check = validateVaultFile({
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: 1,
    });
    if (!check.ok) {
      const err = new Error(check.error);
      err.status = check.status;
      err.code = "INVALID_FILE_TYPE";
      return cb(err);
    }
    cb(null, true);
  },
});

function handleVaultUpload(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "File is too large. Maximum size is 10 MB.",
      });
    }

    const status = err.status || 400;
    return res.status(status).json({
      error: err.message || "Upload failed. Please try again.",
    });
  });
}

module.exports = { handleVaultUpload };
