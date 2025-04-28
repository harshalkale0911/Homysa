// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
    registerUser, loginUser, logout,
    forgotPassword, // <-- Relevant
    resetPassword, // <-- Relevant
    getUserProfile, updatePassword, updateProfile
} = require('../controllers/authController');
const { isAuthenticatedUser } = require('../middlewares/auth');

// Public Routes
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logout);

// Password Reset Flow Routes
router.route('/password/forgot').post(forgotPassword); // <-- Relevant
router.route('/password/reset/:token').put(resetPassword); // <-- Relevant

// Protected Routes
router.route('/me').get(isAuthenticatedUser, getUserProfile);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);
router.route('/me/update').put(isAuthenticatedUser, updateProfile);

module.exports = router;