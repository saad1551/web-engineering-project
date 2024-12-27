const asyncHandler = require('express-async-handler');
const Seller = require('../models/sellerModel');
const jwt = require('jsonwebtoken');

const authProtectSeller = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            res.status(401)
            throw new Error("Not authorized, please login");
        }

        console.log("token present");

        // Verify token
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        console.log(process.env.JWT_SECRET);

        // Get user id from token
        const seller = await Seller.findById(verified.id).select("-password");

        console.log(verified.id);

        console.log(seller.name);

        if (!seller) {
            res.status(401)
            console.log("here");
            throw new Error("User not found");
        }

        req.user = seller;
        next();
    } catch (error) {
        res.status(401);
        throw new Error("User not authorized, please login");
    }
});

module.exports = authProtectSeller;