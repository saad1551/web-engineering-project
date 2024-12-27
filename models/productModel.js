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
    sellerId: {
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
    },
    makeToOrder: {
        type: Boolean,
        default: false
    },
    preparationDays: {
        type: Number,
        default: null,
        validate: {
            validator: function(value) {
                return this.makeToOrder ? value !== null : true;
            },
            message: 'Preparation days should not be null if makeToOrder is true'
        }
    },
    quantity: {
        type: Number,
        validate: {
            validator: function(value) {
                return !this.makeToOrder ? value !== null : true;
            },
            message: 'Quantity should not be null if makeToOrder is false'
        }
    }
}, {
    timestamps: true
});

const ProductModel = mongoose.model('Product', ProductSchema);

module.exports = ProductModel;