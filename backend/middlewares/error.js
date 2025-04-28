// backend/middlewares/error.js
const ErrorHandler = require('../utils/errorHandler');
const config = require('../config/config'); // To check NODE_ENV

module.exports = (err, req, res, next) => {
    // Ensure statusCode and message are set, default if necessary
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Log the full error for debugging, especially in development
    if (config.NODE_ENV !== 'production') { // Log more broadly than just 'development'
        console.error('--- ERROR ---');
        console.error('Status Code:', err.statusCode);
        console.error('Message:', err.message);
        console.error('Stack:', err.stack);
        console.error('Original Error:', err); // Log the original error object too
        console.error('-------------');
    }

    // Create a copy to avoid modifying the original err object directly
    // This helps ensure custom properties like statusCode are preserved
    let error = {
        statusCode: err.statusCode,
        message: err.message,
        // Include other properties if needed, but be careful about leaking info
    };

    // --- Specific Mongoose Error Handling ---

    // 1. Invalid ObjectId (CastError)
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid format for path: ${err.path}`; // Simplified message
        error = new ErrorHandler(message, 400); // 400 Bad Request is often suitable
    }

    // 2. Validation Error
    if (err.name === 'ValidationError') {
        // Combine multiple validation error messages into a single string
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new ErrorHandler(message, 400); // Bad Request
    }

    // 3. Duplicate Key Error (e.g., unique email)
    if (err.code === 11000) {
        // Extract the field that caused the duplicate error
        const field = Object.keys(err.keyValue)[0];
        const message = `This ${field} is already registered. Please use a different value.`;
        error = new ErrorHandler(message, 400); // Bad Request
    }

    // --- Specific JWT Error Handling ---

    // 4. Invalid JWT Signature
    if (err.name === 'JsonWebTokenError') {
        const message = 'Authentication failed. Invalid token.'; // Keep it somewhat generic
        error = new ErrorHandler(message, 401); // Unauthorized
    }

    // 5. Expired JWT
    if (err.name === 'TokenExpiredError') {
        const message = 'Your session has expired. Please log in again.';
        error = new ErrorHandler(message, 401); // Unauthorized
    }

    // --- Response ---
    // In production, send only the message for non-operational errors (statusCode 500)
    // For operational errors (like 400, 401, 404), send the specific message.
    let responseMessage = error.message;
    if (config.NODE_ENV === 'production' && error.statusCode === 500) {
        responseMessage = 'Something went wrong on the server.'; // Generic message for 500 in prod
    }


    res.status(error.statusCode).json({
        success: false,
        message: responseMessage,
        // Only send the error stack in development mode for debugging
        ...(config.NODE_ENV === 'development' && { stack: err.stack, error: err })
    });
};