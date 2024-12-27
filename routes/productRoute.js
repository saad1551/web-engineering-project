const { 
    addProduct, 
    getAllProducts, 
    createCategories, 
    getCategories, 
    getProductById, 
    getSellerProducts,
    getProductsByCategory
} = require('../controllers/productController');
const { upload } = require('../utils/fileUpload');
const protectAuthSeller = require('../middlewares/authSellerMiddleware');
const protectAuthAdmin = require('../middlewares/authAdminMiddleware');

const express = require('express');

const router = express.Router();

router.get('/', getAllProducts);
router.post('/add-product', protectAuthSeller, upload.single("image"), addProduct);
router.get('/create-categories', protectAuthAdmin, createCategories);
router.get('/get-categories', getCategories);
router.get('/seller', protectAuthSeller, getSellerProducts);
router.get('/:id', getProductById);
router.get('/category/:categoryId', getProductsByCategory);



module.exports = router;