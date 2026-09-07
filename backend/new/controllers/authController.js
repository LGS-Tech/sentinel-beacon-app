const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  getUserByEmail,
  createUser,
  recordLogin,
} = require("../db/queries/users");
const { userToPublicApi } = require("../db/mappers");

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is missing. Set it in .env");
  }
  return secret;
}

const signup = async (req, res) => {
  const {
    username,
    password,
    email,
    name,
    phone,
    role,
    authorisation,
    collegeId,
    yearSemester,
  } = req.body;

  if (!username || !password || !email || !name) {
    return res.status(400).json({
      error: "Username, password, email, and name are required.",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser({
      username,
      password: hashedPassword,
      email,
      name,
      phone,
      role,
      authorisation,
      collegeId,
      yearSemester,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: userToPublicApi(newUser),
    });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ error: err.message || "Signup failed" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const stored = user.password ?? "";
    const valid = stored.startsWith("$2")
      ? await bcrypt.compare(password, stored)
      : stored === password;

    if (!valid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    await recordLogin(user.id);

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        authorisation: user.authorisation,
      },
      getJwtSecret(),
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: userToPublicApi(user),
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: err.message || "Login failed" });
  }
};

module.exports = { signup, login };
