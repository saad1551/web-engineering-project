const express = require('express');
const { placeOrder, getSellerOrders } = require('../controllers/orderController');
const protectBuyer = require('../middlewares/authBuyerMiddleware');
const protectSeller = require('../middlewares/authSellerMiddleware');

const router = express.Router();

router.post('/place-order', protectBuyer, placeOrder);
router.get('/seller-orders', protectSeller, getSellerOrders);

module.exports = router;