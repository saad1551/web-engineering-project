const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');

const addProduct = asyncHandler(async (req, res) => {
    res.send("add product");
});

module.exports = { addProduct };