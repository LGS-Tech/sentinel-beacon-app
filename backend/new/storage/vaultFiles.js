const path = require("path");

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const ALLOWED_TYPES = {
  ".txt": "text/plain",
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

const ALLOWED_MIME = new Set(Object.values(ALLOWED_TYPES));

function extensionOf(filename) {
  return path.extname(String(filename || "")).toLowerCase();
}

function sanitizeFilename(filename) {
  const base = path.basename(String(filename || "file")).replace(/[/\\]/g, "");
  const cleaned = base.replace(/[^\w.\-()+ ]+/g, "_").trim();
  return (cleaned || "file").slice(0, 180);
}

function guessMimeFromName(filename) {
  return ALLOWED_TYPES[extensionOf(filename)] || null;
}

function normalizeMime(mimeType, filename) {
  const raw = String(mimeType || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (raw === "image/jpg") return "image/jpeg";
  if (!raw || raw === "application/octet-stream") {
    return guessMimeFromName(filename);
  }
  if (ALLOWED_MIME.has(raw)) return raw;
  return guessMimeFromName(filename);
}

function validateVaultFile({ originalname, mimetype, size }) {
  const filename = sanitizeFilename(originalname);
  const ext = extensionOf(filename);
  const mimeType = normalizeMime(mimetype, filename);

  if (!ALLOWED_TYPES[ext]) {
    return {
      ok: false,
      status: 400,
      error: "Only TXT, PDF, JPG, and PNG files can be uploaded.",
    };
  }

  if (!mimeType || mimeType !== ALLOWED_TYPES[ext]) {
    return {
      ok: false,
      status: 400,
      error: "File type does not match the file extension.",
    };
  }

  if (!Number.isFinite(size) || size <= 0) {
    return {
      ok: false,
      status: 400,
      error: "The uploaded file is empty.",
    };
  }

  if (size > MAX_FILE_BYTES) {
    return {
      ok: false,
      status: 413,
      error: "File is too large. Maximum size is 10 MB.",
    };
  }

  return { ok: true, filename, mimeType, ext };
}

function contentPath(caseId, attachmentId) {
  return `/cases/${caseId}/attachments/${attachmentId}/content`;
}

function objectKey(caseId, ext) {
  const { randomUUID } = require("crypto");
  return `vault/${caseId}/${randomUUID()}${ext}`;
}

module.exports = {
  MAX_FILE_BYTES,
  ALLOWED_TYPES,
  sanitizeFilename,
  guessMimeFromName,
  validateVaultFile,
  contentPath,
  objectKey,
};
