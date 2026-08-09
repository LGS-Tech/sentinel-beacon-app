# Deploying backend/new on Render (demo API)

This hosts the Express API so a static demo (e.g. GitHub Pages) can call it.
Local `npm start` / Docker Postgres stay for day-to-day development.

## What Render needs

| Setting | Value |
|--------|--------|
| Root directory | `backend/new` |
| Runtime | Node |
| Build command | `npm install` |
| Start command | `npm start` |
| Health check | `/health` |

## Env vars (set in Render Dashboard → Environment)

| Key | Notes |
|-----|--------|
| `MONGO_URI` | Same Atlas URI from team chat (required for cases) |
| `ALLOWED_ORIGINS` | Optional extras. Defaults already include `https://lgs-tech.github.io`. Example: `https://lgs-tech.github.io,http://localhost:8081` |
| `DATABASE_URL` | Optional for now (Postgres not wired into `server.js` yet) |

Render sets `PORT` automatically — do not hardcode it.

## Steps (dashboard)

1. Push this repo to GitHub (with `.env` gitignored).
2. Go to [render.com](https://render.com) → **New** → **Web Service**.
3. Connect the repo.
4. Set **Root Directory** = `backend/new`.
5. Build = `npm install`, Start = `npm start`.
6. Add `MONGO_URI` and `ALLOWED_ORIGINS`.
7. Deploy → copy the URL, e.g. `https://lgs-tech-api.onrender.com`.

Or use the root [`render.yaml`](../../render.yaml) Blueprint.

## Point the demo frontend at Render

In the static / Expo web build env (or runtime config):

```env
EXPO_PUBLIC_API_URL=https://YOUR-SERVICE.onrender.com
```

Do **not** commit real secrets. Local `.env` can keep `localhost` / LAN IP for development.

## Important limits (free tier)

- Service may **spin down** after idle; first request can be slow (~30–60s).
- Disk is **ephemeral** — writes to `data/users.json` can reset on redeploy. Cases on **Mongo Atlas** persist.
- Keep developing against local servers; use Render mainly for demos.

## Smoke test after deploy

```bash
curl https://YOUR-SERVICE.onrender.com/health
curl https://YOUR-SERVICE.onrender.com/cases
```
