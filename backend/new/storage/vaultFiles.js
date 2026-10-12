const path = require("path");

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function extensionOf(filename) {
  return path.extname(String(filename || "")).toLowerCase();
}

function sanitizeFilename(filename) {
  const base = path.basename(String(filename || "file")).replace(/[/\\]/g, "");
  const cleaned = base.replace(/[^\w.\-()+ ]+/g, "_").trim();
  return (cleaned || "file.pdf").slice(0, 180);
}

function guessMimeFromName(filename) {
  return extensionOf(filename) === ".pdf" ? "application/pdf" : null;
}

function normalizeMime(mimeType, filename) {
  const raw = String(mimeType || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (
    raw === "application/x-pdf" ||
    raw === "application/acrobat" ||
    raw === "application/vnd.pdf"
  ) {
    return "application/pdf";
  }
  if (!raw || raw === "application/octet-stream" || raw === "binary/octet-stream") {
    return guessMimeFromName(filename);
  }
  if (raw === "application/pdf") return raw;
  return guessMimeFromName(filename);
}

function validateVaultFile({ originalname, mimetype, size }) {
  const filename = sanitizeFilename(originalname);
  const ext = extensionOf(filename);
  const mimeType = normalizeMime(mimetype, filename);

  if (ext !== ".pdf" || mimeType !== "application/pdf") {
    return {
      ok: false,
      status: 400,
      error: "Only PDF files can be uploaded.",
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
  sanitizeFilename,
  guessMimeFromName,
  validateVaultFile,
  contentPath,
  objectKey,
};
