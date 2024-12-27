const mognoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = mognoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        match: [
            /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
            'Please add a valid email'
        ],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6
    }
}, {
    timestamps: true
});

// hash password before saving
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(parseInt(process.env.HASHING_SALT_ROUNDS));
    this.password = await bcrypt.hash(this.password, salt);
});

const Admin = mognoose.model('Admin', adminSchema);

module.exports = Admin;