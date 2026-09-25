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

const signup = async (req, res, next) => {
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

      const token = jwt.sign(
    { userId: newUser.id, userType: newUser.userType, authorisation: newUser.authorisation },
    secret,
    { expiresIn: '1d' }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: userToPublicApi(newUser),
    });
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
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
    if (!stored.startsWith("$2")) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, stored);
    if (!valid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    await recordLogin(user.id);

    const token = jwt.sign(
      {
        userId: user.id,
        userType: user.userType,
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
    return next(err);
  }
};

module.exports = { signup, login };
