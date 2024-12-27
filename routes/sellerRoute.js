const express = require('express');

const protect = require('../middlewares/authSellerMiddleware');

const { registerSeller, verifyEmail, login, logout, forgotPassword, resetPassword, editProfile } = require('../controllers/sellerController');

const router = express.Router();

router.post('/register', registerSeller);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/edit-profile', protect, editProfile);

module.exports = router;