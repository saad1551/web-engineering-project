const asyncHandler = require("express-async-handler");
const sendEMail = require("../utils/sendEmail");
const EmailVerificationToken = require('../models/verificationTokenModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const PasswordResetToken = require('../models/passwordResetTokenModel');

const Seller = require('../models/sellerModel');


// endpoint to register the seller
const registerSeller = asyncHandler(async (req, res) => {
    const { name, email, password, DOB, district, division, province, phoneNumber } = req.body;

    console.log(req.body);

    // validate the data
    if (!name || !email || !password || !DOB || !district || !division || !province || !phoneNumber) {
        res.status(400);
        throw new Error('All fields are required');
    }

    const dateOfBirth = new Date(DOB);

    // check if the seller already exists
    const sellerExists = await Seller.findOne({ email });

    if (sellerExists) {
        res.status(400);
        throw new Error('Seller already exists');
    }

    // create the seller
    const seller = await Seller.create({
        name,
        email,
        password,
        dateOfBirth,
        district,
        division,
        province,
        phoneNumber
    });

    // return with error if seller is not created
    if (!seller) {
        res.status(500);
        throw new Error('Seller could not be created');
    }
    

    // make email verification token using the user id
    const verificationToken = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await EmailVerificationToken.create({
        userId: seller._id,
        token: verificationToken
    });

    // send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-seller-email?token=${verificationToken}`;

    const emailTemplate = `
        <h1>Welcome, ${name}!</h1>
        <p>Thank you for registering as a seller on our platform. Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Verify Email</a>
        <p>If you did not register for this account, please ignore this email.</p>
        <p>Best regards,<br>Dastkaar Team</p>
    `;

    await sendEMail({
        send_to: email,
        subject: 'Email Verification',
        content: emailTemplate
    });

    res.status(201).json({
        seller: seller,
        message: 'Seller registered successfully. Please check your email to verify your account.'
    });
});

const verifyEmail = asyncHandler(async (req, res) => {
    const token = req.query.token;

    if (!token) {
        res.status(400);
        throw new Error('Invalid token');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const verificationToken = await EmailVerificationToken.findOne({ userId: decoded.id, token });

    if (!verificationToken) {
        res.status(400);
        throw new Error('Invalid token');
    }

    const seller = await Seller.findById(decoded.id);

    if (!seller) {
        res.status(404);
        throw new Error('Seller not found');
    }

    seller.isVerified = true;

    await seller.save();

    await EmailVerificationToken.findByIdAndDelete(verificationToken._id);

    res.status(200).json({
        message: 'Email verified successfully'
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // validate the data
    if (!email || !password) {
        res.status(400);
        throw new Error('All fields are required');
    }

    // check if the seller exists
    const seller = await Seller.findOne({ email });

    if (!seller) {
        res.status(404);
        throw new Error('Seller account not found');
    }

    const isCorrectPassword = await bcrypt.compare(password, seller.password);

    if (!isCorrectPassword) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    // check if the seller is verified
    if (!seller.isVerified) {
        res.status(401);
        throw new Error('Email not verified');
    }

    // generate token
    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // set the cookie
    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    res.status(200).json({
        seller: {
            id: seller._id,
            name: seller.name,
            email: seller.email,
            isVerified: seller.isVerified
        },
        token
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

    const seller = await Seller.findOne({ email });

    if (!seller) {
        res.status(404);
        throw new Error('Seller not found');
    }

    const resetToken = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await PasswordResetToken.create({
        userId: seller._id,
        token: resetToken
    });

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
        subject: 'Password Reset',
        content: emailTemplate
    });

    res.status(200).json({
        message: 'Password reset email sent'
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const token = req.query.token;
    const { password } = req.body;

    if (!token) {
        res.status(400);
        throw new Error('Invalid token');
    }

    if (!password) {
        res.status(400);
        throw new Error('Password is required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const resetToken = await PasswordResetToken.findOne({ userId: decoded.id, token });

    if (!resetToken) {
        res.status(400);
        throw new Error('Invalid token');
    }

    const seller = await Seller.findById(decoded.id);

    if (!seller) {
        res.status(404);
        throw new Error('Seller not found');
    }

    seller.password = password;

    await seller.save();

    await PasswordResetToken.findByIdAndDelete(resetToken._id);

    res.status(200).json({
        message: 'Password reset successfully'
    });
});

const editProfile = asyncHandler(async (req, res) => {
    const { name, email, DOB, district, division, province, phoneNumber } = req.body;

    // check that all values are provided
    if (!name || !email || !DOB || !district || !division || !province || !phoneNumber) {
        res.status(400);
        throw new Error('All fields are required');
    }

    // find seller
    const seller = await Seller.findOne({ email });

    if (!seller) {
        res.status(404);
        throw new Error('Seller not found');
    }

    seller.name = name || seller.name;
    seller.email = email || seller.email;
    seller.dateOfBirth = DOB ? new Date(DOB) : seller.dateOfBirth;
    seller.district = district || seller.district;
    seller.division = division || seller.division;
    seller.province = province || seller.province;
    seller.phoneNumber = phoneNumber || seller.phoneNumber;

    await seller.save();

    res.status(200).json({
        seller
    });
});

module.exports = {
    registerSeller,
    verifyEmail,
    login,
    logout,
    forgotPassword,
    resetPassword,
    editProfile
}