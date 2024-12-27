const { addProduct } = require('../controllers/productController');

const express = require('express');

const router = express.Router();

router.post('/add', addProduct);

module.exports = router;