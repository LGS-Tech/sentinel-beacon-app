const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

// Stub the query layer before the controller loads it, so no database is needed.
const queriesPath = require.resolve("../db/queries/cases");
let createCaseArgs;

require.cache[queriesPath] = {
  id: queriesPath,
  filename: queriesPath,
  loaded: true,
  exports: {
    createCase: async (body) => {
      createCaseArgs = body;
      return { id: "test-case-id", ...body };
    },
  },
};

const { createNewCase } = require("../controllers/casesController");

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

beforeEach(() => {
  createCaseArgs = undefined;
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
