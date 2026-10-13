# Intruder-alert app

This is an Expo project, which uses TypeScript markup. All of the tabs have been created: Vault, Activity, and Settings should have a bit of functionality, but the main focus is Dashboard. We will split Dashboard code into blocks where each of us will work on a separate block.

## Development workflow

This project follows a feature-branch workflow to keep `main` stable and reduce merge conflicts. We should be able to work efficiently and know see all changes made to the code more clearly:


### Linking backend

The backend is in `backend/new` and uses **PostgreSQL only** (no Mongo).

```bash
cd backend/new
cp .env.example .env
npm install
docker compose up -d
npm run db:setup
npm run db:seed-demo
npm start
```

In `backend/new/.env`, set `DATABASE_URL`, `JWT_SECRET`, and team Postgres password (see backend chat).  
Set `REQUIRE_AUTH=false` locally so the app works before login; use `true` in production when ready.

Leave the server running. In a separate terminal:

```bash
cd expo-app
cp .env.example .env
```

Point `EXPO_PUBLIC_API_URL` at your machine IP (e.g. `http://192.168.x.x:3000`) for a physical device, or `http://localhost:3000` for web.

```bash
ifconfig   # Mac
ipconfig   # Windows
```

MAKE SURE YOU PUT BOTH `.env` FILES IN `.gitignore`. DO NOT COMMIT SECRETS.

### PostgreSQL setup (for the whole team)

The Express API reads/writes **PostgreSQL** via `backend/new/db/`.  
More detail: [`backend/new/db/README.md`](backend/new/db/README.md)

#### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Node.js / npm installed

#### 1. Create your local `.env`
```bash
cd backend/new
cp .env.example .env
npm install
```

In `backend/new/.env`, set the **LGS team** Postgres values (password is in the **backend chat** — do not invent a personal account, and **do not commit `.env`**):

```env
POSTGRES_USER=LGS_Tech
POSTGRES_PASSWORD=<password from backend chat>
POSTGRES_DB=lgs_tech
DATABASE_URL=postgresql://LGS_Tech:<password from backend chat>@localhost:5432/lgs_tech
JWT_SECRET=<long random string>
DEMO_SEED_PASSWORD=<your own password for the local demo users, 8+ characters>
REQUIRE_AUTH=false
PORT=3000
```

If the password contains `@`, URL-encode it as `%40` inside `DATABASE_URL` only  
(example: password `LGS_Tech_123@` → `...LGS_Tech_123%40@localhost...`).

#### 2. Start PostgreSQL (Docker)
```bash
cd backend/new
docker compose up -d
```

If port `5432` is already used by a Windows PostgreSQL install:
```powershell
Stop-Service postgresql-x64-17
```
Then run `docker compose up -d` again.

#### 3. Apply schema and check connection
```bash
npm run db:setup
npm run db:seed-demo
npm run db:ping
```

You should see something like:
- `PostgreSQL schema applied.`
- `departments rows: 6`
- `users rows: 0` on a fresh database (the schema creates no users)
- `Demo seed done. Created: 7, already present (skipped): 0`
- `PostgreSQL OK: ...`

`npm run db:seed-demo` creates the 7 demo users (4 staff incl. one lead, 2 maintainers, 1 student) and gives all of them the password from `DEMO_SEED_PASSWORD` in your `.env`, stored as a bcrypt hash. Log in with one of their emails (see `scripts/seed-demo.js`) and that password. It skips users that already exist and refuses to run when `NODE_ENV=production`; production accounts are never seeded.

Optional: `npm run db:smoke` and `npm run db:smoke-attachments`

#### Useful commands
```bash
docker compose ps          # container status
docker compose logs -f     # DB logs
docker compose down        # stop Postgres
npm run db:ping            # quick connectivity check
npm run db:smoke           # data-layer smoke test
npm run db:seed-demo       # create the demo users (local only)
```

#### What gets created
| Table | Purpose |
|--------|---------|
| `departments` | Teams tickets can be assigned to |
| `users` | Students / staff / maintainers / leads |
| `cases` | Tickets and incidents (location, category, assignment) |
| `case_events` | Feed and assignment history |
| `case_attachments` | File/image metadata (URL only) |

API routes: `/cases`, `/users`, `/auth/login`, `/auth/signup`, `/cases/:id/attachments`

### Demo hosting (GitHub Pages + Render)

| Environment | Frontend | Backend API |
|-------------|----------|-------------|
| **Development** | `npx expo start` on your machine | Local `backend/new` → `http://localhost:3000` |
| **Production (demo)** | GitHub Pages | Render → `https://sentinel-beacon-app.onrender.com` |

Env files in `expo-app/`:
- `.env.development` → local API
- `.env.production` → Render API  

On every push to `main`, GitHub Actions builds the static web app and deploys Pages.

**Demo URL:** https://lgs-tech.github.io/sentinel-beacon-app/

**One-time GitHub setup (org admin):**
1. Repo → **Settings → Pages**
2. Source: **GitHub Actions**
3. On Render, set `ALLOWED_ORIGINS=https://lgs-tech.github.io`

Local backend (dev) still:
```bash
cd backend/new
node server.js
```


## Get started

1. Install dependencies

   ```bash
   cd expo-app
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

### Connecting Settings integrations (optional)

Settings → Profile and Settings → Integrations talk to the **PostgreSQL API** in `backend/new`. Start it first:

```bash
cd backend/new
docker compose up -d
npm run db:setup
npm run db:seed-demo
npm start
```

**Flask alerts API** (optional) — default `http://localhost:5000`:

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Override URLs when needed (e.g. Android emulator cannot use `localhost` for the host machine):

```bash
# Windows PowerShell example
$env:EXPO_PUBLIC_API_URL="http://10.0.2.2:3000"
$env:EXPO_PUBLIC_FLASK_URL="http://10.0.2.2:5000"
cd expo-app
npx expo start
```

- `EXPO_PUBLIC_API_URL` — PostgreSQL API base URL (default `http://localhost:3000`)
- `EXPO_PUBLIC_FLASK_URL` — Flask base URL (default `http://localhost:5000`)

On a physical device, use your computer’s LAN IP instead of `localhost` / `10.0.2.2`.

## Server

The API lives in **`backend/new`** — Node.js + Express + **PostgreSQL** (`pg`).  
There is no MongoDB or file-based `users.json` backend anymore. Demo users are created only by `npm run db:seed-demo` (local/demo, never in production); `db/schema.sql` contains no accounts or passwords.

The legacy `serverOLD/` folder is archived mock JSON storage — do not use it for new work.

## Backend

The folder "backend" is where the python logic and API will be stored. Then it will be connected to the frontend through the expo-app folder. Settings → Integrations pings `/api/v1/intruder/path` to show Flask connection status.

## Documentation

For any team members that are learning Expo alongside...


- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)

