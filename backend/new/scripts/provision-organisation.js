/** Operator-only CLI. Verify domain ownership and the employee's identity out of band first. */
require('dotenv').config();
const { parseArgs } = require('node:util');
const bcrypt = require('bcrypt');
const database = require('../db/pool');
const { getClient } = database;
const { normalizeDomain } = require('../utils/emailDomain');
const { organisationForEmail } = require('../db/queries/organisationDomains');
const { createUser } = require('../db/queries/users');

async function main() {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    domain: { type: 'string' }, slug: { type: 'string' }, name: { type: 'string' },
    'approved-by': { type: 'string' }, 'ownership-confirmed': { type: 'boolean' },
    email: { type: 'string' }, username: { type: 'string' }, role: { type: 'string' },
  }});
  const [command] = positionals;
  if (positionals.length !== 1) throw new Error('Use bind-domain or create-user');
  if (command === 'bind-domain') {
    const domain = normalizeDomain(values.domain);
    if (!values['ownership-confirmed'] || !values['approved-by']?.trim()) {
      throw new Error('Verify ownership out of band, then supply --ownership-confirmed and --approved-by');
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug || '') || values.slug === 'lgs-demo' || !values.name?.trim()) {
      throw new Error('Supply a name and non-demo organisation slug');
    }
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const org = await client.query(
        `INSERT INTO organisations (name, slug) VALUES ($1,$2)
         ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug
         RETURNING id, is_active`, [values.name.trim(), values.slug]);
      if (!org.rows[0].is_active) throw new Error('Organisation is inactive');
      // UNIQUE constraints prohibit domain reassignment and multiple domains per org.
      await client.query(
        'INSERT INTO organisation_domains (domain, organization_id, approved_by) VALUES ($1,$2,$3)',
        [domain, org.rows[0].id, values['approved-by'].trim()]);
      await client.query('COMMIT');
      console.log('Approved domain registered. Existing accounts/data were not reassigned.');
    } catch (err) { await client.query('ROLLBACK'); throw err; }
    finally { client.release(); }
  } else if (command === 'create-user') {
    const password = process.env.CREATE_USER_PASSWORD;
    const role = values.role || 'staff';
    if (!password || password.length < 12 || !values.username?.trim() || !values.name?.trim() ||
        !['student', 'staff', 'maintainer', 'lead'].includes(role)) {
      throw new Error('Supply name, username, valid role and CREATE_USER_PASSWORD (at least 12 characters)');
    }
    const organizationId = await organisationForEmail(values.email);
    const user = await createUser({
      email: values.email.trim().toLowerCase(), username: values.username.trim(), name: values.name.trim(),
      password: await bcrypt.hash(password, 12), userType: role, authorisation: role === 'lead' ? 1 : 2,
    }, organizationId);
    console.log(`Provisioned user ${user.id} in organisation ${organizationId}.`);
  } else throw new Error('Use bind-domain or create-user');
}

main().catch(err => {
  console.error(err.code === '23505' ? 'Domain, organisation, username or email is already registered.' :
    err.code ? 'Provisioning failed. Check database configuration and constraints.' : err.message);
  process.exitCode = 1;
}).finally(async () => { if (process.env.DATABASE_URL) await database.pool.end(); });
