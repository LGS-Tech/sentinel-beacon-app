require("dotenv").config();

const express = require("express");
const cors = require("cors");

const apiRoutes = require("./routes"); 

const app = express();
const PORT = process.env.PORT || 3000;

function buildCorsOptions() {
  const defaults = [
    "https://lgs-tech.github.io",
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
    endpoints: ["/health", "/api/cases", "/api/users"],
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "lgs-tech-api",
    database: "postgres-layer-active"
  });
});

app.use("/api", apiRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
