const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/Users');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]; }
    // else if (req.cookies.token){
    //     token = req.cookies.token
    // }

    // Make sure token exists
    if(!token){
        return next(new ErrorResponse('Not Authorized', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        // Currently logged in user
        req.user = await User.findbyId(decoded.id);
        next();
    } catch (err) {
        return next(new ErrorResponse('Not Authorized', 401));
    }
});