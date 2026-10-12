/**
 * Create one organisation (tenant) from the command line.
 *
 * Usage (from backend/new):
 *   npm run org:create -- --name "Example College" --slug example-college
 *
 * The slug is what `npm run user:create -- --org <slug>` takes. A slug that
 * already exists is refused. Prints only the new organisation id and slug.
 */
require("dotenv").config({ quiet: true });

const { SLUG_PATTERN } = require("./create-user");

const FLAGS = {
  "--name": "name",
  "--slug": "slug",
};

function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const [flag, inlineValue] = argv[i].split(/=(.*)/s, 2);
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

function resolveInput(options = {}) {
  const name = String(options.name ?? "").trim();
  const slug = String(options.slug ?? "").trim();

  const missing = [];
  if (!name) missing.push("--name");
  if (!slug) missing.push("--slug");
  if (missing.length) {
    throw new Error(`Missing required value(s): ${missing.join(", ")}`);
  }

  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(
      "--slug must use lowercase letters, digits and single hyphens (e.g. example-college)"
    );
  }

  return { name, slug };
}

async function main() {
  const input = resolveInput(parseArgs(process.argv.slice(2)));

  // Loaded here so argument errors are reported without needing a database.
  const db = require("../db");

  try {
    if (await db.organisations.getOrganisationBySlug(input.slug)) {
      throw new Error(`An organisation with slug ${input.slug} already exists`);
    }

    const created = await db.organisations.createOrganisation(input);
    console.log(`id=${created.id} slug=${created.slug}`);
  } finally {
    await db.pool.pool.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(`org:create failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { parseArgs, resolveInput };
