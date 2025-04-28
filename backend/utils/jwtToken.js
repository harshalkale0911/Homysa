// backend/utils/jwtToken.js
const config = require('../config/config'); // Import configuration

/**
 * Creates a JWT, sets it in an HTTP-only cookie, and sends the response.
 * @param {object} user - The user object (Mongoose document).
 * @param {number} statusCode - The HTTP status code for the response.
 * @param {express.Response} res - The Express response object.
 */
const sendToken = (user, statusCode, res) => {
    // 1. Create JWT token using the method from the User model
    const token = user.getJwtToken();

    // Check if token generation failed (e.g., missing secret)
    if (!token) {
         console.error("JWT token generation failed. Check JWT_SECRET and JWT_EXPIRE configuration.");
         // Avoid sending partial response, maybe throw error?
         // For now, sending a generic server error.
         return res.status(500).json({
            success: false,
            message: "Authentication failed due to server configuration error."
         });
    }

    // 2. Define options for the cookie
    // Ensure COOKIE_EXPIRES_TIME is treated as days
    const cookieExpireTimeDays = parseInt(config.COOKIE_EXPIRES_TIME, 10) || 30; // Default 30 days
    const cookieExpireMilliseconds = cookieExpireTimeDays * 24 * 60 * 60 * 1000;

    const options = {
        // Set expiry date based on config (in milliseconds)
        expires: new Date(Date.now() + cookieExpireMilliseconds),
        httpOnly: true, // Cookie cannot be accessed by client-side JavaScript (prevents XSS)
        secure: config.NODE_ENV === 'production', // Send cookie only over HTTPS in production
        // SameSite attribute helps prevent CSRF attacks
        // 'strict': Cookie sent only for same-site requests (most secure)
        // 'lax': Default in most browsers, sent on top-level navigation, safe HTTP methods
        // 'none': Sent on all requests (cross-site included), REQUIRES 'secure: true'
        sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax' // Adjust based on your setup
        // path: '/' // Usually defaults to '/', accessible site-wide
    };

    // 3. Prepare user data for the response (remove sensitive fields)
    // Use toObject() if 'user' is a Mongoose document to get a plain object
    const userResponse = user.toObject ? user.toObject() : { ...user };

    // Explicitly remove fields that should never be sent to the client
    delete userResponse.password;
    delete userResponse.resetPasswordToken;
    delete userResponse.resetPasswordExpire;
    delete userResponse.__v; // Optionally remove Mongoose version key
    // delete userResponse.createdAt; // Optionally remove timestamps
    // delete userResponse.updatedAt;

    // 4. Send the response with cookie and JSON body
    res.status(statusCode)
       .cookie('token', token, options) // Set the JWT in the cookie
       .json({
            success: true,
            // Optionally send the token in the body as well (depends on frontend auth strategy)
            // token: token,
            user: userResponse // Send sanitized user data
       });
};

module.exports = sendToken;