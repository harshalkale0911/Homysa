// backend/middlewares/catchAsyncErrors.js

/**
 * Wraps an asynchronous route handler function to automatically catch
 * any errors that occur within it and pass them to the next()
 * error handling middleware. This avoids repetitive try...catch blocks
 * in every async controller function.
 *
 * @param {function} func - The asynchronous controller function (req, res, next) => Promise<...>
 * @returns {function} A new function that handles promise rejection
 */
const catchAsyncErrors = (func) => (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch(next);
};

module.exports = catchAsyncErrors;