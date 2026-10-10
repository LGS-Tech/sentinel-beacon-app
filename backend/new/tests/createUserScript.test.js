const { test } = require("node:test");
const assert = require("node:assert/strict");

// Only the argument/env validation is covered here; it needs no database.
const { parseArgs, resolveInput } = require("../scripts/create-user");

const VALID_OPTIONS = {
  email: "jane@example.org",
  username: "jane",
  name: "Jane Doe",
  userType: "staff",
};
const VALID_ENV = { CREATE_USER_PASSWORD: "long-enough-value" };

test("parseArgs reads --flag value and --flag=value", () => {
  assert.deepEqual(
    parseArgs([
      "--email",
      "jane@example.org",
      "--username=jane",
      "--name",
      "Jane Doe",
      "--user-type=staff",
    ]),
    VALID_OPTIONS
  );
});

test("parseArgs refuses a password argument", () => {
  assert.throws(() => parseArgs(["--password", "x"]), /CREATE_USER_PASSWORD/);
  assert.throws(() => parseArgs(["--password=x"]), /CREATE_USER_PASSWORD/);
});

test("parseArgs refuses unknown flags and missing values", () => {
  assert.throws(() => parseArgs(["--role", "x"]), /Unknown argument: --role/);
  assert.throws(() => parseArgs(["--email"]), /Missing value for --email/);
});

test("resolveInput accepts valid options with the password from the environment", () => {
  assert.deepEqual(resolveInput(VALID_OPTIONS, VALID_ENV), {
    ...VALID_OPTIONS,
    password: VALID_ENV.CREATE_USER_PASSWORD,
  });
});

test("resolveInput falls back to CREATE_USER_* environment values", () => {
  const resolved = resolveInput(
    {},
    {
      ...VALID_ENV,
      CREATE_USER_EMAIL: "sam@example.org",
      CREATE_USER_USERNAME: "sam",
      CREATE_USER_NAME: "Sam",
      CREATE_USER_TYPE: "Lead",
    }
  );
  assert.equal(resolved.email, "sam@example.org");
  assert.equal(resolved.userType, "lead");
});

test("resolveInput refuses a missing password", () => {
  assert.throws(
    () => resolveInput(VALID_OPTIONS, {}),
    /CREATE_USER_PASSWORD is not set/
  );
  assert.throws(
    () => resolveInput(VALID_OPTIONS, { CREATE_USER_PASSWORD: "" }),
    /CREATE_USER_PASSWORD is not set/
  );
});

test("resolveInput refuses a password shorter than 8 characters without echoing it", () => {
  assert.throws(
    () => resolveInput(VALID_OPTIONS, { CREATE_USER_PASSWORD: "short77" }),
    (err) => {
      assert.match(err.message, /at least 8 characters/);
      assert.ok(!err.message.includes("short77"));
      return true;
    }
  );
});

test("resolveInput refuses an unknown user type", () => {
  assert.throws(
    () => resolveInput({ ...VALID_OPTIONS, userType: "admin" }, VALID_ENV),
    /--user-type must be one of: student, staff, maintainer, lead/
  );
});

test("resolveInput lists every missing value", () => {
  assert.throws(
    () => resolveInput({ email: "jane@example.org" }, VALID_ENV),
    /Missing required value\(s\): --username, --name, --user-type/
  );
});

test("resolveInput refuses an invalid email", () => {
  assert.throws(
    () => resolveInput({ ...VALID_OPTIONS, email: "not-an-email" }, VALID_ENV),
    /not a valid email/
  );
});
