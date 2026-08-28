/**
 * Smoke-test case attachment metadata CRUD.
 * Usage: node scripts/smoke-attachments.js
 */
require("dotenv").config();

const db = require("../db");

async function main() {
  const created = await db.cases.createCase({
    title: "Maintenance Case",
    category: "Maintenance",
    locationLabel: "Cafeteria",
    createdByUserId: 7,
  });
  console.log("case", created.id);

  const attachment = await db.attachments.createAttachment(created.id, {
    filename: "tap-photo.jpg",
    mimeType: "image/jpeg",
    storageUrl: "https://example.com/vault/tap-photo.jpg",
    storageProvider: "external",
    fileSizeBytes: 102400,
    uploadedByUserId: 7,
  });
  console.log("attachment", attachment.id, attachment.filename);

  const list = await db.attachments.listAttachmentsByCaseId(created.id);
  console.log("list count", list.length);

  const one = await db.attachments.getAttachmentForCase(
    created.id,
    attachment.id
  );
  console.log("get one", one.storageUrl);

  await db.attachments.deleteAttachment(created.id, attachment.id);
  console.log("deleted");

  const after = await db.attachments.listAttachmentsByCaseId(created.id);
  console.log("list after delete", after.length);

  await db.cases.deleteCase(created.id);
  console.log("case cleaned up");
}

main()
  .then(async () => {
    await db.pool.pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("attachments smoke failed:", err.message);
    try {
      await db.pool.pool.end();
    } catch {
      // ignore
    }
    process.exit(1);
  });
