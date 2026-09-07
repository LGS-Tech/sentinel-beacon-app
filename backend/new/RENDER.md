# Deploying backend/new on Render (PostgreSQL)

Production uses **Render Postgres** + the Node API in `backend/new`. MongoDB and file-based JSON are not used.

## Blueprint (`render.yaml`)

The repo blueprint provisions:

- **Database:** `lgs-tech-postgres` (free tier)
- **Web service:** `lgs-tech-api` with `DATABASE_URL` wired from the database
- **Pre-deploy:** `npm run db:setup && npm run db:hash-seeds` (schema + bcrypt demo passwords)

After linking the blueprint or updating an existing service, set in the Render dashboard:

| Key | Notes |
|-----|--------|
| `JWT_SECRET` | **Required** — long random string for `/auth/login` |
| `ALLOWED_ORIGINS` | e.g. `https://lgs-tech.github.io,https://lgstech.co,https://www.lgstech.co,http://localhost:8081` |

`REQUIRE_AUTH` defaults to `false` for the demo; set `true` when all clients send Bearer tokens.

## Manual service setup (if not using blueprint)

| Setting | Value |
|--------|--------|
| Root directory | `backend/new` |
| Runtime | Node |
| Build command | `npm install` |
| Pre-deploy command | `npm run db:setup && npm run db:hash-seeds` |
| Start command | `npm start` |
| Health check | `/health` |

## Env vars (Render Dashboard → Environment)

| Key | Notes |
|-----|--------|
| `DATABASE_URL` | **Required** — from Render Postgres **Internal** connection string |
| `JWT_SECRET` | **Required** — long random string for `/auth/login` |
| `REQUIRE_AUTH` | `false` for demo until all clients send Bearer tokens; `true` in production |
| `ALLOWED_ORIGINS` | e.g. `https://lgs-tech.github.io,https://lgstech.co,https://www.lgstech.co,http://localhost:8081` |

Render sets `PORT` automatically.

## Smoke test after deploy

```bash
curl https://YOUR-SERVICE.onrender.com/health
curl https://YOUR-SERVICE.onrender.com/cases/analytics
curl https://YOUR-SERVICE.onrender.com/cases
curl -X POST https://YOUR-SERVICE.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jimstevens@gmail.com","password":"London588"}'
```

`/health` should return `"database":"postgresql"` and `"status":"connected"`.

## Local development

```bash
docker compose up -d
npm run db:setup
npm run db:hash-seeds
npm start
```
