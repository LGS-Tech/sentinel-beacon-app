const test = require("node:test");
const assert = require("node:assert/strict");
const { validateVaultFile, contentPath } = require("../storage/vaultFiles");

test("accepts a PDF with a matching type", () => {
  const result = validateVaultFile({
    originalname: "incident report.pdf",
    mimetype: "application/pdf",
    size: 1200,
  });
  assert.equal(result.ok, true);
  assert.equal(result.mimeType, "application/pdf");
  assert.equal(result.ext, ".pdf");
});

test("accepts a PDF when the browser omits a specific type", () => {
  const result = validateVaultFile({
    originalname: "scan.PDF",
    mimetype: "application/octet-stream",
    size: 8,
  });
  assert.equal(result.ok, true);
  assert.equal(result.filename, "scan.PDF");
});

test("rejects files that are not PDFs", () => {
  const result = validateVaultFile({
    originalname: "notes.txt",
    mimetype: "text/plain",
    size: 20,
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
});

test("rejects an empty PDF and a PDF over 10 MB", () => {
  assert.equal(
    validateVaultFile({
      originalname: "empty.pdf",
      mimetype: "application/pdf",
      size: 0,
    }).status,
    400
  );
  assert.equal(
    validateVaultFile({
      originalname: "huge.pdf",
      mimetype: "application/pdf",
      size: 10 * 1024 * 1024 + 1,
    }).status,
    413
  );
});

test("content path stays on the authenticated API", () => {
  assert.equal(
    contentPath("case-1", "file-1"),
    "/cases/case-1/attachments/file-1/content"
  );
});
