const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  getUserByEmail,
  recordLogin,
} = require("../db/queries/users");
const { userToPublicApi } = require("../db/mappers");
const { requireEmailOrganisation } = require("../db/queries/organisationDomains");

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is missing. Set it in .env");
  }
  return secret;
}

// Account creation is an authenticated administrator/operator action only.
const signup = (_req, res) => res.status(403).json({
  error: "Self-registration is disabled. Contact your administrator.",
});

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const stored = user.password ?? "";
    if (!stored.startsWith("$2")) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, stored);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isActive) return res.status(401).json({ error: "Invalid credentials" });
    await requireEmailOrganisation(user.email, user.organizationId);
    await recordLogin(user.id);

    if (!user.organizationId) {
      return res.status(403).json({
        error: "Organisation access is required",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        userType: user.userType,
        role: user.role,
        authorisation: user.authorisation,
        organizationId: user.organizationId,
      },
      getJwtSecret(),
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: userToPublicApi(user),
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { signup, login };
