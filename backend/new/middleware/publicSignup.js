/**
 * Gate for POST /auth/signup. Self-registration is off unless
 * ALLOW_PUBLIC_SIGNUP is exactly "true"; accounts are otherwise created by a
 * lead/maintainer (POST /users) or with `npm run user:create`.
 */
function isPublicSignupEnabled() {
  return process.env.ALLOW_PUBLIC_SIGNUP === "true";
}

function requirePublicSignupEnabled(req, res, next) {
  if (!isPublicSignupEnabled()) {
    return res.status(403).json({
      error: "Self-registration is disabled. Contact your administrator.",
    });
  }
  next();
}

module.exports = { isPublicSignupEnabled, requirePublicSignupEnabled };
