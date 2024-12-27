const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    // name in Urdu
    nameUrdu: {
        type: String,
        required: [true, 'Please add a name in Urdu']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    // description in urdu
    descriptionUrdu: {
        type: String,
        required: [true, 'Please add a description in Urdu']
    },
    // category group
    categoryGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategoryGroup',
    }
}, {
    timestamps: true
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;