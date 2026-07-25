# PostgreSQL base (LGS Tech)

This folder adds the **PostgreSQL foundation** for LGS Tech without replacing the current Mongo-backed `server.js`.

## Shared credentials (team)

| Field | Value |
|--------|--------|
| Username | `LGS_Tech` |
| Database | `lgs_tech` |
| Password | ask in backend chat / local `.env` (`POSTGRES_PASSWORD`) — **do not commit** |

## What maps from `backend/new`

| Current (Mongo / JSON) | PostgreSQL |
|------------------------|------------|
| `models/Case.js` | `cases` table (`db/schema.sql`) |
| `data/users.json` | `users` table |

## Quick start (Docker — recommended)

From `backend/new`:

1. Ensure `.env` has:
   ```env
   POSTGRES_PASSWORD=<team password>
   DATABASE_URL=postgresql://LGS_Tech:<team password>@localhost:5432/lgs_tech
   ```
2. If Windows already has PostgreSQL installed, **stop** the local service so Docker can use port `5432`:
   ```powershell
   Stop-Service postgresql-x64-17
   ```
3. Start Postgres:
   ```bash
   docker compose up -d
   ```
4. Apply / verify schema:
   ```bash
   npm run db:setup
   npm run db:ping
   ```

## Local Windows PostgreSQL install

1. Start service `postgresql-x64-17`
2. As superuser, create role/db (see `db/init-role.sql`)
3. Set `DATABASE_URL` and run `npm run db:setup`

## Note for the team

**Mongo `server.js` is still the live local API.**  
PostgreSQL is the new DB base. When we switch routes over, we’ll say so in the backend chat before changing `server.js`.
