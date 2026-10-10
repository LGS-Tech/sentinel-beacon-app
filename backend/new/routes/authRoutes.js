const express = require('express');
const router = express.Router();

const { signup, login } = require('../controllers/authController');
const { requirePublicSignupEnabled } = require('../middleware/publicSignup');


router.post('/signup', requirePublicSignupEnabled, signup);
router.post('/login', login);

module.exports = router;
