const asyncHandler = require('express-async-handler');
const Buyer = require('../models/buyerModel');
const EmailVerificationToken = require('../models/verificationTokenModel');
const jwt = require('jsonwebtoken');
const sendEMail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const PasswordResetToken = require('../models/passwordResetTokenModel');

// endpoint to register the buyer
const register = asyncHandler(async (req, res) => {
    const { name, email, password, DOB, phoneNumber } = req.body;

    // validate the data
    if (!name || !email || !password || !DOB || !phoneNumber) {
        res.status(400);
        throw new Error('All fields are required');
    }

    // check if the buyer already exists
    const buyerExists = await Buyer.findOne({ email });

    if (buyerExists) {
        res.status(400);
        throw new Error('Account already exists');
    }

    const dateOfBirth = new Date(DOB);

    // create the buyer
    const buyer = await Buyer.create({
        name,
        email,
        password,
        dateOfBirth,
        phoneNumber
    });

    // return with error if buyer is not created
    if (!buyer) {
        res.status(500);
        throw new Error('Could not register');
    }

    // make email verification token using the user id
    const verificationToken = jwt.sign({ id: buyer._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await EmailVerificationToken.create({
        userId: buyer._id,
        token: verificationToken
    });

    // send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const emailTemplate = `
        <h1>Welcome, ${name}!</h1>
        <p>Thank you for registering our platform. Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Verify Email</a>
        <p>If you did not register for this account, please ignore this email.</p>
        <p>Best regards,<br>Dastkaar Team</p>
    `;

    await sendEMail({
        send_to: email,
        subject: 'Email Verification',
        content: emailTemplate
    });

    const buyerResponse = buyer.toObject();
    delete buyerResponse.password;

    res.status(201).json({
        buyer: buyerResponse,
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

    const buyer = await Buyer.findById(decoded.id);

    if (!buyer) {
        res.status(404);
        throw new Error('User not found');
    }

    buyer.isVerified = true;
    await buyer.save();

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

    const buyer = await Buyer.findOne({ email });

    if (!buyer) {
        res.status(404);
        throw new Error('Invalid email or password');
    }

    if (!buyer.isVerified) {
        res.status(401);
        throw new Error('Email is not verified');
    }

    const isCorrectPassword = await bcrypt.compare(password, buyer.password);

    if (!isCorrectPassword) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ id: buyer._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // set the cookie
    res.cookie('token', token, {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        buyer: {
            _id: buyer._id,
            name: buyer.name,
            email: buyer.email,
            phoneNumber: buyer.phoneNumber,
            isVerified: buyer.isVerified
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

    const buyer = await Buyer.findOne({ email });

    if (!buyer) {
        res.status(404);
        throw new Error('Account not found');
    }

    const resetToken = jwt.sign({ id: buyer._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await PasswordResetToken.create({
        userId: buyer._id,
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

    if (!password ) {
        res.status(400);
        throw new Error('Password and confirm password are required');
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

    const buyer = await Buyer.findById(decoded.id);

    if (!buyer) {
        res.status(404);
        throw new Error('Account not found');
    }

    buyer.password = password;

    await buyer.save();

    await PasswordResetToken.findByIdAndDelete(resetToken._id);

    res.status(200).json({
        message: 'Password reset successfully'
    });
});


module.exports = { register, verifyEmail, login, logout, forgotPassword, resetPassword };