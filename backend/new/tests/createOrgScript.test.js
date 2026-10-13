const { test } = require("node:test");
const assert = require("node:assert/strict");

// Only the argument validation is covered here; it needs no database.
const { parseArgs, resolveInput } = require("../scripts/create-org");

test("parseArgs reads --flag value and --flag=value", () => {
  assert.deepEqual(
    parseArgs(["--name", "Example College", "--slug=example-college"]),
    { name: "Example College", slug: "example-college" }
  );
});

test("parseArgs refuses unknown flags and missing values", () => {
  assert.throws(() => parseArgs(["--id", "7"]), /Unknown argument: --id/);
  assert.throws(() => parseArgs(["--slug"]), /Missing value for --slug/);
});

test("resolveInput trims and returns the name and slug", () => {
  assert.deepEqual(
    resolveInput({ name: "  Example College ", slug: " example-college " }),
    { name: "Example College", slug: "example-college" }
  );
});

test("resolveInput lists every missing value", () => {
  assert.throws(
    () => resolveInput({}),
    /Missing required value\(s\): --name, --slug/
  );
  assert.throws(
    () => resolveInput({ name: "Example College", slug: "  " }),
    /Missing required value\(s\): --slug/
  );
});

test("resolveInput refuses a slug that is not lowercase-hyphenated", () => {
  for (const slug of ["Example", "example college", "example_college", "-example", "example-", "a--b"]) {
    assert.throws(
      () => resolveInput({ name: "Example College", slug }),
      /--slug must use lowercase letters, digits and single hyphens/
    );
  }
});
