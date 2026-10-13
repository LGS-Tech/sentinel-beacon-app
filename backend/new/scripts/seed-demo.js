/**
 * Seed the demo users for local development and demos.
 *
 * Usage (from backend/new, after `npm run db:setup`):
 *   DEMO_SEED_PASSWORD=... npm run db:seed-demo
 *
 * - Refuses to run when NODE_ENV=production.
 * - Every demo user gets the password from DEMO_SEED_PASSWORD (at least 8
 *   characters), stored as a bcrypt hash. It is never logged.
 * - Users that already exist (same email or username) are left untouched, so
 *   the script is safe to run again.
 */
require("dotenv").config({ quiet: true });

const MIN_PASSWORD_LENGTH = 8;

// departmentSlug refers to the departments seeded by db/schema.sql.
const DEMO_USERS = [
  {
    username: "jimstevens322",
    email: "jimstevens@gmail.com",
    name: "Jim",
    phone: "+4476338674998",
    role: "Art teacher",
    authorisation: 2,
    userType: "staff",
  },
  {
    username: "markdavis99",
    email: "markdavis@gmail.com",
    name: "Mark",
    phone: "+447658713447",
    role: "Maths teacher",
    authorisation: 2,
    userType: "staff",
  },
  {
    username: "lindsaywilliams1874",
    email: "lindsaywilliams@gmail.com",
    name: "Lindsay",
    phone: "+447566345922",
    role: "Head teacher",
    authorisation: 1,
    userType: "lead",
  },
  {
    username: "ellamcintosh111",
    email: "ellamcintosh@gmail.com",
    name: "Ella",
    phone: "+447455698236",
    role: "English teacher",
    authorisation: 2,
    userType: "staff",
  },
  {
    username: "patel.estates",
    email: "estates@lgs.ac.uk",
    name: "Priya Patel",
    phone: "+447400100501",
    role: "Estates maintainer",
    authorisation: 2,
    userType: "maintainer",
    departmentSlug: "estates",
    collegeId: "STAFF-EST-01",
  },
  {
    username: "chen.it",
    email: "itsupport@lgs.ac.uk",
    name: "Wei Chen",
    phone: "+447400100502",
    role: "IT technician",
    authorisation: 2,
    userType: "maintainer",
    departmentSlug: "it-support",
    collegeId: "STAFF-IT-04",
  },
  {
    username: "aisha.student",
    email: "aisha.khan@student.lgs.ac.uk",
    name: "Aisha Khan",
    phone: "+447400100601",
    role: "Student",
    authorisation: 2,
    userType: "student",
    collegeId: "LGS-2026-4412",
  },
];

// Throws with a message safe to print: it never includes the password.
function resolveSeedConfig(env = process.env) {
  if (String(env.NODE_ENV ?? "").trim().toLowerCase() === "production") {
    throw new Error("Refusing to seed demo users when NODE_ENV=production");
  }

  const password = env.DEMO_SEED_PASSWORD;
  if (typeof password !== "string" || password.length === 0) {
    throw new Error("DEMO_SEED_PASSWORD is not set");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `DEMO_SEED_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`
    );
  }

  return { password };
}

async function main() {
  const { password } = resolveSeedConfig();

  // Loaded here so a refusal is reported without needing a database.
  const bcrypt = require("bcrypt");
  const db = require("../db");

  let created = 0;
  let skipped = 0;

  try {
    for (const { departmentSlug, ...user } of DEMO_USERS) {
      if (
        (await db.users.getUserByEmail(user.email)) ||
        (await db.users.getUserByUsername(user.username))
      ) {
        skipped++;
        continue;
      }

      let departmentId = null;
      if (departmentSlug) {
        const result = await db.pool.query(
          "SELECT id FROM departments WHERE slug = $1",
          [departmentSlug]
        );
        if (!result.rows[0]) {
          throw new Error(
            `Department ${departmentSlug} is missing; run npm run db:setup first`
          );
        }
        departmentId = result.rows[0].id;
      }

      await db.users.createUser({
        ...user,
        departmentId,
        password: await bcrypt.hash(password, 10),
      });
      created++;
    }

    console.log(
      `Demo seed done. Created: ${created}, already present (skipped): ${skipped}`
    );
  } finally {
    await db.pool.pool.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(`db:seed-demo failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { resolveSeedConfig, DEMO_USERS, MIN_PASSWORD_LENGTH };
