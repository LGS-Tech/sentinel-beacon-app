const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * router.param handler: rejects ids that are not UUIDs before they reach
 * PostgreSQL (which would otherwise fail the query and surface as a 500).
 */
function validateUuidParam(req, res, next, value) {
  if (!UUID_PATTERN.test(value)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  next();
}

module.exports = { validateUuidParam };
