# Deploying backend/new on Render (PostgreSQL)

Production uses **Render Postgres** + the Node API in `backend/new`. MongoDB and file-based JSON are not used.

This hosts the Express API so a static demo (e.g. GitHub Pages) can call it.
Local `npm start` / Docker Postgres stay for day-to-day development.

## Free plan Start Command (what we actually use)

**Pre-Deploy is not available on Render’s free plan.** Do not treat Pre-Deploy as the production path.

On the free web service, put schema + seed hashing in the **Start Command**:

```
npm run db:setup && npm run db:hash-seeds && npm start
```

| Setting | Free-plan value |
|--------|------------------|
| Root directory | `backend/new` |
| Runtime | Node |
| Build command | `npm install` |
| Start command | `npm run db:setup && npm run db:hash-seeds && npm start` |
| Health check | `/health` |

Paid plans can optionally move setup to **Pre-Deploy** (`npm run db:setup && npm run db:hash-seeds`) and use `npm start` as Start. That is optional and is **not** the path used for this demo.

## Blueprint (`render.yaml`)

The repo blueprint provisions:

- **Database:** `lgs-tech-postgres` (free tier)
- **Web service:** `lgs-tech-api` with `DATABASE_URL` wired from the database
- **Start command:** `npm run db:setup && npm run db:hash-seeds && npm start` (schema + bcrypt demo passwords, then the API)

After linking the blueprint or updating an existing service, set in the Render dashboard:

| Key | Notes |
|-----|--------|
| `JWT_SECRET` | **Required** — long random string for `/auth/login` |
| `ALLOWED_ORIGINS` | e.g. `https://lgs-tech.github.io,https://lgstech.co,https://www.lgstech.co,http://localhost:8081` |

`REQUIRE_AUTH` defaults to `false` for the demo; set `true` when all clients send Bearer tokens.

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
5. Build = `npm install`. Start = `npm run db:setup && npm run db:hash-seeds && npm start`.
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
  -d '{"email":"user@example.com","password":"<demo-password>"}'
```

`/health` should return `"database":"postgresql"` and `"status":"connected"`.

## Backup before any plan or database change

Take a private `pg_dump` **before** changing the Render Postgres plan, storage, or replacing the instance. Do not commit the dump or the connection string, and do not paste either into issues or chat.

1. In the Render dashboard, confirm the workspace that owns the database, the current plan, status, and who pays the bill. Production should sit in an LGS-controlled workspace. A service cannot be assumed to move between workspaces.
2. Put the **external** connection string in your shell only (environment variable, not a file in this repo).
3. Dump from a machine that has PostgreSQL client tools:

```bash
pg_dump --format=custom --no-owner --file=lgs-tech-prechange.dump "$DATABASE_URL"
pg_restore --list lgs-tech-prechange.dump
```

PowerShell:

```powershell
pg_dump --format=custom --no-owner --file=lgs-tech-prechange.dump $env:DATABASE_URL
pg_restore --list lgs-tech-prechange.dump
```

4. Confirm the dump file exists and `pg_restore --list` prints a table of contents. Copy the file to private storage, then delete the local copy.
5. After a plan change, check `GET /health` (`"database":"postgresql"`, `"status":"connected"`), log in, and read a case. Keep that evidence private.

If the database is not in the workspace that should own billing, write the migration plan and keep this dump until a restore has been proven. Do not drop the current database as part of that check.

## Local development

```bash
docker compose up -d
npm run db:setup
npm run db:hash-seeds
npm start
```
