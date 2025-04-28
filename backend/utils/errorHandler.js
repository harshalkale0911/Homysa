// backend/utils/errorHandler.js

// Custom Error class that extends the built-in Error class.
// This allows us to create errors with specific HTTP status codes.
class ErrorHandler extends Error {
    /**
     * Creates an instance of ErrorHandler.
     * @param {string} message - The error message.
     * @param {number} statusCode - The HTTP status code associated with the error.
     */
    constructor(message, statusCode) {
        super(message); // Call the parent class constructor (Error) with the message
        this.statusCode = statusCode; // Assign the status code

        // Capture the stack trace, excluding the ErrorHandler constructor call
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorHandler;