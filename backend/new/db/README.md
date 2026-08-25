# PostgreSQL base (LGS Tech)

This folder is the **PostgreSQL foundation** for LGS Tech. The live Express API in `server.js` still uses Mongo (cases) and `data/users.json` until the team switches routes over.

## Shared credentials (team)

| Field | Value |
|--------|--------|
| Username | `LGS_Tech` |
| Database | `lgs_tech` |
| Password | ask in backend chat / local `.env` (`POSTGRES_PASSWORD`) — **do not commit** |

## Tables

| Table | Purpose |
|--------|---------|
| `departments` | Assignable teams (Facilities, IT, Engineering, Security, Medical, Estates) |
| `users` | Students, staff, maintainers, leads (expanded from `users.json`) |
| `cases` | Tickets / incidents (expanded from Mongo `Case`) |
| `case_events` | Feed + assignment / status history |

### Users (extra vs JSON)

`college_id`, `department_id`, `year_semester`, `user_type` (`student` / `staff` / `maintainer` / `lead`), `is_active`, `last_login_at`, `updated_at`

### Cases (extra vs Mongo)

`category`, `description`, `chat`, `priority`, `assigned_department_id`, `assigned_user_id`, `created_by_user_id`, `closed_by_user_id`, `closed_at`, `estimated_cost`, emergency-service flags

Status: `ACTIVE` \| `IN_PROGRESS` \| `CLOSED` \| `RESOLVED`  
Category: Fire, Intruder, Injury, Maintenance, Missing, Facilities, IT Support, Engineering

## Data layer (`db/`)

```js
const db = require("./db"); // from backend/new

await db.users.listUsers();
await db.users.getUserByEmail("aisha.khan@student.lgs.ac.uk");
await db.cases.createCase({ title: "Fire Case", locationX: 0.4, locationY: 0.2 });
await db.cases.assignCase(id, { departmentId: 6, userId: 5 });
await db.cases.listCases({ openOnly: true });
await db.cases.analyticsSummary();
```

Rows are mapped to the current API shape (`createdAt`, `_id`, `"phone number"`, …) so routes can switch later without a frontend rewrite.

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
   npm run db:smoke
   ```

`db:setup` is idempotent — it adds new columns/tables on an existing volume.

## Local Windows PostgreSQL install

1. Start service `postgresql-x64-17`
2. As superuser, create role/db (see `db/init-role.sql`)
3. Set `DATABASE_URL` and run `npm run db:setup`

## Note for the team

**Mongo `server.js` is still the live local API.**  
When we switch `/cases` and `/users` to this data layer, say so in the backend chat first.
