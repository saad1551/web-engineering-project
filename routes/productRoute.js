const { addProduct, getAllProducts } = require('../controllers/productController');
const { upload } = require('../utils/fileUpload');
const protectAuthSeller = require('../middlewares/authSellerMiddleware');

const express = require('express');

const router = express.Router();

router.get('/', getAllProducts);
router.post('/add-product', protectAuthSeller, upload.single("image"), addProduct);


module.exports = router;