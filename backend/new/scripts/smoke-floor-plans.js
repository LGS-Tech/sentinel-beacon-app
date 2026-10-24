/**
 * Floor-plan validator + metadata smoke tests.
 * Usage: node scripts/smoke-floor-plans.js
 *
 * Validator always runs. Metadata CRUD needs DATABASE_URL / local Postgres.
 * R2 is not required for this script (bytes stay out of the smoke path).
 */
require("dotenv").config();

const assert = require("assert");
const {
  validateFloorPlanFile,
  parseFloorId,
} = require("../storage/floorPlans");

function expectOk(file, mime) {
  const result = validateFloorPlanFile({
    originalname: file,
    mimetype: mime,
    size: 128,
  });
  assert.strictEqual(result.ok, true, `${file} should be allowed`);
}

function expectFail(file, mime, size = 128) {
  const result = validateFloorPlanFile({
    originalname: file,
    mimetype: mime,
    size,
  });
  assert.strictEqual(result.ok, false, `${file} should be rejected`);
}

assert.strictEqual(parseFloorId("1"), "1");
assert.strictEqual(parseFloorId("2"), "2");
assert.strictEqual(parseFloorId("3"), null);

expectOk("plan.jpg", "image/jpeg");
expectOk("plan.jpeg", "image/jpeg");
expectOk("plan.png", "image/png");
expectFail("notes.txt", "text/plain");
expectFail("report.pdf", "application/pdf");
expectFail("payload.exe", "application/octet-stream");
expectFail("empty.png", "image/png", 0);

console.log("floor plan validation smoke ok");

async function metadataRoundTrip() {
  if (!process.env.DATABASE_URL) {
    console.log(
      "floor plan metadata skipped: DATABASE_URL is not set. No credentials were printed."
    );
    return;
  }

  const db = require("../db");
  try {
    await db.ping();
  } catch {
    console.log(
      "floor plan metadata skipped: Postgres is not reachable with DATABASE_URL. No credentials were printed."
    );
    try {
      await db.pool.pool.end();
    } catch {
      // ignore
    }
    return;
  }

  const stamp = Date.now();
  const filename = `smoke-floor-${stamp}.png`;
  let org = null;
  let other = null;

  try {
    org = await db.organisations.createOrganisation({
      name: `Floor smoke ${stamp}`,
      slug: `floor-smoke-${stamp}`,
    });
    other = await db.organisations.createOrganisation({
      name: `Floor smoke other ${stamp}`,
      slug: `floor-smoke-other-${stamp}`,
    });
    const created = await db.floorPlans.upsertFloorPlan(org.id, "1", {
      filename,
      mimeType: "image/png",
      storageUrl: `floor-plans/${org.id}/1/smoke-${stamp}.png`,
      storageProvider: "external",
      fileSizeBytes: 128,
      uploadedByUserId: null,
    });
    assert.ok(created && created.floor === "1", "upsert should return floor 1");
    assert.strictEqual(created.storageUrl, "/floors/1/content");
    assert.ok(
      !String(created.storageUrl).includes("floor-plans/"),
      "API must not return the private object key"
    );

    const listed = await db.floorPlans.listFloorPlans(org.id);
    assert.ok(
      listed.some((row) => row.filename === filename),
      "list should include the upserted plan"
    );

    const hidden = await db.floorPlans.listFloorPlans(other.id);
    assert.ok(
      !hidden.some((row) => row.filename === filename),
      "another organisation must not see this floor plan"
    );
    const opened = await db.floorPlans.getFloorPlan(other.id, "1");
    assert.strictEqual(opened, null, "cross-org get must be empty");
  } finally {
    if (org) await db.floorPlans.deleteFloorPlan(org.id, "1");
    if (other) await db.organisations.deleteOrganisation(other.id);
    if (org) await db.organisations.deleteOrganisation(org.id);
    await db.pool.pool.end();
  }

  console.log("floor plan metadata smoke ok");
}

metadataRoundTrip().catch(async (err) => {
  console.error("floor plan metadata smoke failed:", err.message);
  try {
    const db = require("../db");
    await db.pool.pool.end();
  } catch {
    // ignore
  }
  process.exit(1);
});
