/**
 * Two-organisation access check through the route handlers.
 * Organisation id is taken from req.user, not from the query or body.
 *
 * Usage (from backend/new, local Postgres):
 *   npm run db:setup
 *   npm run db:smoke-org-access
 */
require("dotenv").config();

const db = require("../db");
const cases = require("../controllers/casesController");
const users = require("../controllers/usersController");
const departments = require("../controllers/departmentController");
const attachments = require("../controllers/attachmentsController");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function invoke(handler, req) {
  return new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      body: undefined,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        resolve({ statusCode: this.statusCode, body: payload });
        return this;
      },
      sendStatus(code) {
        this.statusCode = code;
        resolve({ statusCode: code, body: null });
        return this;
      },
    };
    Promise.resolve(handler(req, res, (err) => reject(err))).catch(reject);
  });
}

async function main() {
  const demo = await db.organisations.getDefaultOrganisation();
  assert(demo && demo.slug === "lgs-demo", "default organisation lgs-demo is missing");

  const backfilled = await db.users.listUsers({
    activeOnly: false,
    organizationId: demo.id,
  });
  assert(backfilled.length > 0, "existing users were not backfilled onto lgs-demo");
  assert(
    backfilled.every((user) => user.organizationId === demo.id),
    "a backfilled user is missing the default organisation"
  );

  const stamp = Date.now();
  const orgA = demo;
  const orgB = await db.organisations.createOrganisation({
    name: `Access B ${stamp}`,
    slug: `access-b-${stamp}`,
  });

  const userASession = { userId: 1, userType: "lead", organizationId: orgA.id };
  let departmentB = null;
  let userB = null;
  let caseB = null;

  try {
    departmentB = await db.departments.createDepartment({
      name: `Access Dept ${stamp}`,
      slug: `access-dept-${stamp}`,
      kind: "other",
      organizationId: orgB.id,
    });
    userB = await db.users.createUser(
      {
        username: `accessb${stamp}`,
        password: "smoke-only",
        email: `accessb${stamp}@example.com`,
        name: "Access B",
        userType: "lead",
      },
      orgB.id
    );
    caseB = await db.cases.createCase(
      {
        title: "Maintenance Case",
        category: "Maintenance",
        description: "org access smoke",
        locationLabel: "Org B",
        createdByUserId: userB.id,
      },
      orgB.id
    );
    const fileB = await db.attachments.createAttachment(
      caseB.id,
      {
        filename: "secret.txt",
        storageUrl: "https://example.invalid/secret.txt",
        storageProvider: "external",
        uploadedByUserId: userB.id,
      },
      orgB.id
    );

    const userBSession = {
      userId: userB.id,
      userType: "lead",
      organizationId: orgB.id,
    };

    const caseList = await invoke(cases.getAllCases, {
      user: userASession,
      query: { organizationId: orgB.id },
    });
    assert(caseList.statusCode === 200, "same-org case list should be 200");
    assert(
      !caseList.body.some((row) => row.id === caseB.id),
      "user A listed organisation B's case"
    );

    const caseGet = await invoke(cases.getCase, {
      user: userASession,
      params: { id: caseB.id },
    });
    assert(caseGet.statusCode === 404, "user A read organisation B's case");

    const caseUpdate = await invoke(cases.updateExistingCase, {
      user: userASession,
      params: { id: caseB.id },
      body: { title: "Taken", organizationId: orgB.id },
    });
    assert(caseUpdate.statusCode === 404, "user A updated organisation B's case");

    const ownCase = await invoke(cases.getCase, {
      user: userBSession,
      params: { id: caseB.id },
    });
    assert(ownCase.statusCode === 200, "user B should read their own case");

    const userList = await invoke(users.getAllUsers, {
      user: userASession,
      query: { organizationId: orgB.id, activeOnly: "false" },
    });
    assert(userList.statusCode === 200, "user list should be 200");
    assert(
      !userList.body.some((row) => row.id === userB.id),
      "user A listed organisation B's user"
    );

    const userGet = await invoke(users.getUser, {
      user: userASession,
      params: { id: String(userB.id) },
    });
    assert(userGet.statusCode === 404, "user A read organisation B's user");

    const deptGet = await invoke(departments.getDepartment, {
      user: userASession,
      params: { id: String(departmentB.id) },
    });
    assert(deptGet.statusCode === 404, "user A read organisation B's department");

    const deptOwn = await invoke(departments.getDepartment, {
      user: userBSession,
      params: { id: String(departmentB.id) },
    });
    assert(deptOwn.statusCode === 200, "user B should read their department");

    const fileList = await invoke(attachments.listCaseAttachments, {
      user: userASession,
      params: { caseId: caseB.id },
    });
    assert(fileList.statusCode === 404, "user A listed organisation B's vault files");

    const fileGet = await invoke(attachments.getCaseAttachment, {
      user: userASession,
      params: { caseId: caseB.id, attachmentId: fileB.id },
    });
    assert(fileGet.statusCode === 404, "user A read organisation B's vault file");

    const fileDelete = await invoke(attachments.removeCaseAttachment, {
      user: userASession,
      params: { caseId: caseB.id, attachmentId: fileB.id },
    });
    assert(fileDelete.statusCode === 404, "user A deleted organisation B's vault file");

    const stillThere = await db.attachments.getAttachmentForCase(
      caseB.id,
      fileB.id,
      orgB.id
    );
    assert(stillThere, "organisation B's vault metadata was removed");

    console.log("org access smoke ok", {
      organisationA: orgA.id,
      organisationB: orgB.id,
    });
  } finally {
    if (caseB) await db.cases.deleteCase(caseB.id, orgB.id);
    if (userB) await db.users.deleteUser(userB.id, orgB.id);
    if (departmentB) await db.departments.deleteDepartment(departmentB.id, orgB.id);
    if (orgB) await db.organisations.deleteOrganisation(orgB.id);
  }
}

main()
  .then(async () => {
    await db.pool.pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("org access smoke failed:", err.message);
    try {
      await db.pool.pool.end();
    } catch {
      // ignore
    }
    process.exit(1);
  });
