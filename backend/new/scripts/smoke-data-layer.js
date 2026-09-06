/**
 * Smoke-test the Postgres data layer (no legacy JSON/Mongo backends).
 * Usage: node scripts/smoke-data-layer.js
 */
require("dotenv").config();

const db = require("../db");

async function main() {
  const ping = await db.pool.ping();
  console.log("ping", ping.now);

  const departments = await db.departments.listDepartments();
  console.log(
    "departments",
    departments.length,
    departments.map((d) => d.name).join(", ")
  );

  const users = await db.users.listUsers({ activeOnly: false });
  console.log("users", users.length);

  const created = await db.cases.createCase({
    title: "Maintenance Case",
    category: "Maintenance",
    status: "ACTIVE",
    locationX: 0.5,
    locationY: 0.5,
    locationLabel: "Cafeteria",
    createdByUserId: 7,
    description: "Broken tap (data-layer smoke test)",
  });
  console.log("created case", created.id, created.category, created.status);

  const assigned = await db.cases.assignCase(created.id, {
    departmentId: 6,
    userId: 5,
    actorUserId: 3,
  });
  console.log(
    "assigned",
    assigned.assignedDepartmentName,
    assigned.assignedUserName,
    assigned.status
  );

  const closed = await db.cases.closeCase(created.id, { actorUserId: 5 });
  console.log("closed", closed.status, closed.closedAt);

  const analytics = await db.cases.analyticsSummary();
  console.log("analytics", {
    active: analytics.active,
    closed: analytics.closed,
    total: analytics.total,
  });

  await db.cases.deleteCase(created.id);
  console.log("smoke case deleted");
}

main()
  .then(async () => {
    await db.pool.pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("data-layer smoke failed:", err.message);
    try {
      await db.pool.pool.end();
    } catch {
      // ignore
    }
    process.exit(1);
  });
