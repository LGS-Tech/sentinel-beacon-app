const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require('@electric-sql/pglite');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const { domainFromEmail } = require('../utils/emailDomain');

// Isolated PostgreSQL WASM engine: real SQL/constraints, no production database.
const pg = new PGlite();
const poolPath = require.resolve('../db/pool');
require.cache[poolPath] = { id: poolPath, filename: poolPath, loaded: true, exports: {
  query: async (sql, params) => {
    const result = await pg.query(sql, params);
    return { ...result, rowCount: result.affectedRows ?? result.rows.length };
  },
}};
const db = require('../db');
const domains = require('../db/queries/organisationDomains');
const password = 'Only-for-isolated-tests-42!';
process.env.JWT_SECRET = 'isolated-domain-tests-not-a-deployment-secret';
let server, base, orgA, orgB, userA, userA2, userB, tokenA, tokenA2, tokenB, caseA, caseB, attachmentB;

async function request(route, token, method = 'GET', body) {
  const result = await fetch(base + route, { method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await result.text();
  return { status: result.status, body: text ? JSON.parse(text) : null };
}

before(async () => {
  const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8')
    // gen_random_uuid is built into PostgreSQL; pgcrypto packaging is not available in WASM.
    .replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '');
  const migration = fs.readFileSync(path.join(__dirname, '../db/migrations/20261029-organisation-domains.sql'), 'utf8');
  await pg.exec(schema); await pg.exec(migration);
  await pg.exec(schema); await pg.exec(migration); // Existing-data migration is repeatable.
  orgA = await db.organisations.createOrganisation({ name: 'Company A', slug: 'company-a' });
  orgB = await db.organisations.createOrganisation({ name: 'Company B', slug: 'company-b' });
  await pg.query(`INSERT INTO organisation_domains(domain,organization_id,approved_by)
    VALUES ('company-a.example',$1,'test operator'),('company-b.example',$2,'test operator')`, [orgA.id, orgB.id]);
  const hash = await bcrypt.hash(password, 4);
  const create = (email, username, org) => db.users.createUser({ email, username, name: username,
    password: hash, userType: 'lead', authorisation: 1 }, org.id);
  userA = await create('alice@company-a.example', 'alice', orgA);
  userA2 = await create('alex@COMPANY-A.EXAMPLE', 'alex', orgA);
  userB = await create('bob@company-b.example', 'bob', orgB);
  caseA = await db.cases.createCase({ title: 'A only', createdByUserId: userA.id }, orgA.id);
  caseB = await db.cases.createCase({ title: 'B only', createdByUserId: userB.id }, orgB.id);
  attachmentB = await db.attachments.createAttachment(caseB.id, { filename: 'private.pdf', storageUrl: 'b/private', storageProvider: 'r2' }, orgB.id);
  await db.floorPlans.upsertFloorPlan(orgB.id, '1', { filename: 'b.png', storageUrl: 'b/floor', storageProvider: 'r2' });
  const app = express(); app.use(express.json()); app.use(require('../routes'));
  app.use(require('../middleware/errorHandler').errorHandler);
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  for (const [user, save] of [[userA, x => tokenA = x], [userA2, x => tokenA2 = x], [userB, x => tokenB = x]]) {
    const result = await request('/auth/login', null, 'POST', { email: user.email, password });
    assert.equal(result.status, 200); save(result.body.token);
  }
});
after(async () => { if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); } await pg.close(); });

test('email domains are exact and normalized; malformed and shared-provider emails are refused', () => {
  assert.equal(domainFromEmail(' Alice@COMPANY-A.EXAMPLE '), 'company-a.example');
  for (const email of ['x@gmail.com', 'x@outlook.com', 'x@@company-a.example', 'x@company-a.example.', 'x@*.example', 'x@https://a.example', 'x y@a.example']) {
    assert.throws(() => domainFromEmail(email));
  }
});

test('two provisioned users of one domain share tenant data; different domain sees only its own', async () => {
  for (const token of [tokenA, tokenA2]) {
    const result = await request('/cases', token); assert.equal(result.status, 200);
    assert.deepEqual(result.body.map(x => x.id), [caseA.id]);
  }
  const b = await request('/cases', tokenB);
  assert.deepEqual(b.body.map(x => x.id), [caseB.id]);
  assert.equal(await domains.organisationForEmail('third@company-a.example'), orgA.id);
});

test('cross-tenant reads, updates, deletes and file content requests are denied', async () => {
  for (const [url, method, body] of [
    [`/cases/${caseB.id}`, 'GET'], [`/cases/${caseB.id}`, 'PUT', { title: 'stolen' }],
    [`/cases/${caseB.id}`, 'DELETE'], [`/users/${userB.id}`, 'GET'],
    [`/cases/${caseB.id}/attachments`, 'GET'],
    [`/cases/${caseB.id}/attachments/${attachmentB.id}/content`, 'GET'],
    ['/floors/1', 'GET'], ['/floors/1/content', 'GET'],
  ]) assert.equal((await request(url, tokenA, method, body)).status, 404, `${method} ${url}`);
  assert.equal((await request(`/cases/${caseA.id}`, tokenB)).status, 404);
});

test('client tenant overrides never control ownership and domain changes cannot switch tenants', async () => {
  const listed = await request(`/cases?organizationId=${orgB.id}`, tokenA);
  assert.deepEqual(listed.body.map(x => x.id), [caseA.id]);
  const created = await request('/cases', tokenA, 'POST', { title: 'Owned by A', organizationId: orgB.id });
  assert.equal(created.status, 201); assert.equal(created.body.organizationId, orgA.id);
  assert.equal((await request(`/users/${userA.id}`, tokenA, 'PUT', { email: 'alice@company-b.example', organizationId: orgB.id })).status, 403);
  assert.equal((await request('/users', tokenA, 'POST', { username: 'foreign', email: 'new@company-b.example', password })).status, 403);
  assert.equal((await db.users.getUserById(userA.id, orgA.id)).email, userA.email);
});

test('signup, unknown domains, unprovisioned email, wrong password and forged JWT are denied', async () => {
  assert.equal((await request('/auth/signup', null, 'POST', { username: 'intruder', email: 'new@company-a.example', name: 'X', password })).status, 403);
  for (const credentials of [{ email: 'new@company-a.example', password }, { email: userA.email, password: 'wrong' }]) {
    assert.equal((await request('/auth/login', null, 'POST', credentials)).status, 401);
  }
  await assert.rejects(domains.organisationForEmail('x@unapproved.example'));
  await assert.rejects(domains.organisationForEmail('x@company-a.example.attacker.example'));
  await assert.rejects(domains.organisationForEmail('x@sub.company-a.example'));
  assert.equal((await request('/cases', 'invalid.token.value')).status, 403);
  assert.equal((await request('/cases')).status, 401);
  const mismatched = jwt.sign({ userId: userA.id, organizationId: orgB.id }, process.env.JWT_SECRET);
  assert.equal((await request('/cases', mismatched)).status, 403);
});

test('missing tenant context fails closed in the actual data layer', async () => {
  for (const call of [() => db.cases.listCases(), () => db.users.listUsers(), () => db.departments.listDepartments(),
    () => db.floorPlans.listFloorPlans(), () => db.cases.getCaseById(caseA.id),
    () => db.attachments.listAttachmentsByCaseId(caseB.id), () => db.cases.createCase({ title: 'No tenant' }),
    () => db.cases.listCaseEvents(caseA.id)]) await assert.rejects(call, /organizationId/);
});

test('domain uniqueness prevents mapping separate domains to one organisation', async () => {
  await assert.rejects(pg.query("INSERT INTO organisation_domains VALUES ('other.example',$1,'test',NOW(),TRUE)", [orgA.id]), /unique/);
  await assert.rejects(pg.query("INSERT INTO organisation_domains VALUES ('company-a.example',$1,'test',NOW(),TRUE)", [orgB.id]), /unique/);
});

test('inactive account, organisation and domain revoke existing tokens immediately', async () => {
  for (const [table, column, id] of [['users', 'id', userA.id], ['organisations', 'id', orgA.id], ['organisation_domains', 'organization_id', orgA.id]]) {
    await pg.query(`UPDATE ${table} SET is_active=FALSE WHERE ${column}=$1`, [id]);
    assert.equal((await request('/cases', tokenA)).status, 403, table);
    const result = await request('/auth/login', null, 'POST', { email: userA.email, password });
    assert.ok([401, 403].includes(result.status), table);
    await pg.query(`UPDATE ${table} SET is_active=TRUE WHERE ${column}=$1`, [id]);
  }
});
