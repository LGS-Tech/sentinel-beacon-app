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

require("dotenv").config();
const r2 = require("../storage/r2");
const { randomUUID } = require("crypto");

async function r2RoundTrip() {
  if (!r2.isConfigured()) {
    console.log(
      "R2 upload/retrieval skipped: set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME. No credentials were printed."
    );
    return;
  }

  const key = `vault/smoke/${randomUUID()}.txt`;
  const body = Buffer.from("vault-r2-smoke");
  await r2.putObject({ key, body, contentType: "text/plain" });
  const object = await r2.getObject(key);
  const bytes = Buffer.from(await object.Body.transformToByteArray());
  assert.strictEqual(bytes.toString("utf8"), "vault-r2-smoke");
  await r2.deleteObject(key);
  console.log("R2 upload/retrieval smoke ok");
}

r2RoundTrip().catch((err) => {
  console.error("R2 upload/retrieval failed:", err.name || "Error");
  process.exit(1);
});
