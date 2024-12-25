const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    SKU: {
        type: String,
        required: [true, 'Please add a SKU']
    },
    // image URL
    image: {
        type: String,
        // make sure it is a URL
        match: [/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?$/],
        required: [true, 'Please add an image'],
    }
}, {
    timestamps: true
});

const ProductModel = mongoose.model('Product', ProductSchema);

module.exports = ProductModel;