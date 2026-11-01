const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const express=require('express');
const {PGlite}=require('@electric-sql/pglite');
const {RESET_ID,validateManifest,resetTestOrganisations,cleanupResetStorage}=require('../scripts/reset-test-organisations');
test('reset rolls back on failure, runs once, and isolates all eight replacement accounts',async()=>{
 const pg=new PGlite();let server;
 const query=async(sql,params)=>{const r=await pg.query(sql,params);return {...r,rowCount:r.affectedRows??r.rows.length};};
 try{
  await pg.exec(fs.readFileSync(path.join(__dirname,'../db/schema.sql'),'utf8').replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";',''));
  await pg.exec(fs.readFileSync(path.join(__dirname,'../db/migrations/20261029-organisation-domains.sql'),'utf8'));
  const database=(await query('SELECT current_database() AS name')).rows[0].name;
  const password='Isolated-fixture-only-2026!';const passwordHash=await bcrypt.hash(password,12);
  const manifest={confirm:RESET_ID,database,organisations:['a','b'].map(x=>({slug:`lgs-test-${x}`,name:`Test ${x}`,domain:`org-${x}.lgs.test`,users:['lead','staff','staff','maintainer'].map((role,i)=>({username:`${x}${i}`,name:`${x}${i}`,email:`tester${i}@org-${x}.lgs.test`,role,passwordHash}))}))};
  const client={query};const raw=JSON.stringify(manifest);
  const oldId=(await query('SELECT MAX(id) AS id FROM users')).rows[0].id;
  const oldOrg=(await query('SELECT id FROM organisations LIMIT 1')).rows[0].id;
  await query("INSERT INTO floor_plans(organization_id,floor,filename,storage_url) VALUES($1,'1','old.png','old/floor.png')",[oldOrg]);
  assert.equal(await resetTestOrganisations(client,undefined),false);
  await assert.rejects(resetTestOrganisations(client,JSON.stringify({...manifest,database:'wrong'})),/does not match/);
  assert.throws(()=>validateManifest(JSON.stringify({...manifest,confirm:'no'})));
  const bad=structuredClone(manifest);bad.organisations[1].domain=bad.organisations[0].domain;assert.throws(()=>validateManifest(JSON.stringify(bad)));
  await query("ALTER TABLE users ADD CONSTRAINT reject_test_users CHECK(email NOT LIKE '%lgs.test')");
  await assert.rejects(resetTestOrganisations(client,raw));
  assert.equal(Number((await query('SELECT COUNT(*) AS n FROM users')).rows[0].n),7);
  await query('ALTER TABLE users DROP CONSTRAINT reject_test_users');
  assert.equal(await resetTestOrganisations(client,raw),true);
  const users=(await query('SELECT * FROM users ORDER BY id')).rows;
  assert.equal(users.length,8);assert.ok(users.every(u=>u.id>oldId&&!u.email.endsWith('@gmail.com')));
  assert.equal(Number((await query('SELECT COUNT(*) AS n FROM organisations')).rows[0].n),2);
  await assert.rejects(cleanupResetStorage(client,{isConfigured:()=>false}),/R2/);
  await assert.rejects(cleanupResetStorage(client,{isConfigured:()=>true,deleteObject:async()=>{throw Error('storage unavailable');}}));
  const deleted=[];await cleanupResetStorage(client,{isConfigured:()=>true,deleteObject:async key=>deleted.push(key)});assert.deepEqual(deleted,['old/floor.png']);
  await cleanupResetStorage(client,{isConfigured:()=>true,deleteObject:async()=>assert.fail('already deleted')});
  const poolPath=require.resolve('../db/pool');require.cache[poolPath]={id:poolPath,filename:poolPath,loaded:true,exports:{query}};
  process.env.JWT_SECRET='isolated-reset-tests-only';
  const app=express();app.use(express.json());app.use(require('../routes'));app.use(require('../middleware/errorHandler').errorHandler);
  server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base=`http://127.0.0.1:${server.address().port}`;
  async function call(route,token,method='GET',body){const r=await fetch(base+route,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json()};}
  const sessions=[];for(const u of users){const r=await call('/auth/login',null,'POST',{email:u.email,password});assert.equal(r.status,200);sessions.push({...u,token:r.body.token});}
  const cases=[];for(const lead of [sessions[0],sessions[4]]){const r=await call('/cases',lead.token,'POST',{title:`Test ${lead.organization_id}`});assert.equal(r.status,201);cases.push(r.body);}
  for(const u of sessions){const own=cases.find(c=>c.organizationId===u.organization_id),other=cases.find(c=>c.organizationId!==u.organization_id);const r=await call('/cases',u.token);assert.equal(r.status,200);assert.deepEqual(r.body.map(c=>c.id),[own.id]);assert.equal((await call(`/cases/${other.id}`,u.token)).status,404);const people=await call('/users',u.token);assert.equal(people.body.length,4);assert.ok(people.body.every(p=>p.organizationId===u.organization_id));}
  const oldToken=jwt.sign({userId:oldId,organizationId:oldOrg},process.env.JWT_SECRET);assert.equal((await call('/cases',oldToken)).status,403);
  assert.equal((await call('/auth/login',null,'POST',{email:'ellamcintosh@gmail.com',password})).status,401);
  assert.equal(await resetTestOrganisations(client,raw),false);assert.equal(Number((await query('SELECT COUNT(*) AS n FROM cases')).rows[0].n),2);
  assert.deepEqual((await query('SELECT id FROM users ORDER BY id')).rows.map(u=>u.id),users.map(u=>u.id));
 }finally{if(server){server.closeAllConnections();await new Promise(r=>server.close(r));}await pg.close();}
});
