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
function authorize(requiredRole) {
    // Returns the middleware function
  return (req, res, next) => {
    // req.user?.role uses optional chaining in case req.user is somehow undefined
    if (req.user?.role !== requiredRole) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    // User has the correct role so proceed to the option handler
    next();
  };
}

module.exports = { authenticate, authorize };