const express = require('express');

const protect = require('../middlewares/authBuyerMiddleware');

const { register, verifyEmail, login, logout, forgotPassword, resetPassword, editProfile } = require('../controllers/buyerController');

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post("/edit-profile", protect, editProfile);

module.exports = router;