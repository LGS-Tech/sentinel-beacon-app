const crypto = require("crypto");
const pinoHttp = require("pino-http");
const logger = require("../utils/logger");

module.exports = pinoHttp({
  logger,

  genReqId(req, res) {
    const incoming = req.headers["x-request-id"];

    const requestId =
      typeof incoming === "string" && incoming.trim()
        ? incoming.trim()
        : crypto.randomUUID();

    res.setHeader("x-request-id", requestId);

    return requestId;
  },

  customLogLevel(req, res, err) {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
});
