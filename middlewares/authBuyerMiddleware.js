const asyncHandler = require('express-async-handler');
const Buyer = require('../models/buyerModel');
const jwt = require('jsonwebtoken');

const authProtectBuyer = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            res.status(401)
            throw new Error("Not authorized, please login");
        }

        // Verify token
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // Get user id from token
        const buyer = await Buyer.findById(verified.id).select("-password");

        if (!buyer) {
            res.status(401)
            throw new Error("User not found");
        }

        req.user = buyer;
        next();
    } catch (error) {
        res.status(401);
        throw new Error("User not authorized, please login");
    }
});

module.exports = authProtectBuyer;