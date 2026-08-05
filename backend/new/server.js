require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const Case = require("./models/Case");
const logger = require("./utils/logger");
const requestLogger = require("./middleware/requestLogger");
const {
  notFoundHandler,
  errorHandler,
} = require("./middleware/errorHandler");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.disable("x-powered-by");

function buildCorsOptions() {
  const raw = process.env.ALLOWED_ORIGINS || "";

  const origins = raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  // Allow local development, Expo and non-browser clients
  // when ALLOWED_ORIGINS has not been configured.
  if (origins.length === 0) {
    return { origin: true };
  }

  return {
    origin(origin, callback) {
      const isAllowed =
        !origin ||
        origins.includes(origin) ||
        origins.includes("*");

      if (isAllowed) {
        return callback(null, true);
      }

      const error = new Error(
        `CORS blocked for origin: ${origin}`
      );
      error.statusCode = 403;

      return callback(error);
    },
  };
}

app.use(requestLogger);
app.use(cors(buildCorsOptions()));
app.use(express.json({ limit: "100kb" }));

const USERS_FILE = path.join(
  __dirname,
  "data",
  "users.json"
);

function readUsers() {
  const raw = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(raw).users;
}

function writeUsers(users) {
  fs.writeFileSync(
    USERS_FILE,
    JSON.stringify({ users }, null, 2),
    "utf-8"
  );
}

/* Service information */
app.get("/", (req, res) => {
  res.json({
    service: "lgs-tech-api",
    message: "LGS Tech API is running",
    endpoints: ["/health", "/cases", "/users"],
    requestId: req.id,
  });
});

/* Health check */
app.get("/health", (req, res) => {
  const mongoConnected =
    mongoose.connection.readyState === 1;

  res.status(mongoConnected ? 200 : 503).json({
    status: mongoConnected ? "ok" : "degraded",
    service: "lgs-tech-api",
    mongo: mongoConnected
      ? "connected"
      : "disconnected",
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
});

/* Cases — currently stored in MongoDB */
app.get("/cases", async (req, res) => {
  const cases = await Case.find();

  req.log.info(
    {
      caseCount: cases.length,
    },
    "Cases retrieved"
  );

  res.json(cases);
});

app.post("/cases", async (req, res) => {
  const created = await Case.create(req.body);

  req.log.info(
    {
      caseId: created.id,
    },
    "Case created"
  );

  res.status(201).json(created);
});

app.put("/cases/:id", async (req, res) => {
  const updated = await Case.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updated) {
    return res.status(404).json({
      error: "Case not found",
      requestId: req.id,
    });
  }

  req.log.info(
    {
      caseId: updated.id,
    },
    "Case updated"
  );

  return res.json(updated);
});

app.delete("/cases/:id", async (req, res) => {
  const deleted = await Case.findByIdAndDelete(
    req.params.id
  );

  if (!deleted) {
    return res.status(404).json({
      error: "Case not found",
      requestId: req.id,
    });
  }

  req.log.info(
    {
      caseId: deleted.id,
    },
    "Case deleted"
  );

  return res.sendStatus(204);
});

/*
 * Users — currently stored in a JSON file.
 * Render's filesystem is ephemeral, so this should later
 * be replaced with persistent PostgreSQL storage.
 */
app.get("/users", (req, res) => {
  const users = readUsers();

  req.log.info(
    {
      userCount: users.length,
    },
    "Users retrieved"
  );

  res.json(users);
});

app.post("/users", (req, res) => {
  const users = readUsers();

  const newRow = {
    id: Date.now(),
    ...req.body,
  };

  users.push(newRow);
  writeUsers(users);

  req.log.info(
    {
      userId: newRow.id,
    },
    "User created"
  );

  res.status(201).json(newRow);
});

app.put("/users/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      error: "Invalid user ID",
      requestId: req.id,
    });
  }

  const users = readUsers();
  const index = users.findIndex(
    (user) => user.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      error: "User not found",
      requestId: req.id,
    });
  }

  users[index] = {
    ...users[index],
    ...req.body,
    id,
  };

  writeUsers(users);

  req.log.info(
    {
      userId: id,
    },
    "User updated"
  );

  return res.json(users[index]);
});

app.delete("/users/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      error: "Invalid user ID",
      requestId: req.id,
    });
  }

  const users = readUsers();
  const userExists = users.some(
    (user) => user.id === id
  );

  if (!userExists) {
    return res.status(404).json({
      error: "User not found",
      requestId: req.id,
    });
  }

  const remainingUsers = users.filter(
    (user) => user.id !== id
  );

  writeUsers(remainingUsers);

  req.log.info(
    {
      userId: id,
    },
    "User deleted"
  );

  return res.sendStatus(204);
});

/*
 * These middlewares must remain after every route.
 */
app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI is missing. Set it in .env or the Render environment."
    );
  }

  await mongoose.connect(process.env.MONGO_URI);

  logger.info("MongoDB connected");

  app.listen(port, "0.0.0.0", () => {
    logger.info(
      {
        port,
        environment:
          process.env.NODE_ENV || "development",
      },
      "Server running"
    );
  });
}

startServer().catch((error) => {
  logger.fatal(
    {
      err: error,
    },
    "Server failed to start"
  );

  process.exit(1);
});
