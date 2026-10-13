/**
 * Proves organisation columns and scoped queries.
 * Does not call HTTP and does not read a client-supplied organisation id.
 *
 * Usage (from backend/new, local Postgres only):
 *   npm run db:setup
 *   npm run db:smoke-org
 */
require("dotenv").config();

const db = require("../db");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const demo = await db.organisations.getDefaultOrganisation();
  assert(demo && demo.slug === "lgs-demo", "default organisation lgs-demo is missing");

  const demoUsers = await db.users.listUsers({
    activeOnly: false,
    organizationId: demo.id,
  });
  assert(demoUsers.length > 0, "demo users were not backfilled onto lgs-demo");
  assert(
    demoUsers.every((user) => user.organizationId === demo.id),
    "a demo user is missing organizationId"
  );

  const stamp = Date.now();
  const other = await db.organisations.createOrganisation({
    name: `Org Isolation ${stamp}`,
    slug: `org-isolation-${stamp}`,
  });

  let department = null;
  let user = null;
  let scopedCase = null;

  try {
    department = await db.departments.createDepartment({
      name: `Smoke Dept ${stamp}`,
      slug: `smoke-dept-${stamp}`,
      kind: "other",
      organizationId: other.id,
    });
    user = await db.users.createUser(
      {
        username: `orgsmoke${stamp}`,
        password: "smoke-only",
        email: `orgsmoke${stamp}@example.com`,
        name: "Org Smoke",
        userType: "staff",
      },
      other.id
    );
    scopedCase = await db.cases.createCase(
      {
        title: "Maintenance Case",
        category: "Maintenance",
        description: "org isolation smoke",
        locationLabel: "Smoke lab",
      },
      other.id
    );
    assert(
      scopedCase.organizationId === other.id,
      "createCase did not store the passed organisation"
    );

    const hiddenFromDemo = await db.cases.listCases({ organizationId: demo.id });
    assert(
      !hiddenFromDemo.some((row) => row.id === scopedCase.id),
      "demo organisation list included the other organisation's case"
    );

    const visible = await db.cases.listCases({ organizationId: other.id });
    assert(
      visible.some((row) => row.id === scopedCase.id),
      "organisation list missed the scoped case"
    );
    assert(
      visible.every((row) => row.organizationId === other.id),
      "organisation list mixed rows from another organisation"
    );

    const denied = await db.cases.getCaseById(scopedCase.id, demo.id);
    assert(denied == null, "getCaseById returned a case from another organisation");

    const otherDepartments = await db.departments.listDepartments({
      organizationId: other.id,
      activeOnly: false,
    });
    assert(
      otherDepartments.some((row) => row.id === department.id),
      "department list missed the scoped department"
    );
    const demoDepartments = await db.departments.listDepartments({
      organizationId: demo.id,
      activeOnly: false,
    });
    assert(
      !demoDepartments.some((row) => row.id === department.id),
      "department list leaked a department from another organisation"
    );

    const otherUsers = await db.users.listUsers({
      organizationId: other.id,
      activeOnly: false,
    });
    assert(
      otherUsers.some((row) => row.id === user.id) &&
        otherUsers.every((row) => row.organizationId === other.id),
      "user list filter did not stay inside the organisation"
    );

    const attachment = await db.attachments.createAttachment(
      scopedCase.id,
      {
        filename: "smoke.txt",
        storageUrl: "https://example.invalid/org-smoke.txt",
        storageProvider: "external",
      },
      other.id
    );
    assert(
      attachment && attachment.organizationId === other.id,
      "attachment was not stored on the case organisation"
    );
    const leakedFiles = await db.attachments.listAttachmentsByCaseId(
      scopedCase.id,
      demo.id
    );
    assert(
      leakedFiles.length === 0,
      "attachment list ignored the organisation filter"
    );

    const summary = await db.cases.analyticsSummary(other.id);
    assert(summary.total >= 1, "analytics summary ignored the organisation filter");

    console.log("org isolation smoke ok", {
      defaultOrganisationId: demo.id,
      otherOrganisationId: other.id,
    });
  } finally {
    if (scopedCase) await db.cases.deleteCase(scopedCase.id, other.id);
    if (user) await db.users.deleteUser(user.id, other.id);
    if (department) await db.departments.deleteDepartment(department.id, other.id);
    if (other) await db.organisations.deleteOrganisation(other.id);
  }
}

main()
  .then(async () => {
    await db.pool.pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("org isolation smoke failed:", err.message);
    try {
      await db.pool.pool.end();
    } catch {
      // ignore
    }
    process.exit(1);
  });
