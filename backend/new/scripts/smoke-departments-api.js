/**
 * Validate departments query + REST handler shape against the current schema.
 * Usage: node scripts/smoke-departments-api.js
 *
 * Optional HTTP check (running API + JWT):
 *   DEPARTMENTS_SMOKE_URL=http://localhost:3000
 *   DEPARTMENTS_SMOKE_TOKEN=<bearer token>
 */
require("dotenv").config();

const db = require("../db");
const {
  getAllDepartments,
  getDepartment,
} = require("../controllers/departmentController");

const ALLOWED_KINDS = new Set([
  "facilities",
  "it",
  "engineering",
  "security",
  "medical",
  "other",
]);

const SEEDED_NAMES = [
  "Facilities",
  "IT Support",
  "Engineering",
  "Security",
  "Medical",
  "Estates / Maintenance",
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertDepartmentShape(dept, label) {
  assert(dept && typeof dept === "object", `${label}: expected an object`);
  assert(Number.isInteger(dept.id) && dept.id > 0, `${label}: invalid id`);
  assert(typeof dept.name === "string" && dept.name.length > 0, `${label}: name`);
  assert(typeof dept.slug === "string" && dept.slug.length > 0, `${label}: slug`);
  assert(ALLOWED_KINDS.has(dept.kind), `${label}: unexpected kind ${dept.kind}`);
  assert(typeof dept.isActive === "boolean", `${label}: isActive`);
  assert(
    !("is_active" in dept),
    `${label}: API should use isActive, not is_active`
  );
}

function invoke(handler, req) {
  return new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        resolve({ statusCode: this.statusCode, body: payload });
        return this;
      },
    };
    Promise.resolve(handler(req, res, (err) => reject(err))).catch(reject);
  });
}

async function main() {
  const ping = await db.pool.ping();
  console.log("ping", ping.now);

  const listed = await db.departments.listDepartments({ activeOnly: true });
  console.log(
    "departments",
    listed.length,
    listed.map((d) => d.name).join(", ")
  );
  assert(listed.length >= 6, "expected at least the 6 seeded departments");
  listed.forEach((dept) => assertDepartmentShape(dept, `list:${dept.id}`));
  for (const name of SEEDED_NAMES) {
    assert(
      listed.some((d) => d.name === name),
      `missing seeded department: ${name}`
    );
  }

  const byId = await db.departments.getDepartmentById(1);
  assertDepartmentShape(byId, "getById:1");
  assert(byId.name === "Facilities", "id 1 should be Facilities");

  const byName = await db.departments.getDepartmentByName("it support");
  assertDepartmentShape(byName, "getByName");
  assert(byName.slug === "it-support", "IT Support slug");

  const missing = await db.departments.getDepartmentById(999999);
  assert(missing == null, "unknown id should map to null");

  const listRes = await invoke(getAllDepartments, { query: {} });
  assert(listRes.statusCode === 200, "GET /departments should be 200");
  assert(Array.isArray(listRes.body), "GET /departments should return an array");
  listRes.body.forEach((dept) => assertDepartmentShape(dept, `http-list:${dept.id}`));
  console.log("controller GET /departments", listRes.body.length);

  const oneRes = await invoke(getDepartment, { params: { id: "2" } });
  assert(oneRes.statusCode === 200, "GET /departments/2 should be 200");
  assertDepartmentShape(oneRes.body, "http-get:2");
  assert(oneRes.body.name === "IT Support", "id 2 should be IT Support");
  console.log("controller GET /departments/2", oneRes.body.name);

  const badId = await invoke(getDepartment, { params: { id: "abc" } });
  assert(badId.statusCode === 400, "non-integer id should be 400");

  const notFound = await invoke(getDepartment, { params: { id: "999999" } });
  assert(notFound.statusCode === 404, "unknown id should be 404");

  const byNameRes = await invoke(getAllDepartments, {
    query: { name: "Medical" },
  });
  assert(byNameRes.statusCode === 200, "GET /departments?name=Medical should be 200");
  assert(byNameRes.body.kind === "medical", "Medical kind");

  const smokeUrl = process.env.DEPARTMENTS_SMOKE_URL;
  const smokeToken = process.env.DEPARTMENTS_SMOKE_TOKEN;
  if (smokeUrl && smokeToken) {
    const response = await fetch(`${smokeUrl.replace(/\/$/, "")}/departments`, {
      headers: { Authorization: `Bearer ${smokeToken}` },
    });
    assert(response.ok, `HTTP GET /departments failed (${response.status})`);
    const body = await response.json();
    assert(Array.isArray(body), "HTTP GET /departments should return an array");
    body.forEach((dept) => assertDepartmentShape(dept, `live:${dept.id}`));
    console.log("HTTP GET /departments", body.length);
  } else {
    console.log(
      "HTTP check skipped (set DEPARTMENTS_SMOKE_URL and DEPARTMENTS_SMOKE_TOKEN)"
    );
  }

  console.log("departments API smoke ok");
}

main()
  .then(async () => {
    await db.pool.pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("departments API smoke failed:", err.message);
    try {
      await db.pool.pool.end();
    } catch {
      // ignore
    }
    process.exit(1);
  });
