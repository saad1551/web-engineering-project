const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SellerSchema = new mongoose.Schema({
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
    district: {
        type: String,
        required: [true, 'Please add a district']
    },
    division: {
        type: String,
        required: [true, 'Please add a division']
    },
    province: {
        type: String,
        required: [true, 'Please add a province']
    },
    phoneNumber: {
        type: String,
        // make sure it is an eleven digit phone number
        match: [/^\d{11}$/]
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
}
)

// add middleware to hash the password before saving
SellerSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next(); // Skip hashing if the password is not modified
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const SellerModel = mongoose.model('Seller', SellerSchema);

module.exports = SellerModel;