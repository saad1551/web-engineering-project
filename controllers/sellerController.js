const asyncHandler = require("express-async-handler");
const sendEMail = require("../utils/sendEmail");
const EmailVerificationToken = require('../models/verificationTokenModel');
const jwt = require('jsonwebtoken');

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

module.exports = {
    registerSeller
}