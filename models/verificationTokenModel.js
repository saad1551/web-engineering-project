const mongoose = require('mongoose');

const emailVerificationTokenSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true
    }
}, { timestamps: true });

const EmailVerificationTokenModel = mongoose.model('emailVerificationToken', emailVerificationTokenSchema);

module.exports = EmailVerificationTokenModel;