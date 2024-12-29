const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Buyer',
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    amount: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Easypaisa', 'JazzCash'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    deliveryTime: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;