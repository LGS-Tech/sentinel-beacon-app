const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * When REQUIRE_AUTH=true, Cases/Users need Authorization: Bearer <token>.
 * Default (unset/false) keeps local/demo flows working without login.
 */
function authenticate(req, res, next) {
  const requireAuth = process.env.REQUIRE_AUTH === "true";
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    if (!requireAuth) return next();
    return res.status(401).json({ error: "No access token provided" });
  }

  if (!JWT_SECRET) {
    return res.status(503).json({ error: "JWT_SECRET is not configured" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

function authorize(requiredRole) {
  return (req, res, next) => {
    if (req.user?.role !== requiredRole) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
