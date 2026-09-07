require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db"); //import the database connection module

const apiRoutes = require("./routes"); 

const app = express();
const PORT = process.env.PORT || 3000;

function buildCorsOptions() {
  const defaults = [
    "https://lgs-tech.github.io",
    "https://lgstech.co",
    "https://www.lgstech.co",
    "http://localhost:8081",
    "http://localhost:19006",
    "http://127.0.0.1:8081",
  ];
  const fromEnv = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const origins = [...new Set([...defaults, ...fromEnv])];

  if (origins.includes("*")) {
    return { origin: true };
  }

  return {
    origin(origin, callback) {
      if (!origin || origins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
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

app.get("/health", async (_req, res) => {
  try {
    await db.ping();
    res.status(200).json({
      ok: true,
      service: "lgs-tech-api",
      database: "connected",
    });
  } catch (err) {
    res.status(503).json({
      ok: false,
      service: "lgs-tech-api",
      database: "disconnected",
    });
  }
});

app.use(apiRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
