const crypto = require("crypto");
const pinoHttpModule = require("pino-http");

const logger = require("../utils/logger");

const pinoHttp =
  pinoHttpModule.pinoHttp ||
  pinoHttpModule.default ||
  pinoHttpModule;

if (typeof pinoHttp !== "function") {
  throw new TypeError("pino-http did not export a middleware factory");
}

const requestLogger = pinoHttp({
  logger,

  genReqId(req, res) {
    const existingRequestId = req.headers["x-request-id"];

    const requestId =
      typeof existingRequestId === "string" &&
      existingRequestId.trim()
        ? existingRequestId.trim()
        : crypto.randomUUID();

    res.setHeader("x-request-id", requestId);

    return requestId;
  },

  customLogLevel(req, res, error) {
    if (error || res.statusCode >= 500) {
      return "error";
    }

    if (res.statusCode >= 400) {
      return "warn";
    }

    return "info";
  },
});

module.exports = requestLogger;
