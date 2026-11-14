const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

const calls = [];
const r2Order = [];
let missingRow = false;

function stub(exports) {
  return {
    id: "stub",
    filename: "stub",
    loaded: true,
    exports,
  };
}

require.cache[require.resolve("../db/queries/floorPlans")] = stub({
  listFloorPlans: async (organizationId) => {
    calls.push(["listFloorPlans", organizationId]);
    if (organizationId !== 1) return [];
    return [
      {
        id: "plan-1",
        floor: "1",
        filename: "floor-1.png",
        storageUrl: "/floors/1/content",
        organizationId,
      },
      {
        id: "plan-2",
        floor: "2",
        filename: "floor-2.png",
        storageUrl: "/floors/2/content",
        organizationId,
      },
    ];
  },
  getFloorPlan: async (organizationId, floorId) => {
    calls.push(["getFloorPlan", organizationId, floorId]);
    if (organizationId !== 1) return null;
    return {
      id: "plan-1",
      floor: floorId,
      filename: "floor-1.png",
      storageUrl: `/floors/${floorId}/content`,
      organizationId,
    };
  },
  getFloorPlanRow: async (organizationId, floorId) => {
    calls.push(["getFloorPlanRow", organizationId, floorId]);
    if (missingRow || organizationId !== 1) return null;
    return {
      id: "plan-1",
      floor: floorId,
      filename: "floor-1.png",
      mime_type: "image/png",
      storage_provider: "r2",
      storage_url: "floor-plans/1/1/old.png",
      organization_id: organizationId,
    };
  },
  upsertFloorPlan: async (organizationId, floorId, body) => {
    calls.push(["upsertFloorPlan", organizationId, floorId, body]);
    r2Order.push("postgres");
    return {
      id: "plan-1",
      floor: floorId,
      filename: body.filename,
      storageUrl: `/floors/${floorId}/content`,
      organizationId,
    };
  },
});

require.cache[require.resolve("../storage/r2")] = stub({
  isConfigured: () => true,
  getStatus: () => ({ ready: true, provider: "r2" }),
  putObject: async ({ key }) => {
    calls.push(["putObject", key]);
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

delete require.cache[require.resolve("../controllers/floorPlansController")];
const floorPlans = require("../controllers/floorPlansController");
const { validateFloorPlanFile, parseFloorId } = require("../storage/floorPlans");

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
  missingRow = false;
});

test("floor ids are 1 or 2", () => {
  assert.equal(parseFloorId("1"), "1");
  assert.equal(parseFloorId("2"), "2");
  assert.equal(parseFloorId(1), "1");
  assert.equal(parseFloorId(2), "2");
  assert.equal(parseFloorId("3"), null);
  assert.equal(parseFloorId(""), null);
});

test("floor plan files must be jpg or png", () => {
  assert.equal(
    validateFloorPlanFile({
      originalname: "plan.png",
      mimetype: "image/png",
      size: 128,
    }).ok,
    true
  );
  assert.equal(
    validateFloorPlanFile({
      originalname: "plan.jpg",
      mimetype: "image/jpeg",
      size: 128,
    }).ok,
    true
  );
  assert.equal(
    validateFloorPlanFile({
      originalname: "notes.txt",
      mimetype: "text/plain",
      size: 128,
    }).ok,
    false
  );
  assert.equal(
    validateFloorPlanFile({
      originalname: "plan.pdf",
      mimetype: "application/pdf",
      size: 128,
    }).ok,
    false
  );
});

test("missing organisation on the session is forbidden", async () => {
  const res = await run(floorPlans.listOrganisationFloorPlans, {
    user: { userId: 7, userType: "lead" },
  });
  assert.equal(res.statusCode, 403);
  assert.equal(calls.length, 0);
});

test("user A cannot list or open organisation B floor plans", async () => {
  const listed = await run(floorPlans.listOrganisationFloorPlans, {
    user: userA,
    query: { organizationId: 2 },
  });
  assert.equal(listed.statusCode, 200);
  assert.equal(calls[0][0], "listFloorPlans");
  assert.equal(calls[0][1], 1);
  assert.equal(listed.body.length, 2);
  assert.deepEqual(
    listed.body.map((row) => row.floor).sort(),
    ["1", "2"]
  );

  const hiddenList = await run(floorPlans.listOrganisationFloorPlans, {
    user: userB,
  });
  assert.equal(hiddenList.statusCode, 200);
  assert.deepEqual(hiddenList.body, []);

  const opened = await run(floorPlans.getOrganisationFloorPlanContent, {
    user: userB,
    params: { floorId: "1" },
  });
  assert.equal(opened.statusCode, 404);
  assert.equal(r2Order.includes("get"), false);
});

test("same-organisation floor plan replace uploads then updates postgres then deletes the old object", async () => {
  const uploaded = await run(floorPlans.upsertOrganisationFloorPlan, {
    user: userA,
    params: { floorId: "1" },
    file: {
      originalname: "floor-1.png",
      mimetype: "image/png",
      size: 4,
      buffer: Buffer.from("plan"),
    },
  });
  assert.equal(uploaded.statusCode, 200);
  assert.equal(uploaded.body.storageUrl, "/floors/1/content");
  assert.equal(uploaded.body.storageUrl.includes("floor-plans/"), false);
  assert.deepEqual(r2Order, ["put", "postgres", "r2"]);
  const upsertCall = calls.find((call) => call[0] === "upsertFloorPlan");
  assert.equal(upsertCall[1], 1);
  assert.equal(upsertCall[2], "1");
  assert.equal(upsertCall[3].organizationId, undefined);
});

test("floor plan upload is refused before R2 when the session has no organisation", async () => {
  const uploaded = await run(floorPlans.upsertOrganisationFloorPlan, {
    user: { userId: 7, userType: "lead" },
    params: { floorId: "1" },
    file: {
      originalname: "floor-1.png",
      mimetype: "image/png",
      size: 4,
      buffer: Buffer.from("plan"),
    },
  });
  assert.equal(uploaded.statusCode, 403);
  assert.equal(calls.some((call) => call[0] === "putObject"), false);
  assert.equal(calls.some((call) => call[0] === "upsertFloorPlan"), false);
});

test("GET /floors lists floor 1 and floor 2 for the owning organisation", async () => {
  const listed = await run(floorPlans.listOrganisationFloorPlans, {
    user: userA,
  });
  assert.equal(listed.statusCode, 200);
  assert.deepEqual(
    listed.body.map((row) => String(row.floor)).sort(),
    ["1", "2"]
  );
});

test("floor 1 and floor 2 content both open for the owning organisation", async () => {
  for (const floorId of ["1", "2"]) {
    const opened = await run(floorPlans.getOrganisationFloorPlanContent, {
      user: userA,
      params: { floorId },
    });
    assert.equal(opened.statusCode, 200);
    assert.equal(
      calls.some(
        (call) => call[0] === "getFloorPlanRow" && call[2] === floorId
      ),
      true
    );
  }
});

test("first upload for a floor returns 201", async () => {
  missingRow = true;

  const uploaded = await run(floorPlans.upsertOrganisationFloorPlan, {
    user: userA,
    params: { floorId: "2" },
    file: {
      originalname: "floor-2.jpg",
      mimetype: "image/jpeg",
      size: 8,
      buffer: Buffer.from("plan-two"),
    },
  });
  assert.equal(uploaded.statusCode, 201);
  assert.equal(r2Order.includes("r2"), false);
});
