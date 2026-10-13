const { test } = require("node:test");
const assert = require("node:assert/strict");

// Only the environment checks are covered here; they need no database.
const { resolveSeedConfig, DEMO_USERS } = require("../scripts/seed-demo");

const VALID_PASSWORD = "long-enough-value";

test("seed-demo refuses to run when NODE_ENV=production", () => {
  for (const nodeEnv of ["production", "Production", " production "]) {
    assert.throws(
      () =>
        resolveSeedConfig({
          NODE_ENV: nodeEnv,
          DEMO_SEED_PASSWORD: VALID_PASSWORD,
        }),
      /Refusing to seed demo users when NODE_ENV=production/
    );
  }
});

test("seed-demo refuses a missing DEMO_SEED_PASSWORD", () => {
  assert.throws(() => resolveSeedConfig({}), /DEMO_SEED_PASSWORD is not set/);
  assert.throws(
    () => resolveSeedConfig({ DEMO_SEED_PASSWORD: "" }),
    /DEMO_SEED_PASSWORD is not set/
  );
});

test("seed-demo refuses a DEMO_SEED_PASSWORD shorter than 8 characters without echoing it", () => {
  assert.throws(
    () => resolveSeedConfig({ DEMO_SEED_PASSWORD: "short77" }),
    (err) => {
      assert.match(err.message, /at least 8 characters/);
      assert.ok(!err.message.includes("short77"));
      return true;
    }
  );
});

test("seed-demo accepts a valid password outside production", () => {
  for (const nodeEnv of [undefined, "development", "test"]) {
    assert.deepEqual(
      resolveSeedConfig({
        NODE_ENV: nodeEnv,
        DEMO_SEED_PASSWORD: VALID_PASSWORD,
      }),
      { password: VALID_PASSWORD }
    );
  }
});

test("seed-demo defines the 7 demo users without any password", () => {
  assert.equal(DEMO_USERS.length, 7);
  assert.equal(new Set(DEMO_USERS.map((user) => user.email)).size, 7);
  assert.equal(new Set(DEMO_USERS.map((user) => user.username)).size, 7);
  for (const user of DEMO_USERS) {
    assert.equal("password" in user, false);
  }
});
