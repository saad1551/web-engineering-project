const moongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BuyerSchema = new moongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    // Date of Birth
    dateOfBirth: { 
        type: Date, 
        required: true,
        validate: {
            validator: function(value) {
            // Ensure the date is in the past
            return value < new Date();
            },
            message: 'Date of birth must be in the past.',
        },
    },
    phoneNumber: {
        type: String,
        // make sure it is an eleven digit phone number
        match: [/^\d{11}$/]
    }
})

// add middleware to hash the password before saving
BuyerSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

const BuyerModel = moongoose.model('Buyer', BuyerSchema);

module.exports = BuyerModel;