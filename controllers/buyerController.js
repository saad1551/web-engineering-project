const asyncHandler = require('express-async-handler');
const Buyer = require('../models/buyerModel');
const EmailVerificationToken = require('../models/verificationTokenModel');
const jwt = require('jsonwebtoken');
const sendEMail = require('../utils/sendEmail');

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


module.exports = { register, verifyEmail };