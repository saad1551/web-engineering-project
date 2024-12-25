const express = require('express');

const { registerSeller, verifyEmail } = require('../controllers/sellerController');

const router = express.Router();

router.post('/register', registerSeller);
router.post('/verify-email', verifyEmail);

module.exports = router;