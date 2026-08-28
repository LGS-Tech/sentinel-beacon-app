const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { getUserByEmail, createUser, recordLogin } = require('../db/queries/users');

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is missing. Set it in .env");
}

// POST /api/auth/signup
const signup = async (req, res) => {
  const { username, password, email, name, phone, role, authorisation } = req.body;

  if (!username || !password || !email || !name) {
    return res.status(400).json({ error: 'Username, password, email, and name are required.' });
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
      authorisation
    });

     if (newUser && newUser.password) {
      delete newUser.password;
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser
    });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ error: err.message || 'Signup failed' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await getUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    await recordLogin(user.id);

    const token = jwt.sign(
      { userId: user.id, role: user.role, authorisation: user.authorisation },
      secret,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

module.exports = { signup, login };
