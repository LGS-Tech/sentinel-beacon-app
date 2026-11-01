// Explicit, operator-authorised one-time reset. Never enabled by default.
const { domainFromEmail } = require('../utils/emailDomain');
const RESET_ID = 'lgs-isolation-test-reset-2026-11-01';

function validateManifest(raw) {
  const m = JSON.parse(raw);
  if (m.confirm !== RESET_ID || typeof m.database !== 'string' || !m.database ||
      !Array.isArray(m.organisations) || m.organisations.length !== 2) throw new Error('Invalid reset manifest');
  const domains = new Set(), emails = new Set(), usernames = new Set();
  for (const o of m.organisations) {
    if (!/^lgs-test-[ab]$/.test(o.slug) || !o.name ||
        !/^org-[ab]\.lgs\.test$/.test(o.domain) || domains.has(o.domain) ||
        !Array.isArray(o.users) || o.users.length !== 4) throw new Error('Expected two distinct test organisations with four users each');
    domains.add(o.domain);
    for (const u of o.users) {
      if (domainFromEmail(u.email) !== o.domain || emails.has(u.email.toLowerCase()) ||
          !/^[a-z0-9.-]+$/.test(u.username || '') || usernames.has(u.username) ||
          !u.name || !['lead', 'staff', 'maintainer'].includes(u.role) ||
          !/^\$2[aby]\$12\$[./A-Za-z0-9]{53}$/.test(u.passwordHash || '')) throw new Error('Invalid reset account');
      emails.add(u.email.toLowerCase()); usernames.add(u.username);
    }
    if (!o.users.some(u => u.role === 'lead')) throw new Error('Each organisation needs a lead');
  }
  if (new Set(m.organisations.map(o => o.slug)).size !== 2) throw new Error('Duplicate organisation slug');
  return m;
}

async function resetTestOrganisations(client, raw) {
  if (!raw) return false;
  const m = validateManifest(raw); // Validate everything before touching any records.
  const { rows } = await client.query('SELECT current_database() AS name');
  if (rows[0].name !== m.database) throw new Error('Reset database does not match manifest');
  await client.query('BEGIN');
  try {
    await client.query('SELECT pg_advisory_xact_lock(741101)');
    await client.query(`CREATE TABLE IF NOT EXISTS operator_resets (
      id TEXT PRIMARY KEY, completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    const done = await client.query('SELECT id FROM operator_resets WHERE id=$1', [RESET_ID]);
    if (done.rows.length) { await client.query('COMMIT'); return false; }
    await client.query(`LOCK TABLE users, departments, organisations, organisation_domains,
      cases, case_events, case_attachments, floor_plans IN ACCESS EXCLUSIVE MODE`);
    await client.query(`CREATE TABLE IF NOT EXISTS reset_storage_cleanup (
      storage_key TEXT PRIMARY KEY, completed_at TIMESTAMPTZ)`);
    await client.query(`INSERT INTO reset_storage_cleanup(storage_key)
      SELECT storage_url FROM case_attachments WHERE storage_provider='r2'
      UNION SELECT storage_url FROM floor_plans WHERE storage_provider='r2'
      ON CONFLICT DO NOTHING`);
    // No CASCADE and no sequence restart: unknown dependencies abort the reset,
    // and old signed tokens can never match replacement user IDs.
    for (const table of ['case_attachments', 'floor_plans', 'case_events', 'cases',
      'users', 'departments', 'organisation_domains', 'organisations']) await client.query(`DELETE FROM ${table}`);
    for (const o of m.organisations) {
      const org = await client.query('INSERT INTO organisations(name,slug) VALUES($1,$2) RETURNING id', [o.name, o.slug]);
      const id = org.rows[0].id;
      await client.query('INSERT INTO organisation_domains(domain,organization_id,approved_by) VALUES($1,$2,$3)',
        [o.domain, id, 'Krish: authorised disposable test reset; reserved test domain']);
      const dept = await client.query("INSERT INTO departments(name,slug,kind,organization_id) VALUES('Facilities','facilities','facilities',$1) RETURNING id", [id]);
      for (const u of o.users) await client.query(`INSERT INTO users
        (username,email,name,password,user_type,authorisation,organization_id,department_id)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8)`, [u.username,u.email.toLowerCase(),u.name,u.passwordHash,
        u.role,u.role === 'lead' ? 1 : 2,id,u.role === 'maintainer' ? dept.rows[0].id : null]);
    }
    await client.query('INSERT INTO operator_resets(id) VALUES($1)', [RESET_ID]);
    await client.query('COMMIT');
    return true;
  } catch (err) { await client.query('ROLLBACK'); throw err; }
}

async function cleanupResetStorage(client, storage) {
  const exists = await client.query("SELECT to_regclass('public.reset_storage_cleanup') AS name");
  if (!exists.rows[0].name) return;
  const pending = await client.query('SELECT storage_key FROM reset_storage_cleanup WHERE completed_at IS NULL');
  if (pending.rows.length && !storage.isConfigured()) throw new Error('R2 must be configured to finish reset cleanup');
  for (const row of pending.rows) {
    await storage.deleteObject(row.storage_key);
    await client.query('UPDATE reset_storage_cleanup SET completed_at=NOW() WHERE storage_key=$1', [row.storage_key]);
  }
}

module.exports = { RESET_ID, validateManifest, resetTestOrganisations, cleanupResetStorage };
