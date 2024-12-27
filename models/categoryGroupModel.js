const mognoose = require('mongoose');

const categoryGroupSchema = mognoose.Schema({
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
    categories: [{
        type: mognoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }]
}, {
    timestamps: true
});

const CategoryGroup = mognoose.model('CategoryGroup', categoryGroupSchema);

module.exports = CategoryGroup;