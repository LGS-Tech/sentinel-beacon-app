/**
 * Validator smoke tests for Vault uploads (no R2 or Postgres required).
 * Usage: node scripts/smoke-vault-files.js
 */
const assert = require("assert");
const {
  validateVaultFile,
  sanitizeFilename,
} = require("../storage/vaultFiles");

function expectOk(file, mime) {
  const result = validateVaultFile({
    originalname: file,
    mimetype: mime,
    size: 128,
  });
  assert.strictEqual(result.ok, true, `${file} should be allowed`);
}

function expectFail(file, mime, size = 128) {
  const result = validateVaultFile({
    originalname: file,
    mimetype: mime,
    size,
  });
  assert.strictEqual(result.ok, false, `${file} should be rejected`);
}

expectOk("notes.txt", "text/plain");
expectOk("report.pdf", "application/pdf");
expectOk("photo.jpg", "image/jpeg");
expectOk("photo.jpeg", "image/jpeg");
expectOk("diagram.png", "image/png");
expectOk("photo.jpg", "image/jpg");

expectFail("payload.exe", "application/octet-stream");
expectFail("notes.txt", "application/pdf");
expectFail("photo.png", "image/jpeg");
expectFail("empty.txt", "text/plain", 0);
expectFail("huge.pdf", "application/pdf", 11 * 1024 * 1024);

assert.strictEqual(sanitizeFilename("../../etc/passwd.txt"), "passwd.txt");
assert.strictEqual(sanitizeFilename("ok file.png"), "ok file.png");

console.log("vault file validation smoke ok");
