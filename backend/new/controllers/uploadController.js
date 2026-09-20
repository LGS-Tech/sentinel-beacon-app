const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { r2, bucketName } = require("../lib/r2");
const crypto = require("crypto");

async function uploadFile(req, res) {
  try {
    const { caseId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const key = `case-${caseId}/${crypto.randomUUID()}-${file.originalname}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    const storageUrl = `https://${bucketName}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

    res.status(201).json({
      filename: file.originalname,
      mimeType: file.mimetype,
      storageUrl,
      fileSizeBytes: file.size,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
}

module.exports = { uploadFile };