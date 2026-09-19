const pino = require("pino");

const logger = pino({
  level: process.env.LOG_LEVEL || "info",

  redact: {
    paths: [
      "password",
      "*.password",
      "token",
      "*.token",
      "authorization",
      "*.authorization",
      "req.headers.authorization",
      "req.headers.cookie",
      "JWT_SECRET",
      "DATABASE_URL",
      "POSTGRES_PASSWORD",
    ],
    censor: "[REDACTED]",
  },
});

module.exports = logger;
