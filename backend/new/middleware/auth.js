const jwt = require('jsonwebtoken'); // Import the jsonwebtoken library to verify cryptographic tokens

/**
 * MIDDLEWARE: Authentication
 * Verifies that the incoming request contains a valid JWT in the headers.
 * If valid, it attaches the user's data to `req.user` and passes control forward.
 */

function authenticate(req, res, next) {
    // Grabs the Authorization header from the incoming request
  const authHeader = req.headers['authorization'];

  // If authHeader exists, split Bearer <TOKEN> at the space and take the second part
  const token = authHeader && authHeader.split(' ')[1];
 // If no token, reject immediately
  if (!token) {
    return res.status(401).json({ error: 'No access token provided' });
}

  try {
    // Decrypt and verify the token signature with the server's secret key
    // If the token was tampered with or is expired, this line throws an error and jumps to catch
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //JWT TO BE ADDED

// Attached the decoded payload directly to the req so subsequent middleware or route handlers can access who is making the request
    req.user = decoded; // { userId, role } or whatever fits
    next();
  } catch (err) {
    //If jwt.verify fails send them back
    return res.status(403).json({ error: 'Invalid or expired token' });
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