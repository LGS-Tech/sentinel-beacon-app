const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

// Stub the query layer before the controller loads it, so no database is needed.
const queriesPath = require.resolve("../db/queries/cases");
let createCaseArgs;
let updateCaseArgs;
let existingCase;

require.cache[queriesPath] = {
  id: queriesPath,
  filename: queriesPath,
  loaded: true,
  exports: {
    createCase: async (body) => {
      createCaseArgs = body;
      return { id: "test-case-id", ...body };
    },
    getCaseById: async () => existingCase,
    updateCase: async (id, changes) => {
      updateCaseArgs = changes;
      return { ...existingCase, ...changes };
    },
  },
};

const {
  createNewCase,
  updateExistingCase,
} = require("../controllers/casesController");

function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

async function postCase(body, user = { userId: 7 }) {
  const res = mockRes();
  let nextError;
  await createNewCase({ body, user }, res, (err) => {
    nextError = err;
  });
  assert.equal(nextError, undefined);
  return res;
}

async function putCase(body, user) {
  const res = mockRes();
  let nextError;
  await updateExistingCase(
    { body, user, params: { id: "test-case-id" } },
    res,
    (err) => {
      nextError = err;
    }
  );
  assert.equal(nextError, undefined);
  return res;
}

beforeEach(() => {
  createCaseArgs = undefined;
  updateCaseArgs = undefined;
  // Created by user 7, so a student with that id may modify it.
  existingCase = {
    id: "test-case-id",
    status: "ACTIVE",
    createdByUserId: 7,
    assignedUserId: null,
  };
});

test("POST /cases with status CLOSED creates an ACTIVE case", async () => {
  await postCase({ title: "Test", status: "CLOSED", closedAt: 123 });
  assert.equal(createCaseArgs.status, "ACTIVE");
});

test("POST /cases with status RESOLVED creates an ACTIVE case", async () => {
  await postCase({ title: "Test", status: "RESOLVED" });
  assert.equal(createCaseArgs.status, "ACTIVE");
});

test("POST /cases without a status creates an ACTIVE case", async () => {
  await postCase({ title: "Test" });
  assert.equal(createCaseArgs.status, "ACTIVE");
});

test("POST /cases takes createdByUserId from the session, not the body", async () => {
  await postCase({ title: "Test", createdByUserId: 999 }, { userId: 7 });
  assert.equal(createCaseArgs.createdByUserId, 7);
});

test("POST /cases responds with 201", async () => {
  const res = await postCase({ title: "Test" });
  assert.equal(res.statusCode, 201);
});

for (const userType of ["student", "staff"]) {
  const user = { userId: 7, userType };

  test(`POST /cases as ${userType} drops assignedUserId`, async () => {
    await postCase({ title: "Test", assignedUserId: 5, assigned_user_id: 5 }, user);
    assert.equal("assignedUserId" in createCaseArgs, false);
    assert.equal("assigned_user_id" in createCaseArgs, false);
    assert.equal(createCaseArgs.title, "Test");
  });

  test(`PUT /cases/:id as ${userType} drops assignedUserId`, async () => {
    const res = await putCase(
      { title: "Renamed", assignedUserId: 5, assigned_user_id: 5 },
      user
    );
    assert.equal(res.statusCode, null);
    assert.equal("assignedUserId" in updateCaseArgs, false);
    assert.equal("assigned_user_id" in updateCaseArgs, false);
    assert.equal(updateCaseArgs.title, "Renamed");
  });
}

for (const userType of ["maintainer", "lead"]) {
  const user = { userId: 7, userType };

  test(`POST /cases as ${userType} keeps assignedUserId`, async () => {
    await postCase({ title: "Test", assignedUserId: 5 }, user);
    assert.equal(createCaseArgs.assignedUserId, 5);
  });

  test(`POST /cases as ${userType} keeps assigned_user_id`, async () => {
    await postCase({ title: "Test", assigned_user_id: 5 }, user);
    assert.equal(createCaseArgs.assigned_user_id, 5);
  });

  test(`PUT /cases/:id as ${userType} keeps assignedUserId`, async () => {
    await putCase({ assignedUserId: 5 }, user);
    assert.equal(updateCaseArgs.assignedUserId, 5);
  });
}
