const express = require('express');

const { registerSeller, verifyEmail, login, logout } = require('../controllers/sellerController');

const router = express.Router();

router.post('/register', registerSeller);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;