const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Buyer = require('../models/buyerModel');
const Seller = require('../models/sellerModel');

// Function to place a new order
const placeOrder = asyncHandler(async (req, res) => {
    const { products, address } = req.body;
    const buyerId = req.user._id;

    // Validate the data
    if (!products || !Array.isArray(products) || products.length === 0) {
        res.status(400);
        throw new Error('Products are required');
    }

    if (!address) {
        res.status(400);
        throw new Error('Address is required');
    }

    // Find the buyer
    const buyer = await Buyer.findById(buyerId);

    if (!buyer) {
        res.status(404);
        throw new Error('Buyer not found');
    }

    let totalPrice = 0;
    const orderProducts = [];

    for (const item of products) {
        const { productId, quantity } = item;

        // Validate product data
        if (!productId || !quantity) {
            res.status(400);
            throw new Error('Product ID and quantity are required for each product');
        }

        // Find the product
        const product = await Product.findById(productId);

        if (!product) {
            res.status(404);
            throw new Error(`Product not found: ${productId}`);
        }

        // Find the seller
        const seller = await Seller.findById(product.sellerId);

        if (!seller) {
            res.status(404);
            throw new Error(`Seller not found for product: ${productId}`);
        }

        // Calculate the total price for this product
        const productTotalPrice = product.price * quantity;
        totalPrice += productTotalPrice;

        // Add product details to order
        orderProducts.push({
            productId: product._id,
            price: product.price,
            quantity,
            deliveryTime: product.preparationDays ? product.preparationDays + 10 : 10
        });
    }

    // Create the order
    const order = await Order.create({
        buyerId,
        sellerId: orderProducts[0].sellerId, // Assuming all products are from the same seller
        products: orderProducts,
        totalPrice,
        address
    });

    if (!order) {
        res.status(500);
        throw new Error('Order could not be created');
    }

    res.status(201).json({
        order,
        message: 'Order placed successfully'
    });
});

// Function to retrieve all orders of a particular seller
const getSellerOrders = asyncHandler(async (req, res) => {
    const sellerId = req.user._id;

    // Find the seller
    const seller = await Seller.findById(sellerId);

    if (!seller) {
        res.status(404);
        throw new Error('Seller not found');
    }

    // Find all orders for the seller
    const orders = await Order.find({ sellerId }).populate('buyerId').populate('products.productId');

    res.status(200).json(orders);
});

module.exports = { placeOrder, getSellerOrders };