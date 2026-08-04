# Intruder-alert app

This is an Expo project, which uses TypeScript markup. All of the tabs have been created: Vault, Activity, and Settings should have a bit of functionality, but the main focus is Dashboard. We will split Dashboard code into blocks where each of us will work on a separate block.

## Development workflow

This project follows a feature-branch workflow to keep `main` stable and reduce merge conflicts. We should be able to work efficiently and know see all changes made to the code more clearly:


### Linking backend

The backend is located inside backend/new. In your terminal, 

```bash
cd backend/new
cp .env.example .env
npm install
node server.js
```

Then in your .env file, paste in the MONGO_URI string that has been shared on the main chat. Then,

```bash
node server.js
```


Leave this terminal running. Then in a separate terminal window (to keep your server running), 

```bash
cd expo-app
cd .env.example .env
```

Then in your .env file, put your local IP address into the string which you can find using your terminal (e.g., 192.161.1.80).
You can find this out on Mac by running:

```bash
ifconfig
```

or on Windows by:

```bash
ipconfig
```

MAKE SURE YOU PUT BOTH .env FILES IN YOUR .gitignore.
DO NOT PUSH WITHOUT DOING THIS, I WILL PROVIDE SUPPORT IF NEEDED
Let me know if there's any issues!

### PostgreSQL setup (for the whole team)

PostgreSQL is the new shared database base under `backend/new`.  
It mirrors the current Case model and users data. **Mongo `server.js` is still the live API for now** — Postgres is ready so backend members can implement against it.

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
```

If the password contains `@`, URL-encode it as `%40` inside `DATABASE_URL` only  
(example: password `LGS_Tech_123@` → `...LGS_Tech_123%40@localhost...`).

Keep your existing `MONGO_URI` and `PORT=3000` in the same file.

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
npm run db:ping
```

You should see something like:
- `PostgreSQL schema applied.`
- `users rows: 4` (seed staff accounts)
- `PostgreSQL OK: ...`

#### Useful commands
```bash
docker compose ps          # container status
docker compose logs -f     # DB logs
docker compose down        # stop Postgres
npm run db:ping            # quick connectivity check
```

#### What gets created
| Table | Purpose |
|--------|---------|
| `cases` | Tickets (from `models/Case.js`) |
| `users` | Accounts / roles (from `data/users.json`) |

#### Note before changing `server.js`
If you plan to switch API routes from Mongo to Postgres, tell the team in the backend chat first so nobody’s local server breaks.

### Hosting the backend on Render (demo)

For a public demo (e.g. static site on GitHub Pages), host `backend/new` on [Render](https://render.com). Keep using local servers for day-to-day development.

Full steps: [`backend/new/RENDER.md`](backend/new/RENDER.md)

Quick version:
1. Push the repo to GitHub (never commit `.env`).
2. Render → **New Web Service** → connect repo → **Root Directory** = `backend/new`.
3. Build: `npm install` · Start: `npm start` · Health: `/health`.
4. Set env vars: `MONGO_URI`, `ALLOWED_ORIGINS` (your GitHub Pages URL).
5. Point the demo app at `EXPO_PUBLIC_API_URL=https://YOUR-SERVICE.onrender.com`.

There is also a root [`render.yaml`](render.yaml) Blueprint if you prefer one-click Blueprint deploy.


### 1. Sync With Main
Firstly ensure your local `main` branch is up to date:

```bash
git checkout main
git pull origin main
```

### 2. Create a feature branch
All new work should be done on a feature branch:

```bash
git checkout -b feature/<short-feature-name>
```

Example:
```bash
git checkout -b feature/vault-jpeg-support
```

### 3. Make changes and commit them
Commit changes with a descriptive message of the changes made:

```bash
git add .
git commit -m "feat: added jpeg support to vault"
```

### 4. Push your branch
Push your feature branch to GitHub:

```bash
git push -u origin feature/<short-feature-name>
```

Example (upon jpeg support added to vault):
```bash
git push -u origin feature/vault-jpeg-support
```

### 5. Open a pull request
- Open a pull request from your feature branch into `main` (there should be a button that shows an option for this after pushing)
- Request at least one review from one of us on frontend team
- Address any feedback before merging

### 6. Keep feature branch up to date
- If changes are being made to main branch whilst feature branch is still under review, then pull the latest `main` regularly to ensure compatibility:

Example (upon jpeg support added to vault):
```bash
git checkout feature/vault-jpeg-support
git pull origin main
```

### 7. After merge
Once your pull request is merged:
- Delete the feature branch
- Pull the latest `main` before starting new work:

```bash
git branch -d feature/vault-jpeg-support
git checkout main
git pull origin main
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

Settings → Profile and Settings → Integrations talk to the local backends. Start them in separate terminals:

**Express mock API** (users / cases) — default `http://localhost:3000`:

```bash
cd server
npm install
node server.js
```

**Flask alerts API** — default `http://localhost:5000`:

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

- `EXPO_PUBLIC_API_URL` — Express base URL (default `http://localhost:3000`)
- `EXPO_PUBLIC_FLASK_URL` — Flask base URL (default `http://localhost:5000`)

On a physical device, use your computer’s LAN IP instead of `localhost` / `10.0.2.2`.

## Server

The "server" folder is where a Node.js/Express, file-based database will be contained for temporary use to simulate true backend. 
This contains tables for User and Case that will be connected to the Expo app. Settings Profile loads/saves the current prototype user via this API.

## Backend

The folder "backend" is where the python logic and API will be stored. Then it will be connected to the frontend through the expo-app folder. Settings → Integrations pings `/api/v1/intruder/path` to show Flask connection status.

## Documentation

For any team members that are learning Expo alongside...


- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)

