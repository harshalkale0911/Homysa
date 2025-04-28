// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
    // Admin User Management Controllers
    allUsers,
    getUserDetails,
    updateUser, // Update user details/role
    deleteUser
} = require('../controllers/userController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// --- Admin Routes (Require Authentication and 'admin' role) ---

// GET all users (potentially with pagination)
router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), allUsers);

// GET, PUT, DELETE a specific user by ID
router.route('/admin/user/:id')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getUserDetails) // Get details of one user
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateUser)     // Update user details (name, email, role)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser); // Delete a user

module.exports = router;