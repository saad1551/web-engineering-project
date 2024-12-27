const { addProduct, getAllProducts, createCategories, getCategories, getProductById } = require('../controllers/productController');
const { upload } = require('../utils/fileUpload');
const protectAuthSeller = require('../middlewares/authSellerMiddleware');
const protectAuthAdmin = require('../middlewares/authAdminMiddleware');

const express = require('express');

const router = express.Router();

router.get('/', getAllProducts);
router.post('/add-product', protectAuthSeller, upload.single("image"), addProduct);
router.get('/create-categories', protectAuthAdmin, createCategories);
router.get('/get-categories', getCategories);
router.get('/:id', getProductById);


module.exports = router;