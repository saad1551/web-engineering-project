const express = require('express');

const { register, verifyEmail, login, logout, forgotPassword, resetPassword, editProfile } = require('../controllers/buyerController');

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post("/edit-profile", editProfile);

module.exports = router;