# Deploying backend/new on Render (PostgreSQL API)

This hosts the Express API so a static demo (e.g. GitHub Pages) can call it.

## What Render needs

| Setting | Value |
|--------|--------|
| Root directory | `backend/new` |
| Runtime | Node |
| Build command | `npm install` |
| Start command | `npm start` |
| Health check | `/health` |

## Env vars (Render Dashboard → Environment)

| Key | Notes |
|-----|--------|
| `DATABASE_URL` | **Required** — managed Postgres or external URL |
| `JWT_SECRET` | **Required** — long random string for `/auth/login` |
| `REQUIRE_AUTH` | `false` for demo until all clients send Bearer tokens; `true` in production |
| `ALLOWED_ORIGINS` | e.g. `https://lgs-tech.github.io,http://localhost:8081` |

Render sets `PORT` automatically.

After first deploy with a new database, run schema setup once (from your machine or a one-off job):

```bash
npm run db:setup
npm run db:hash-seeds
```

## Smoke test after deploy

```bash
curl https://YOUR-SERVICE.onrender.com/health
curl https://YOUR-SERVICE.onrender.com/cases
curl -X POST https://YOUR-SERVICE.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jimstevens@gmail.com","password":"London588"}'
```

## Local development

```bash
docker compose up -d
npm run db:setup
npm run db:hash-seeds
npm start
```
