/**
 * Provision one account from the command line (no public signup needed).
 *
 * Usage (from backend/new):
 *   CREATE_USER_PASSWORD=... npm run user:create -- \
 *     --email jane@example.org --username jane --name "Jane Doe" --user-type staff
 *
 * Each flag can also come from the environment: CREATE_USER_EMAIL,
 * CREATE_USER_USERNAME, CREATE_USER_NAME, CREATE_USER_TYPE.
 * The password is read ONLY from CREATE_USER_PASSWORD and is never logged.
 *
 * TODO(#64): take the organisation (id or slug) as a parameter once
 * organisations are merged; until then every account lands in the single tenant.
 */
require("dotenv").config({ quiet: true });

const { ROLES } = require("../utils/casePolicy");

const USER_TYPES = Object.values(ROLES);
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FLAGS = {
  "--email": "email",
  "--username": "username",
  "--name": "name",
  "--user-type": "userType",
};

function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--password" || arg.startsWith("--password=")) {
      throw new Error(
        "The password is not accepted as an argument. Set CREATE_USER_PASSWORD instead."
      );
    }
    const [flag, inlineValue] = arg.split(/=(.*)/s, 2);
    const key = FLAGS[flag];
    if (!key) {
      throw new Error(`Unknown argument: ${flag}`);
    }
    const value = inlineValue !== undefined ? inlineValue : argv[(i += 1)];
    if (value === undefined) {
      throw new Error(`Missing value for ${flag}`);
    }
    options[key] = value;
  }
  return options;
}

// Flags win over the environment. Throws with a message safe to print:
// it never includes the password.
function resolveInput(options = {}, env = process.env) {
  const email = String(options.email ?? env.CREATE_USER_EMAIL ?? "").trim();
  const username = String(
    options.username ?? env.CREATE_USER_USERNAME ?? ""
  ).trim();
  const name = String(options.name ?? env.CREATE_USER_NAME ?? "").trim();
  const userType = String(options.userType ?? env.CREATE_USER_TYPE ?? "")
    .trim()
    .toLowerCase();
  const password = env.CREATE_USER_PASSWORD;

  const missing = [];
  if (!email) missing.push("--email");
  if (!username) missing.push("--username");
  if (!name) missing.push("--name");
  if (!userType) missing.push("--user-type");
  if (missing.length) {
    throw new Error(`Missing required value(s): ${missing.join(", ")}`);
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("--email is not a valid email address");
  }
  if (!USER_TYPES.includes(userType)) {
    throw new Error(`--user-type must be one of: ${USER_TYPES.join(", ")}`);
  }
  if (typeof password !== "string" || password.length === 0) {
    throw new Error("CREATE_USER_PASSWORD is not set");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `CREATE_USER_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`
    );
  }

  return { email, username, name, userType, password };
}

async function main() {
  const input = resolveInput(parseArgs(process.argv.slice(2)));

  // Loaded here so argument errors are reported without needing a database.
  const bcrypt = require("bcrypt");
  const db = require("../db");

  try {
    if (await db.users.getUserByEmail(input.email)) {
      throw new Error(`A user with email ${input.email} already exists`);
    }
    if (await db.users.getUserByUsername(input.username)) {
      throw new Error(`A user with username ${input.username} already exists`);
    }

    const created = await db.users.createUser({
      username: input.username,
      password: await bcrypt.hash(input.password, 10),
      email: input.email,
      name: input.name,
      userType: input.userType,
      authorisation: input.userType === ROLES.LEAD ? 1 : 2,
    });

    console.log(
      `Created user id=${created.id} email=${created.email} username=${created.username} userType=${created.userType}`
    );
  } finally {
    await db.pool.pool.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(`user:create failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { parseArgs, resolveInput, USER_TYPES, MIN_PASSWORD_LENGTH };
