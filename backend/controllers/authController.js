// backend/controllers/authController.js
const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/emailService');
const crypto = require('crypto');
const config = require('../config/config');
// const { uploadImage, deleteImage } = require('../utils/upload');

// --- Register User ---
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;
    console.log(`[REGISTER] Attempt for: ${email}`);
    if (!name || !email || !password) return next(new ErrorHandler('Please provide name, email, and password', 400));
    if (password.length < 6) return next(new ErrorHandler('Password must be at least 6 characters long', 400));
    const existingUser = await User.findOne({ email });
    if (existingUser) { console.log(`[REGISTER] Failed: Email ${email} already exists.`); return next(new ErrorHandler('Email address already registered', 400)); }
    const user = await User.create({ name, email, password });
    console.log(`[REGISTER] Success: User ${user._id}, Email: ${email}`);
    sendToken(user, 201, res);
});

// --- Login User (With Detailed Logging) ---
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    console.log(`[LOGIN] Attempt for email: ${email}`);

    if (!email || !password) {
        console.log('[LOGIN] Failed: Missing email or password.');
        return next(new ErrorHandler('Please enter email & password', 400));
    }

    // Find user and explicitly select the password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        // Log specifically that user wasn't found for debugging
        console.log(`[LOGIN] Failed: User not found for email: ${email}.`);
        // Return generic error to frontend
        return next(new ErrorHandler('Invalid Credentials', 401));
    }
    console.log(`[LOGIN] User found: ${user._id}. Comparing password...`);

    // Ensure password field was actually retrieved (sanity check)
    if (!user.password) {
         console.error(`[LOGIN] CRITICAL FAIL: Password field not selected/available for user ${user._id}. Check User model 'select' option.`);
         return next(new ErrorHandler('Server configuration error during login.', 500));
    }

    // Compare password using the method defined in the User model
    const isPasswordMatched = await user.comparePassword(password);
    // Log the result of the comparison for debugging
    console.log(`[LOGIN] Password match result for user ${user._id}: ${isPasswordMatched}`);

    if (!isPasswordMatched) {
        // Log specifically that the password mismatch occurred
        console.log(`[LOGIN] Failed: Password mismatch for user ${user._id}.`);
        // Return generic error to frontend
        return next(new ErrorHandler('Invalid Credentials', 401));
    }

    // If everything matches
    console.log(`[LOGIN] Success for user ${user._id}. Sending token.`);
    sendToken(user, 200, res);
});


// --- Forgot Password ---
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const userEmail = req.body.email; console.log(`[FORGOT_PASSWORD] Request received for email: ${userEmail || '<< No Email Provided >>'}`);
    if (!userEmail) { console.log(`[FORGOT_PASSWORD] Failed: No email provided.`); return next(new ErrorHandler('Please provide an email address', 400)); }
    if (!config.CLIENT_URL) { console.error("[FORGOT_PASSWORD] FATAL ERROR: CLIENT_URL missing."); return next(new ErrorHandler('Password reset service unavailable.', 500)); }
    let user;
    try {
        console.log(`[FORGOT_PASSWORD] Searching for user: ${userEmail}`); user = await User.findOne({ email: userEmail });
        if (!user) { console.warn(`[FORGOT_PASSWORD] No user found for ${userEmail}. Sending generic response.`); return res.status(200).json({ success: true, message: `If account exists, email sent to ${userEmail}.` }); }
        console.log(`[FORGOT_PASSWORD] User found: ${user._id}. Generating token...`);
        const resetToken = user.getResetPasswordToken(); if (!resetToken) { console.error(`[FORGOT_PASSWORD] Failed to generate token for user ${user._id}`); throw new Error('Token generation failed.'); }
        await user.save({ validateBeforeSave: false }); console.log(`[FORGOT_PASSWORD] Saved reset token (hashed) for user: ${user._id}`);
        const resetUrl = `${config.CLIENT_URL}/password/reset/${resetToken}`; console.log(`[FORGOT_PASSWORD] Reset URL: ${resetUrl}`);
        const message = `Password reset requested for ${user.email}.\nClick here: ${resetUrl}\nLink valid 10 minutes.\nIf not you, ignore this.\n\nHomysa Team`.trim();
        console.log(`[FORGOT_PASSWORD] Sending email to: ${user.email}`); await sendEmail({ email: user.email, subject: 'Homysa - Password Reset Request', message: message });
        console.log(`[FORGOT_PASSWORD] Email sent successfully to: ${user.email}`);
        res.status(200).json({ success: true, message: `Password reset email sent to ${user.email}. Check inbox/spam. Link valid 10 minutes.` });
    } catch (error) {
        console.error(`[FORGOT_PASSWORD] Process failed for ${userEmail}. Error:`, error); console.error(error.stack);
        if (user) { user.resetPasswordToken = undefined; user.resetPasswordExpire = undefined; try { await user.save({ validateBeforeSave: false }); console.log(`[FORGOT_PASSWORD] Cleared tokens for ${user._id} due to error.`); } catch (saveError) { console.error(`[FORGOT_PASSWORD] Failed to clear tokens for ${user._id}:`, saveError); } }
        return next(new ErrorHandler('Failed to process password reset. Try again later.', 500));
    }
});

// --- Reset Password ---
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.params; const { password, confirmPassword } = req.body; console.log(`[RESET_PASSWORD] Attempt token start: ${token ? token.substring(0, 5) + '...' : 'N/A'}`);
    if (!password || !confirmPassword) return next(new ErrorHandler('Provide new password & confirm', 400));
    if (password !== confirmPassword) return next(new ErrorHandler('Passwords do not match', 400));
    if (password.length < 6) return next(new ErrorHandler('Password min 6 chars', 400));
    if (!token) return next(new ErrorHandler('Reset token missing.', 400));
    let resetPasswordTokenHashed; try { resetPasswordTokenHashed = crypto.createHash('sha256').update(token).digest('hex'); console.log(`[RESET_PASSWORD] Hashed token start: ${resetPasswordTokenHashed.substring(0, 10)}...`); } catch (hashError) { console.error("[RESET_PASSWORD] Failed to hash token:", hashError); return next(new ErrorHandler('Invalid token format.', 400)); }
    const user = await User.findOne({ resetPasswordToken: resetPasswordTokenHashed, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) { console.log(`[RESET_PASSWORD] Failed: Token invalid/expired for hash start: ${resetPasswordTokenHashed.substring(0, 10)}...`); return next(new ErrorHandler('Reset token invalid or expired.', 400)); }
    console.log(`[RESET_PASSWORD] User ${user._id} found. Updating password...`);
    user.password = password; user.resetPasswordToken = undefined; user.resetPasswordExpire = undefined;
    try { await user.save(); console.log(`[RESET_PASSWORD] Password updated & tokens cleared for ${user._id}.`); } catch (saveError) { console.error(`[RESET_PASSWORD] Failed save user ${user._id}:`, saveError); return next(new ErrorHandler('Failed save new password.', 500)); }
    sendToken(user, 200, res);
});

// --- Other Auth Functions (Condensed for brevity) ---
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => { if (!req.user) { console.error("Error in getUserProfile: req.user missing."); return next(new ErrorHandler('Authentication error', 401)); } console.log(`Fetching profile for user: ${req.user._id}`); res.status(200).json({ success: true, user: req.user }); });
exports.updatePassword = catchAsyncErrors(async (req, res, next) => { const { oldPassword, newPassword } = req.body; const userId = req.user._id; console.log(`Password update request for user: ${userId}`); if (!oldPassword || !newPassword) { return next(new ErrorHandler('Provide current and new passwords', 400)); } if (newPassword.length < 6) { return next(new ErrorHandler('New password min 6 chars', 400)); } if (oldPassword === newPassword) { return next(new ErrorHandler('New password same as old', 400)); } const user = await User.findById(userId).select('+password'); if (!user) { return next(new ErrorHandler('User not found', 404)); } const isMatched = await user.comparePassword(oldPassword); if (!isMatched) { console.log(`Password update failed for user ${userId}: Incorrect old password.`); return next(new ErrorHandler('Incorrect current password', 400)); } user.password = newPassword; await user.save(); console.log(`Password updated successfully for user ${userId}.`); res.status(200).json({ success: true, message: 'Password updated successfully' }); });
exports.updateProfile = catchAsyncErrors(async (req, res, next) => { const { name, email } = req.body; const userId = req.user._id; console.log(`Profile update request for user: ${userId}`, { name, email }); const newUserData = {}; /** @type {{ name?: string; email?: string; avatar?: { public_id: string; url: string } }} */ if (name && name !== req.user.name) { newUserData.name = name; } if (email) { const normalizedEmail = email.toLowerCase(); if (normalizedEmail !== req.user.email.toLowerCase()) { console.log(`Email change requested for user ${userId} to ${normalizedEmail}`); const emailExists = await User.findOne({ email: normalizedEmail, _id: { $ne: userId } }); if (emailExists) { console.log(`Profile update failed: Email ${normalizedEmail} already in use.`); return next(new ErrorHandler('Email address already in use', 400)); } newUserData.email = normalizedEmail; } } /* Avatar update placeholder */ if (Object.keys(newUserData).length === 0) { console.log(`Profile update for user ${userId}: No changes.`); return next(new ErrorHandler('No changes submitted', 400)); } console.log(`Updating user ${userId} with:`, newUserData); await User.findByIdAndUpdate(userId, newUserData, { new: true, runValidators: true }); const userForResponse = await User.findById(userId); console.log(`Profile updated successfully for ${userId}.`); res.status(200).json({ success: true, user: userForResponse }); });
exports.logout = catchAsyncErrors(async (req, res, next) => { console.log(`Logout request. Clearing cookie.`); res.cookie('token', 'none', { expires: new Date(Date.now()), httpOnly: true, secure: config.NODE_ENV === 'production', sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax' }); res.status(200).json({ success: true, message: 'Logged out successfully' }); });