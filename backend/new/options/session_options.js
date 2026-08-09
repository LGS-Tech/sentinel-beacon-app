const express = require('express');
const pool = require ('../db/pool');
const {authenticate} = require ('../middleware/auth');

const router = express.Router();


router.post('/logout', authenticate, async (req, res) => {
    res.status(200).json ({message: 'logged out successfully'});
});

module.exports = router;