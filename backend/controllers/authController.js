// backend/controllers/authController.js
const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/emailService');
const crypto = require('crypto');
const config = require('../config/config');
// const { uploadImage, deleteImage } = require('../utils/upload');

// --- Other functions (registerUser, loginUser, etc. - keep as they were) ---
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;
    console.log(`Registration attempt for: ${email}`);
    if (!name || !email || !password) return next(new ErrorHandler('Please provide name, email, and password', 400));
    if (password.length < 6) return next(new ErrorHandler('Password must be at least 6 characters long', 400));
    const existingUser = await User.findOne({ email });
    if (existingUser) { console.log(`Registration failed: Email ${email} already exists.`); return next(new ErrorHandler('Email address already registered', 400)); }
    const user = await User.create({ name, email, password });
    console.log(`User registered successfully: ${user._id}, Email: ${email}`);
    sendToken(user, 201, res);
});
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body; console.log(`Login attempt for email: ${email}`);
    if (!email || !password) { console.log('Login failed: Missing email or password'); return next(new ErrorHandler('Please enter email & password', 400)); }
    const user = await User.findOne({ email }).select('+password');
    if (!user) { console.log(`Login failed: User not found for email: ${email}`); return next(new ErrorHandler('Invalid Credentials', 401)); }
    console.log(`User found: ${user._id}, comparing password...`);
    if (!user.password) { console.error(`Login failed: Password field not selected/available for user ${user._id}.`); return next(new ErrorHandler('Server error during login', 500)); }
    const isPasswordMatched = await user.comparePassword(password); console.log(`Password match result for user ${user._id}: ${isPasswordMatched}`);
    if (!isPasswordMatched) { console.log(`Login failed: Password mismatch for user ${user._id}`); return next(new ErrorHandler('Invalid Credentials', 401)); }
    console.log(`Login successful for user ${user._id}`); sendToken(user, 200, res);
});

// --- Forgot Password (Enhanced Logging) ---
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const userEmail = req.body.email;
    console.log(`[FORGOT_PASSWORD] Request received for email: ${userEmail || '<< No Email Provided >>'}`);

    if (!userEmail) {
        console.log(`[FORGOT_PASSWORD] Failed: No email provided.`);
        return next(new ErrorHandler('Please provide an email address', 400));
    }
    if (!config.CLIENT_URL) {
        console.error("[FORGOT_PASSWORD] FATAL ERROR: CLIENT_URL environment variable is not set.");
        return next(new ErrorHandler('Password reset service is temporarily unavailable.', 500));
    }

    let user; // Define user outside try block for cleanup scope
    try {
        console.log(`[FORGOT_PASSWORD] Searching for user with email: ${userEmail}`);
        user = await User.findOne({ email: userEmail });

        if (!user) {
            console.warn(`[FORGOT_PASSWORD] No user found for email: ${userEmail}. Sending generic response.`);
            return res.status(200).json({
                success: true, // Mask failure
                message: `If an account with email ${userEmail} exists, a password reset link has been sent.`
            });
        }
        console.log(`[FORGOT_PASSWORD] User found: ${user._id}. Generating token...`);

        // --- Generate and Save Token ---
        const resetToken = user.getResetPasswordToken(); // This method sets internal fields
        if (!resetToken) {
             console.error(`[FORGOT_PASSWORD] Failed to generate reset token for user ${user._id}`);
             throw new Error('Token generation failed internally.'); // Throw error to be caught
        }
        await user.save({ validateBeforeSave: false }); // Save user with hashed token and expiry
        console.log(`[FORGOT_PASSWORD] Generated and saved reset token (hashed in DB) for user: ${user._id}`);

        // --- Create Reset URL ---
        const resetUrl = `${config.CLIENT_URL}/password/reset/${resetToken}`; // Use **unhashed** token
        console.log(`[FORGOT_PASSWORD] Generated Reset URL: ${resetUrl}`);

        // --- Prepare Email Message ---
        const message = `
You are receiving this email because you (or someone else) have requested the reset of the password for your Homysa account associated with ${user.email}.

Please click on the following link, or paste it into your browser to complete the process:
${resetUrl}

This link is valid for only 10 minutes.

If you did not request this password reset, please ignore this email and your password will remain unchanged.

Thank you,
The Homysa Team
        `.trim();

        // --- Send Email ---
        console.log(`[FORGOT_PASSWORD] Attempting to send email to: ${user.email}`);
        await sendEmail({
            email: user.email,
            subject: 'Homysa - Password Reset Request',
            message: message
        });

        console.log(`[FORGOT_PASSWORD] Email sent successfully to: ${user.email}`);
        res.status(200).json({
            success: true,
            message: `Password reset email sent successfully to ${user.email}. Please check your inbox (and spam folder). The link is valid for 10 minutes.`
        });

    } catch (error) { // Catch errors from token generation, save, or email sending
        console.error(`[FORGOT_PASSWORD] Process failed for ${userEmail}. Error:`, error);
        console.error(error.stack); // Log full stack trace

        // Clear potentially invalid tokens if error occurred after finding user
        if (user) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            try {
                await user.save({ validateBeforeSave: false });
                console.log(`[FORGOT_PASSWORD] Cleared potentially invalid reset tokens for user ${user._id} due to error.`);
            } catch (saveError) {
                console.error(`[FORGOT_PASSWORD] Failed to clear reset tokens for user ${user._id} after error:`, saveError);
            }
        }
        // Send a user-friendly error message
        return next(new ErrorHandler('Failed to process password reset request. Please try again later.', 500));
    }
});

// --- Reset Password ---
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.params; const { password, confirmPassword } = req.body;
    console.log(`INFO: Password reset attempt received with token starting: ${token ? token.substring(0, 5) + '...' : 'N/A'}`);
    if (!password || !confirmPassword) return next(new ErrorHandler('Please provide new password and confirm password', 400));
    if (password !== confirmPassword) return next(new ErrorHandler('Passwords do not match', 400));
    if (password.length < 6) return next(new ErrorHandler('Password must be at least 6 characters long', 400));
    if (!token) return next(new ErrorHandler('Password reset token is missing.', 400));
    let resetPasswordTokenHashed; try { resetPasswordTokenHashed = crypto.createHash('sha256').update(token).digest('hex'); console.log(`INFO: Searching for user with hashed token starting: ${resetPasswordTokenHashed.substring(0, 10)}...`); } catch (hashError) { console.error("ERROR: Failed to hash incoming reset token:", hashError); return next(new ErrorHandler('Invalid token format.', 400)); }
    const user = await User.findOne({ resetPasswordToken: resetPasswordTokenHashed, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) { console.log(`WARN: Password reset failed - Token invalid or expired for hashed token starting: ${resetPasswordTokenHashed.substring(0, 10)}...`); return next(new ErrorHandler('Password reset token is invalid or has expired.', 400)); }
    console.log(`INFO: User ${user._id} found for password reset. Updating password...`);
    user.password = password; user.resetPasswordToken = undefined; user.resetPasswordExpire = undefined;
    try { await user.save(); console.log(`INFO: Password updated and reset tokens cleared successfully for user ${user._id}.`); } catch (saveError) { console.error(`ERROR: Failed to save user after password reset for user ${user._id}:`, saveError); return next(new ErrorHandler('Failed to save new password.', 500)); }
    sendToken(user, 200, res);
});

// --- Other Auth Functions ---
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
     if (!req.user) { console.error("Error in getUserProfile: req.user missing."); return next(new ErrorHandler('Authentication error', 401)); }
     console.log(`Fetching profile for user: ${req.user._id}`);
     res.status(200).json({ success: true, user: req.user });
});
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body; const userId = req.user._id; console.log(`Password update request for user: ${userId}`);
    if (!oldPassword || !newPassword) { return next(new ErrorHandler('Please provide current and new passwords', 400)); }
    if (newPassword.length < 6) { return next(new ErrorHandler('New password must be at least 6 characters long', 400)); }
    if (oldPassword === newPassword) { return next(new ErrorHandler('New password cannot be the same as the current password', 400)); }
    const user = await User.findById(userId).select('+password'); if (!user) { return next(new ErrorHandler('User not found', 404)); } // Added check just in case
    const isMatched = await user.comparePassword(oldPassword); if (!isMatched) { console.log(`Password update failed for user ${userId}: Incorrect old password.`); return next(new ErrorHandler('Incorrect current password', 400)); }
    user.password = newPassword; await user.save(); console.log(`Password updated successfully for user ${userId}.`);
    res.status(200).json({ success: true, message: 'Password updated successfully' });
});
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const { name, email } = req.body; const userId = req.user._id; console.log(`Profile update request for user: ${userId}`, { name, email });
    const newUserData = {}; /** @type {{ name?: string; email?: string; avatar?: { public_id: string; url: string } }} */
    if (name && name !== req.user.name) { newUserData.name = name; }
    if (email) { const normalizedEmail = email.toLowerCase(); if (normalizedEmail !== req.user.email.toLowerCase()) { console.log(`Email change requested for user ${userId} to ${normalizedEmail}`); const emailExists = await User.findOne({ email: normalizedEmail, _id: { $ne: userId } }); if (emailExists) { console.log(`Profile update failed: Email ${normalizedEmail} already in use.`); return next(new ErrorHandler('Email address already in use by another account', 400)); } newUserData.email = normalizedEmail; } }
    // Avatar update placeholder
    if (Object.keys(newUserData).length === 0) { console.log(`Profile update for user ${userId}: No changes detected.`); return next(new ErrorHandler('No changes submitted for update', 400)); }
    console.log(`Updating user ${userId} with data:`, newUserData);
    await User.findByIdAndUpdate(userId, newUserData, { new: true, runValidators: true });
    const userForResponse = await User.findById(userId); console.log(`Profile updated successfully for user ${userId}.`);
    res.status(200).json({ success: true, user: userForResponse });
});
exports.logout = catchAsyncErrors(async (req, res, next) => {
    console.log(`Logout request received. Clearing token cookie.`);
    res.cookie('token', 'none', { expires: new Date(Date.now()), httpOnly: true, secure: config.NODE_ENV === 'production', sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax' });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});