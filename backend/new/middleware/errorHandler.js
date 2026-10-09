function notFoundHandler(req, res) {
  res.status(404).json({
    error: "Route not found",
    requestId: req.id,
  });
}

function errorHandler(err, req, res, next) {
  if (req.log) {
    const details =
      process.env.NODE_ENV === "production"
        ? {
            errorName: err?.name,
            errorCode: err?.code,
            requestId: req.id,
          }
        : {
            err,
            requestId: req.id,
          };

    req.log.error(details, "Unhandled request error");
  }

  if (res.headersSent) {
    return next(err);
  }

  const statusCode =
    Number.isInteger(err.statusCode) &&
    err.statusCode >= 400 &&
    err.statusCode <= 599
      ? err.statusCode
      : 500;

  res.status(statusCode).json({
    error:
      statusCode === 500
        ? "Internal server error"
        : err.message || "Request failed",
    requestId: req.id,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
