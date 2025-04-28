// backend/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const {
    newContact,
    getContacts,
    getSingleContact,
    updateContact,
    deleteContact
} = require('../controllers/contactController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// Public route for submitting a new contact message
router.route('/contact/new').post(newContact);

// --- Admin Routes (Protected) ---
// These routes require the user to be logged in AND have the 'admin' role

// GET all contact messages
router.route('/admin/contacts').get(isAuthenticatedUser, authorizeRoles('admin'), getContacts);

// GET, PUT, DELETE a single contact message by ID
router.route('/admin/contact/:id')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getSingleContact)    // Get details of one message
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateContact)      // Update status of a message
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteContact);  // Delete a message

module.exports = router;