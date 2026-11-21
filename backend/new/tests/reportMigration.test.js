const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require('@electric-sql/pglite');
const express = require('express');
const jwt = require('jsonwebtoken');
const { applySchema } = require('../scripts/setup-postgres');

test('existing database upgrades restore report submission and case loading without replaying seeds', async () => {
  const pg = new PGlite();
  let server;
  const query = async (sql, params) => {
    const r = await pg.query(sql, params);
    return { ...r, rowCount: r.affectedRows ?? r.rows.length };
  };
  // node-postgres accepts multi-statement migration SQL; PGlite uses exec for it.
  const client = { query: sql => pg.exec(sql).then(results => results.at(-1)) };
  try {
    const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8')
      .replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '')
      .replace(/^ALTER TABLE cases ADD COLUMN IF NOT EXISTS (severity|sub_type|building|room|landmark|note) TEXT;\n/gm, '');
    await pg.exec(schema);
    await pg.exec(fs.readFileSync(path.join(__dirname, '../db/migrations/20261029-organisation-domains.sql'), 'utf8'));
    const poolPath = require.resolve('../db/pool');
    require.cache[poolPath] = { id: poolPath, filename: poolPath, loaded: true, exports: { query } };
    const db = require('../db');
    const orgA = await db.organisations.createOrganisation({ name: 'Report A', slug: 'report-a' });
    const orgB = await db.organisations.createOrganisation({ name: 'Report B', slug: 'report-b' });
    await query("INSERT INTO organisation_domains(domain,organization_id,approved_by) VALUES ('report-a.example',$1,'test'),('report-b.example',$2,'test')", [orgA.id, orgB.id]);
    const users = [];
    for (const [org, role] of [[orgA, 'lead'], [orgA, 'maintainer'], [orgB, 'lead']]) {
      users.push(await db.users.createUser({ username: `report-${org.id}-${role}`, name: role,
        email: `${role}@${org === orgA ? 'report-a' : 'report-b'}.example`, password: 'fixture', userType: role }, org.id));
    }
    const dept = await db.departments.createDepartment({ name: 'Report Facilities', slug: 'report-facilities', kind: 'facilities', organizationId: orgA.id });
    const legacy = await query("INSERT INTO cases(title,organization_id,created_by_user_id) VALUES ('Existing customer report',$1,$2) RETURNING id", [orgA.id, users[0].id]);
    const snapshot = async () => (await query('SELECT id, username, email, password, user_type, organization_id FROM users ORDER BY id')).rows;
    const before = await snapshot();
    process.env.JWT_SECRET = 'report-migration-isolated-test';
    const token = user => jwt.sign({ userId: user.id, organizationId: user.organizationId }, process.env.JWT_SECRET);
    const app = express(); app.use(express.json()); app.use(require('../routes'));
    app.use((err, req, res, next) => res.status(500).json({ error: err.message }));
    server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
    async function request(route, user, method = 'GET', body) {
      const r = await fetch(`http://127.0.0.1:${server.address().port}${route}`, { method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token(user)}` },
        body: body === undefined ? undefined : JSON.stringify(body) });
      return { status: r.status, body: await r.json() };
    }
    const report = { title: 'Maintenance Case', category: 'Maintenance', severity: 'High', subType: 'Leak',
      building: 'North', room: '201', landmark: 'Stairs', note: 'Water on floor', floor: '2',
      assignedDepartmentId: dept.id, assignedUserId: users[1].id };
    for (const r of [await request('/cases', users[0]), await request('/cases', users[0], 'POST', report)]) {
      assert.equal(r.status, 500); assert.match(r.body.error, /column.*severity.*does not exist/);
    }
    await applySchema(client);
    assert.deepEqual(await snapshot(), before, 'provisioned accounts must not change');
    let list = await request('/cases', users[0]); assert.equal(list.status, 200);
    assert.ok(list.body.some(c => c.id === legacy.rows[0].id));
    for (const user of [users[0], users[1]]) {
      const created = await request('/cases', user, 'POST', report);
      assert.equal(created.status, 201, JSON.stringify(created.body));
      for (const field of ['severity','subType','building','room','landmark','note','floor']) assert.equal(created.body[field], report[field]);
      assert.equal(created.body.assignedUserId, users[1].id);
      const loaded = await request(`/cases/${created.body.id}`, users[0]); assert.equal(loaded.status, 200);
      assert.equal(loaded.body.note, report.note);
      assert.equal((await request(`/cases/${created.body.id}`, users[2])).status, 404);
      const events = await db.cases.listCaseEvents(created.body.id, orgA.id);
      assert.equal(events.length, 1); assert.equal(events[0].eventType, 'created');
    }
    list = await request('/cases', users[0]);
    await applySchema(client); // Every restart must preserve new and existing reports.
    assert.deepEqual((await request('/cases', users[0])).body, list.body);
    assert.deepEqual(await snapshot(), before);
    assert.deepEqual((await request('/cases', users[2])).body, []);
  } finally {
    if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
    await pg.close();
  }
});
