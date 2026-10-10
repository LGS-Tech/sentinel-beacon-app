const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

const calls = [];
const r2Order = [];

function stub(exports) {
  return {
    id: "stub",
    filename: "stub",
    loaded: true,
    exports,
  };
}

require.cache[require.resolve("../db/queries/cases")] = stub({
  listCases: async (filters) => {
    calls.push(["listCases", filters]);
    return [];
  },
  getCaseById: async (id, organizationId) => {
    calls.push(["getCaseById", id, organizationId]);
    if (String(id) === "case-b" || organizationId === 2) return null;
    return {
      id,
      organizationId,
      status: "ACTIVE",
      createdByUserId: 7,
      assignedUserId: null,
    };
  },
  createCase: async (body, organizationId) => {
    calls.push(["createCase", body, organizationId]);
    return { id: "case-a", organizationId, ...body };
  },
  updateCase: async (id, changes, organizationId) => {
    calls.push(["updateCase", id, changes, organizationId]);
    return { id, organizationId, ...changes };
  },
  deleteCase: async (id, organizationId) => {
    calls.push(["deleteCase", id, organizationId]);
    return organizationId === 1;
  },
  assignCase: async (id, fields) => {
    calls.push(["assignCase", id, fields]);
    return { id };
  },
  analyticsSummary: async (organizationId) => {
    calls.push(["analyticsSummary", organizationId]);
    return { total: 0, organizationId };
  },
});

require.cache[require.resolve("../db/queries/users")] = stub({
  listUsers: async (filters) => {
    calls.push(["listUsers", filters]);
    return [{ id: 7, organizationId: filters.organizationId, password: "hash" }];
  },
  getUserById: async (id, organizationId) => {
    calls.push(["getUserById", id, organizationId]);
    if (Number(id) === 99 || organizationId === 2) return null;
    return { id: Number(id), organizationId, password: "hash", userType: "staff" };
  },
  createUser: async (body, organizationId) => {
    calls.push(["createUser", body, organizationId]);
    return { id: 8, organizationId, ...body, password: "hashed" };
  },
  updateUser: async (id, body, organizationId) => {
    calls.push(["updateUser", id, body, organizationId]);
    if (organizationId !== 1) return null;
    return { id: Number(id), organizationId, password: "hash" };
  },
  deleteUser: async (id, organizationId) => {
    calls.push(["deleteUser", id, organizationId]);
    return organizationId === 1;
  },
});

require.cache[require.resolve("../db/queries/departments")] = stub({
  listDepartments: async (filters) => {
    calls.push(["listDepartments", filters]);
    return [{ id: 1, name: "Facilities", organizationId: filters.organizationId }];
  },
  getDepartmentById: async (id, organizationId) => {
    calls.push(["getDepartmentById", id, organizationId]);
    if (Number(id) === 50 || organizationId === 2) return null;
    return { id: Number(id), name: "Facilities", organizationId };
  },
  getDepartmentByName: async (name, organizationId) => {
    calls.push(["getDepartmentByName", name, organizationId]);
    if (organizationId !== 1) return null;
    return { id: 1, name, organizationId };
  },
});

require.cache[require.resolve("../db/queries/attachments")] = stub({
  listAttachmentsByCaseId: async (caseId, organizationId) => {
    calls.push(["listAttachmentsByCaseId", caseId, organizationId]);
    return [];
  },
  getAttachmentForCase: async (caseId, attachmentId, organizationId) => {
    calls.push(["getAttachmentForCase", caseId, attachmentId, organizationId]);
    if (organizationId !== 1) return null;
    return { id: attachmentId, caseId };
  },
  getAttachmentRowForCase: async (caseId, attachmentId, organizationId) => {
    calls.push(["getAttachmentRowForCase", caseId, attachmentId, organizationId]);
    if (organizationId !== 1) return null;
    return {
      id: attachmentId,
      case_id: caseId,
      filename: "notes.txt",
      mime_type: "text/plain",
      storage_provider: "r2",
      storage_url: "vault/case-a/file.txt",
    };
  },
  createAttachment: async (caseId, body, organizationId) => {
    calls.push(["createAttachment", caseId, body, organizationId]);
    return { id: "file-1", caseId, organizationId };
  },
  deleteAttachment: async (caseId, attachmentId, organizationId) => {
    calls.push(["deleteAttachment", caseId, attachmentId, organizationId]);
    r2Order.push("postgres");
    return organizationId === 1;
  },
});

require.cache[require.resolve("../storage/r2")] = stub({
  isConfigured: () => true,
  getStatus: () => ({ ready: true, provider: "r2" }),
  putObject: async () => {
    calls.push(["putObject"]);
    r2Order.push("put");
  },
  getObject: async () => {
    r2Order.push("get");
    return { Body: { transformToByteArray: async () => new Uint8Array([1]) } };
  },
  deleteObject: async () => {
    r2Order.push("r2");
  },
});

const { organizationIdFromUser } = require("../db/orgScope");
const cases = require("../controllers/casesController");
const users = require("../controllers/usersController");
const departments = require("../controllers/departmentController");
const attachments = require("../controllers/attachmentsController");

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    send() {
      return this;
    },
    sendStatus(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
  };
}

async function run(handler, req) {
  const res = mockRes();
  let nextError;
  await handler(req, res, (err) => {
    nextError = err;
  });
  assert.equal(nextError, undefined);
  return res;
}

const userA = { userId: 7, userType: "lead", organizationId: 1 };
const userB = { userId: 8, userType: "lead", organizationId: 2 };

beforeEach(() => {
  calls.length = 0;
  r2Order.length = 0;
});

test("organisation id comes from the authenticated user only", () => {
  assert.equal(organizationIdFromUser({ organizationId: 4 }), 4);
  assert.equal(organizationIdFromUser({ organisationId: "5" }), 5);
  assert.equal(organizationIdFromUser({ organizationId: "0" }), null);
  assert.equal(organizationIdFromUser({}), null);
});

test("user A cannot list or read organisation B cases", async () => {
  const listed = await run(cases.getAllCases, {
    user: userA,
    query: { organizationId: 2, status: "ACTIVE" },
  });
  assert.equal(listed.statusCode, 200);
  assert.equal(calls[0][1].organizationId, 1);
  assert.equal(calls[0][1].status, "ACTIVE");
  assert.equal("organizationId" in calls[0][1] && calls[0][1].organizationId === 2, false);

  const hidden = await run(cases.getCase, {
    user: userB,
    params: { id: "case-b" },
  });
  assert.equal(hidden.statusCode, 404);

  const updated = await run(cases.updateExistingCase, {
    user: userB,
    params: { id: "case-a" },
    body: { title: "Stolen", organizationId: 1 },
  });
  assert.equal(updated.statusCode, 404);
  assert.equal(calls.some((call) => call[0] === "updateCase"), false);
});

test("create and update reject an assignee or department from another organisation", async () => {
  const created = await run(cases.createNewCase, {
    user: userA,
    body: { title: "Local", assignedUserId: 99, assignedDepartmentId: 1 },
  });
  assert.equal(created.statusCode, 404);
  assert.equal(calls.some((call) => call[0] === "createCase"), false);

  const updated = await run(cases.updateExistingCase, {
    user: userA,
    params: { id: "case-a" },
    body: { assignedDepartmentId: 50 },
  });
  assert.equal(updated.statusCode, 404);
  assert.equal(calls.some((call) => call[0] === "updateCase"), false);
});

test("same-organisation case create ignores a client organisation id", async () => {
  const created = await run(cases.createNewCase, {
    user: userA,
    body: { title: "Local", organizationId: 2, status: "CLOSED" },
  });
  assert.equal(created.statusCode, 201);
  const createCall = calls.find((call) => call[0] === "createCase");
  assert.equal(createCall[2], 1);
  assert.equal(createCall[1].organizationId, undefined);
  assert.equal(createCall[1].status, "ACTIVE");
});

test("missing organisation on the session is forbidden", async () => {
  const res = await run(cases.getAllCases, { user: { userId: 7, userType: "lead" }, query: {} });
  assert.equal(res.statusCode, 403);
  assert.equal(calls.length, 0);
});

test("user A cannot list or read organisation B users", async () => {
  const listed = await run(users.getAllUsers, {
    user: userA,
    query: { organizationId: 2 },
  });
  assert.equal(listed.statusCode, 200);
  assert.equal(calls[0][1].organizationId, 1);

  const hidden = await run(users.getUser, {
    user: userB,
    params: { id: "7" },
  });
  assert.equal(hidden.statusCode, 404);

  const updated = await run(users.updateExistingUser, {
    user: userB,
    params: { id: "7" },
    body: { name: "Other", organizationId: 1 },
  });
  assert.equal(updated.statusCode, 404);
});

test("user create and self-update reject a department from another organisation", async () => {
  const created = await run(users.createNewUser, {
    user: userA,
    body: {
      username: "ada",
      password: "secret",
      email: "ada@example.com",
      departmentId: 50,
    },
  });
  assert.equal(created.statusCode, 404);
  assert.equal(calls.some((call) => call[0] === "createUser"), false);

  const updated = await run(users.updateExistingUser, {
    user: { userId: 7, userType: "staff", organizationId: 1 },
    params: { id: "7" },
    body: { departmentId: 50 },
  });
  assert.equal(updated.statusCode, 404);
  assert.equal(calls.some((call) => call[0] === "updateUser"), false);
});

test("same-organisation user create uses the session organisation", async () => {
  const created = await run(users.createNewUser, {
    user: userA,
    body: {
      username: "ada",
      password: "secret",
      email: "ada@example.com",
      organizationId: 2,
    },
  });
  assert.equal(created.statusCode, 201);
  const createCall = calls.find((call) => call[0] === "createUser");
  assert.equal(createCall[2], 1);
  assert.equal(createCall[1].organizationId, undefined);
  assert.equal(created.body.password, undefined);
});

test("user A cannot list or read organisation B departments", async () => {
  const listed = await run(departments.getAllDepartments, {
    user: userA,
    query: { organizationId: 2 },
  });
  assert.equal(listed.statusCode, 200);
  assert.equal(calls[0][1].organizationId, 1);

  const hidden = await run(departments.getDepartment, {
    user: userB,
    params: { id: "1" },
  });
  assert.equal(hidden.statusCode, 404);

  const same = await run(departments.getDepartment, {
    user: userA,
    params: { id: "1" },
  });
  assert.equal(same.statusCode, 200);
  assert.equal(same.body.organizationId, 1);
});

test("user A cannot list, open, or delete organisation B vault files", async () => {
  const listed = await run(attachments.listCaseAttachments, {
    user: userB,
    params: { caseId: "case-a" },
    query: { organizationId: 1 },
  });
  assert.equal(listed.statusCode, 404);
  assert.equal(calls.some((call) => call[0] === "listAttachmentsByCaseId"), false);

  const opened = await run(attachments.getCaseAttachmentContent, {
    user: userB,
    params: { caseId: "case-a", attachmentId: "file-1" },
  });
  assert.equal(opened.statusCode, 404);
  assert.equal(r2Order.includes("get"), false);

  const removed = await run(attachments.removeCaseAttachment, {
    user: userB,
    params: { caseId: "case-a", attachmentId: "file-1" },
  });
  assert.equal(removed.statusCode, 404);
  assert.equal(r2Order.includes("r2"), false);
});

test("same-organisation vault delete removes Postgres metadata before R2", async () => {
  const removed = await run(attachments.removeCaseAttachment, {
    user: userA,
    params: { caseId: "case-a", attachmentId: "file-1" },
  });
  assert.equal(removed.statusCode, 204);
  assert.deepEqual(r2Order, ["postgres", "r2"]);
});

test("vault upload is refused before R2 when the case is outside the organisation", async () => {
  const uploaded = await run(attachments.addCaseAttachment, {
    user: userB,
    params: { caseId: "case-a" },
    file: {
      originalname: "notes.txt",
      mimetype: "text/plain",
      size: 4,
      buffer: Buffer.from("note"),
    },
  });
  assert.equal(uploaded.statusCode, 404);
  assert.equal(calls.some((call) => call[0] === "putObject"), false);
  assert.equal(calls.some((call) => call[0] === "createAttachment"), false);
});
