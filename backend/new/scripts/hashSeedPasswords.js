require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("../db");

function isBcryptHash(value) {
  return typeof value === "string" && /^\$2[aby]\$/.test(value);
}

async function main() {
  const { rows: users } = await db.pool.query("SELECT id, password FROM users");

  let updated = 0;
  let skipped = 0;

  for (const user of users) {
    if (isBcryptHash(user.password)) {
      skipped++;
      continue;
    }

    const hashed = await bcrypt.hash(user.password, 10);
    await db.pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashed,
      user.id,
    ]);
    updated++;
  }

  console.log(`Done. Hashed: ${updated}, already hashed (skipped): ${skipped}`);
}

main()
  .then(async () => {
    await db.pool.pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Migration failed:", err.message);
    try {
      await db.pool.pool.end();
    } catch {}
    process.exit(1);
  });