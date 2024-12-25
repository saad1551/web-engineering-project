const express = require('express');

const { registerSeller, verifyEmail, login, logout, forgotPassword, resetPassword, editProfile } = require('../controllers/sellerController');

const router = express.Router();

router.post('/register', registerSeller);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/edit-profile', editProfile);

module.exports = router;