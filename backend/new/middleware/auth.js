const jwt = require('jsonwebtoken');
const { getUserById } = require('../db/queries/users');
const { requireEmailOrganisation } = require('../db/queries/organisationDomains');
const { organizationIdFromUser } = require('../db/orgScope');

/**
 * MIDDLEWARE: Authentication
 * Verifies that the incoming request contains a valid JWT in the headers.
 * If valid, it attaches the user's data to `req.user` and passes control forward.
 */

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const match = typeof authHeader === 'string' && /^Bearer ([^\s]+)$/i.exec(authHeader);
  if (!match) return res.status(401).json({ error: 'No access token provided' });
  let decoded;
  try { decoded = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ['HS256'] }); }
  catch { return res.status(403).json({ error: 'Invalid or expired token' }); }

  try {
    const organizationId = organizationIdFromUser(decoded);
    if (!organizationId || !Number.isSafeInteger(Number(decoded.userId)) || Number(decoded.userId) <= 0) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    // Re-check membership on every request: old JWTs cannot retain a removed
    // user's access, stale privileges, or access to a disabled domain/org.
    const user = await getUserById(decoded.userId, organizationId);
    if (!user || !user.isActive) return res.status(403).json({ error: 'Invalid or expired token' });
    await requireEmailOrganisation(user.email, organizationId);
    req.user = {
      userId: user.id, organizationId, userType: user.userType,
      role: user.role, authorisation: user.authorisation,
    };
    return next();
  } catch (err) {
    if (err.statusCode === 403) return res.status(403).json({ error: 'Invalid or expired token' });
    return next(err); // A database error denies access, never falls back to JWT claims.
  }
}

/**
 * MIDDLEWARE GENERATOR: Authorization
 * Accepts a required role string and returns a middleware function
 */
function authorize(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req, res, next) => {
   if (!roles.includes(req.user?.userType)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
}


/**
 * Allows users to modify their own resource, while privileged roles
 * may modify resources belonging to other users.
 */
function authorizeSelfOrRoles(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    const authenticatedUserId = Number(req.user?.userId);
    const targetUserId = Number(req.params.id);

    if (
      Number.isInteger(authenticatedUserId) &&
      Number.isInteger(targetUserId) &&
      authenticatedUserId === targetUserId
    ) {
      return next();
    }

    if (roles.includes(req.user?.userType)) {
      return next();
    }

    return res.status(403).json({
      error: 'Forbidden: Insufficient permissions'
    });
  };
}

module.exports = { authenticate, authorize, authorizeSelfOrRoles };