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
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Server

The "server" folder is where a Node.js/Express, file-based database will be contained for temporary use to simulate true backend. 
This contains tables for User and Case that will be connected to the Expo app.

## Backend

The folder "backend' is where the python logic and API will be stored. Then it will be connected to the frontend through the expo-app folder.

## Documentation

For any team members that are learning Expo alongside...


- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)

