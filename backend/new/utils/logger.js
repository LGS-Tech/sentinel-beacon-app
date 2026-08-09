const pinoModule = require("pino");

const pino =
  pinoModule.pino ||
  pinoModule.default ||
  pinoModule;

if (typeof pino !== "function") {
  throw new TypeError("Pino did not export a logger factory");
}

const isProduction = process.env.NODE_ENV === "production";

const options = {
  level: process.env.LOG_LEVEL || "info",

  redact: {
    paths: [
      "password",
      "*.password",
      "req.headers.authorization",
      "req.headers.cookie",
      "MONGO_URI",
      "DATABASE_URL",
      "POSTGRES_PASSWORD",
    ],
    censor: "[REDACTED]",
  },
};

if (!isProduction) {
  options.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  };
}

const logger = pino(options);

module.exports = logger;
