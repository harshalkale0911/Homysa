// backend/middlewares/auth.js
const jwt = require('jsonwebtoken');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('./catchAsyncErrors');
const User = require('../models/User');
const config = require('../config/config'); // For JWT_SECRET

// Checks if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies; // Extract token from cookies

    // Check if token exists and is not explicitly set to 'none' (e.g., after logout)
    if (!token || token === 'none') {
        return next(new ErrorHandler('Login required to access this resource.', 401));
    }

    try {
        // Verify the token using the secret
        const decoded = jwt.verify(token, config.JWT_SECRET);

        // Find user by ID from token payload
        // Exclude sensitive fields like password and reset tokens
        req.user = await User.findById(decoded.id)
                             .select('-password -resetPasswordToken -resetPasswordExpire');

        // Check if the user associated with the token still exists
        if (!req.user) {
             // Clear the invalid cookie from the browser
             res.cookie('token', 'none', {
                 expires: new Date(Date.now()), // Expire immediately
                 httpOnly: true,
                 secure: config.NODE_ENV === 'production',
                 sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax' // Match logout setting
             });
             return next(new ErrorHandler('User belonging to this token no longer exists. Please login again.', 401));
        }

        // User is authenticated, proceed to the next middleware/route handler
        next();

    } catch (error) {
        // Handle specific JWT errors
        let errorMessage = 'Authentication failed. Invalid token.';
        let statusCode = 401;

        if (error.name === 'TokenExpiredError') {
            errorMessage = 'Session expired, please login again.';
            statusCode = 401; // Keep 401 for expired token
        } else if (error.name === 'JsonWebTokenError') {
            errorMessage = 'Invalid token signature. Please login again.';
             statusCode = 401;
        } else {
            // Log unexpected errors during token verification
             console.error("JWT Verification Error:", error);
             errorMessage = 'Authentication error. Please try again.';
             statusCode = 500; // Or 401 depending on policy
        }


         // Clear potentially invalid cookie
         res.cookie('token', 'none', {
             expires: new Date(Date.now()),
             httpOnly: true,
             secure: config.NODE_ENV === 'production',
             sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax'
         });

         return next(new ErrorHandler(errorMessage, statusCode));
    }

});

// Handling user roles authorization
exports.authorizeRoles = (...roles) => { // Expects role strings like 'admin', 'user'
    return (req, res, next) => {
        // This middleware must run *after* isAuthenticatedUser

        if (!req.user) {
             // Should not happen if isAuthenticatedUser runs first, but good safety check
            return next(new ErrorHandler('Authentication required before checking roles.', 401));
        }

        if (!roles.includes(req.user.role)) {
            // User's role is not in the list of allowed roles
            return next(
                new ErrorHandler(
                    `Access Denied. Role (${req.user.role}) is not authorized to access this resource.`,
                    403 // 403 Forbidden status code
                )
            );
        }
        // User has one of the required roles, proceed
        next();
    };
};