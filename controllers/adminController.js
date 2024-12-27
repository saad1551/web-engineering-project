const asyncHandler = require('express-async-handler');
const Admin = require('../models/adminModel');
const EmailVerificationToken = require('../models/verificationTokenModel');
const jwt = require('jsonwebtoken');
const sendEMail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const PasswordResetToken = require('../models/passwordResetTokenModel');

// endpoint to register the admin
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // validate the data
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('All fields are required');
    }

    // check if the admin already exists
    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
        res.status(400);
        throw new Error('Account already exists');
    }

    // create the admin
    const admin = await Admin.create({
        name,
        email,
        password
    });

    // return with error if admin is not created
    if (!admin) {
        res.status(500);
        throw new Error('Could not register');
    }

    // make email verification token using the user id
    const verificationToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await EmailVerificationToken.create({
        userId: admin._id,
        token: verificationToken
    });

    // send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const emailTemplate = `
        <h1>Welcome, ${name}!</h1>
        <p>Thank you for registering on our platform. Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Verify Email</a>
        <p>If you did not register for this account, please ignore this email.</p>
        <p>Best regards,<br>Dastkaar Team</p>
    `;

    await sendEMail({
        send_to: email,
        subject: 'Email Verification',
        content: emailTemplate
    });

    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.status(201).json({
        admin: adminResponse,
        message: 'Registered successfully. Please check your email to verify your account'
    });
});

const verifyEmail = asyncHandler(async (req, res) => {
    const token = req.query.token;

    if (!token) {
        res.status(400);
        throw new Error('Token is required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
        res.status(400);
        throw new Error('Invalid token');
    }

    const verificationToken = await EmailVerificationToken.findOne({ userId: decoded.id, token });

    if (!verificationToken) {
        res.status(400);
        throw new Error('Invalid token');
    }

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
        res.status(404);
        throw new Error('User not found');
    }

    admin.isVerified = true;
    await admin.save();

    await EmailVerificationToken.findByIdAndDelete(verificationToken._id);

    res.status(200).json({
        message: 'Email verified successfully'
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Email and password are required');
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
        res.status(404);
        throw new Error('Invalid email or password');
    }

    const isCorrectPassword = await bcrypt.compare(password, admin.password);

    if (!isCorrectPassword) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // set the cookie
    res.cookie('token', token, {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        admin: {
            _id: admin._id,
            name: admin.name,
            email: admin.email
        },
        token,
        message: 'Logged in successfully'
    });
});

const logout = asyncHandler(async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({
        message: 'Logged out successfully'
    });
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
        res.status(404);
        throw new Error('Account not found');
    }

    const resetToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await PasswordResetToken.create({
        userId: admin._id,
        token: resetToken
    });

    // send reset password email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const emailTemplate = `
        <h1>Reset Password</h1>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,<br>Dastkaar Team</p>
    `;

    await sendEMail({
        send_to: email,
        subject: 'Reset Password',
        content: emailTemplate
    });

    res.status(200).json({
        message: 'Password reset email sent'
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const token = req.query.token;

    if (!password) {
        res.status(400);
        throw new Error('Password is required');
    }

    if (!token) {
        res.status(400);
        throw new Error('Token is required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
        res.status(400);
        throw new Error('Invalid token');
    }

    const resetToken = await PasswordResetToken.findOne({ userId: decoded.id, token });

    if (!resetToken) {
        res.status(400);
        throw new Error('Invalid token');
    }

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
        res.status(404);
        throw new Error('Account not found');
    }

    admin.password = password;

    await admin.save();

    await PasswordResetToken.findByIdAndDelete(resetToken._id);

    res.status(200).json({
        message: 'Password reset successfully'
    });
});

const editProfile = asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    // check that all values are provided
    if (!name || !email) {
        res.status(400);
        throw new Error('All fields are required');
    }

    // get the admin id from the token
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);

    // find the admin
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
        res.status(404);
        throw new Error('Admin not found');
    }

    // update the admin
    admin.name = name;
    admin.email = email;

    await admin.save();

    res.status(200).json({
        admin,
        message: 'Profile updated successfully'
    });
});

module.exports = { register, verifyEmail, login, logout, forgotPassword, resetPassword, editProfile };