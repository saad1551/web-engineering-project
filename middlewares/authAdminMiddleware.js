const asyncHandler = require('express-async-handler');
const Admin = require('../models/adminModel');
const jwt = require('jsonwebtoken');

const authProtectAdmin = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            res.status(401);
            throw new Error("Not authorized, please login");
        }

        // Verify token
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // Get admin id from token
        const admin = await Admin.findById(verified.id).select("-password");

        if (!admin) {
            res.status(401);
            throw new Error("Admin not found");
        }

        req.user = admin;
        next();
    } catch (error) {
        res.status(401);
        throw new Error("Admin not authorized, please login");
    }
});

module.exports = authProtectAdmin;