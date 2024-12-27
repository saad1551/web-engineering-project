const { addProduct, getAllProducts, createCategories, getCategories } = require('../controllers/productController');
const { upload } = require('../utils/fileUpload');
const protectAuthSeller = require('../middlewares/authSellerMiddleware');

const express = require('express');

const router = express.Router();

router.get('/', getAllProducts);
router.post('/add-product', protectAuthSeller, upload.single("image"), addProduct);
router.get('/create-categories', createCategories);
router.get('/get-categories', getCategories);


module.exports = router;