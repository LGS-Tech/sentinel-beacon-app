# Deploying backend/new on Render (PostgreSQL)

Production uses **Render Postgres** + the Node API in `backend/new`. MongoDB and file-based JSON are not used.

This hosts the Express API so a static demo (e.g. GitHub Pages) can call it.
Local `npm start` / Docker Postgres stay for day-to-day development.

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

Render sets `PORT` automatically — do not hardcode it.

## Steps (dashboard)

1. Push this repo to GitHub (with `.env` gitignored).
2. Go to [render.com](https://render.com) → **New** → **Web Service** (or use the root [`render.yaml`](../../render.yaml) Blueprint).
3. Connect the repo.
4. Set **Root Directory** = `backend/new`.
5. Build = `npm install`, Pre-deploy = `npm run db:setup && npm run db:hash-seeds`, Start = `npm start`.
6. Add `DATABASE_URL`, `JWT_SECRET`, and `ALLOWED_ORIGINS`.
7. Deploy → copy the URL, e.g. `https://lgs-tech-api.onrender.com`.

## Point the demo frontend at Render

In the static / Expo web build env (or runtime config):

```env
EXPO_PUBLIC_API_URL=https://YOUR-SERVICE.onrender.com
```

Do **not** commit real secrets. Local `.env` can keep `localhost` / LAN IP for development.

## Important limits (free tier)

- Service may **spin down** after idle; first request can be slow (~30–60s).
- PostgreSQL is the persistent backend data store; do not store application data in the service filesystem.
- Keep developing against local servers; use Render mainly for demos.

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
