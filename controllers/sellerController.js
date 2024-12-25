const asyncHandler = require("express-async-handler");

const registerSeller = asyncHandler(async (req, res) => {
    res.send('Register a seller');
});

module.exports = {
    registerSeller
}