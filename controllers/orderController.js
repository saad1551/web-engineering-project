const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Buyer = require('../models/buyerModel');
const Seller = require('../models/sellerModel');

// Function to place a new order
const placeOrder = asyncHandler(async (req, res) => {
    const { productId, quantity, address, paymentMethod, deliveryTime } = req.body;
    const buyerId = req.user._id;

    // Validate the data
    if (!productId || !quantity || !address || !paymentMethod ) {
        res.status(400);
        throw new Error('All fields are required');
    }

    // Find the product
    const product = await Product.findById(productId);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Find the seller
    const seller = await Seller.findById(product.sellerId);

    if (!seller) {
        res.status(404);
        throw new Error('Seller not found');
    }

    // Calculate the total amount
    const amount = product.price * quantity;

    // Create the order
    const order = await Order.create({
        buyerId,
        sellerId: seller._id,
        productId,
        quantity,
        amount,
        address,
        paymentMethod,
        deliveryTime: product.preparationDays ? product.preparationDays + 10 : 10
    });

    if (!order) {
        res.status(500);
        throw new Error('Order could not be created');
    }

    // // Schedule status updates
    // scheduleStatusUpdates(order);

    res.status(201).json({
        order,
        message: 'Order placed successfully'
    });
});

// // Function to schedule status updates
// const scheduleStatusUpdates = (order) => {
//     // Change status to 'Processing' after 1 hour
//     setTimeout(async () => {
//         order.status = 'Processing';
//         await order.save();
//     }, 1 * 60 * 60 * 1000);

//     // Change status to 'Shipped' after 24 hours
//     setTimeout(async () => {
//         order.status = 'Shipped';
//         await order.save();
//     }, 24 * 60 * 60 * 1000);

//     // Change status to 'Delivered' after deliveryTime
//     setTimeout(async () => {
//         order.status = 'Delivered';
//         await order.save();
//     }, (24 + order.deliveryTime) * 60 * 60 * 1000);
// };

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
    const orders = await Order.find({ sellerId }).populate('buyerId').populate('productId');

    res.status(200).json(orders);
});

module.exports = { placeOrder, getSellerOrders };