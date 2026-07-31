const express = require('express'); // For routing and handling HTTP
const bcrypt = require('bcrypt');// For password hashing and comparison
const jwt = require('jsonwebtoken');// For creating and verifying JWTs
const pool = require('../db/pool');// Importing the database connection pool to interact with PostgreSQL
const { authenticate } = require('../middleware/auth');// auth middleware import

const router = express.Router();// Create a new router instance to define auth-related routes

/**
 * ROUTE: POST /signup (Mounted as /auth/signup)
 * Purpose: Registers a new user by hashing their password and storing their record in PostgreSQL.
 */
router.post('/signup', async (req, res) => {

    //Extract email, password, and optional role from the request body
    const { username, password, email, name, phone, role, authorisation } = req.body;

    //basic validation
    if (!username || !password || !email || !name) {
    return res.status(400).json({ error: 'Username, password, email, and name are required.' });
    }
  try {
    //hash the plaintext password with bcrypt using 10 salt rounds for security
    const hash = await bcrypt.hash(password, 10);//not sure if we plan to do hashing but just going to keep this here for the time being

    
    const queryText = `
      INSERT INTO users (username, password, email, name, phone, role, authorisation)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, username, email, name, phone, role, authorisation
    `;

    const values = [
      username,
      hash,                           
      email,
      name,
      phone,              
      role ,                
      authorisation   
    ];

    //Execute an SQL INSERT query to add the new user to the users table, returning the new user's data for confirmation
    const result = await pool.query(queryText, values);

    // return success and some data for confirmation
    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0]
    });
  } catch (err) {
    // catch failures
    res.status(500).json({ error: 'Signup failed' });
  }
});

/**
 * ROUTE: POST /login (Mounted as /auth/login)
 * Purpose: Validates user credentials and issues a signed JWT for access to protected routes.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;// extract password and email

  if (!loginInput || !password) {
    return res.status(400).json({ error: 'Username/email and password are required.' });
  }
  try {
    // Search the PostgreSQL for a matching user account by email
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];

    // Check if the user exists AND if the submitted password matches the stored hash.
    // Uses bcrypt.compare to securely check the hash.
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    // Create a JWT signed with the server's secret key
    // Note to self:
    // - Payload = Non-sensitive data to identify the user on subsequent requests ({ userId, role })
    // - Secret = process.env.JWT_SECRET ensures the token cannot be tampered with on the client side
    // - Options = Expiration set to 1 day ('1d')
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    // Send the signed JWT token back to the client
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;