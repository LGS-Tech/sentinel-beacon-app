require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

function buildCorsOptions() {
  const raw = process.env.ALLOWED_ORIGINS || "";
  const origins = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    return { origin: true };
  }

  return {
    origin(origin, callback) {
      if (!origin || origins.includes(origin) || origins.includes("*")) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  };
}

app.use(cors(buildCorsOptions()));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    service: "lgs-tech-api",
    message: "LGS Tech API is running",
    endpoints: ["/health", "/cases", "/users"],
  });
});

app.get("/health", (_req, res) => {
  const mongoState = mongoose.connection.readyState;
  res.status(mongoState === 1 ? 200 : 503).json({
    ok: mongoState === 1,
    service: "lgs-tech-api",
    mongo: mongoState === 1 ? "connected" : "disconnected",
  });
});

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing — set it in .env or Render Environment");
} else {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err.message));
}

const USERS_FILE = path.join(__dirname, "data", "users.json");

function readUsers() {
  const raw = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(raw).users;
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
}

/* Cases */
const casesRouter = require("./routes/cases");
app.use("/cases", casesRouter);

/* Users (file JSON — Settings profile / login) */
app.get("/users", (req, res) => {
  try {
    res.json(readUsers());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/users", (req, res) => {
  try {
    const users = readUsers();
    const newRow = { id: Date.now(), ...req.body };
    users.push(newRow);
    writeUsers(users);
    res.status(201).json(newRow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/users/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const users = readUsers();
    const index = users.findIndex((r) => r.id === id);
    if (index === -1) return res.status(404).send("Not found");
    users[index] = { ...users[index], ...req.body };
    writeUsers(users);
    res.json(users[index]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/users/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const users = readUsers().filter((r) => r.id !== id);
    writeUsers(users);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});