// backend/routes/customOrderRoutes.js
const express = require('express');
const router = express.Router();

// !!! IMPORTANT: Create the corresponding controller file: controllers/customOrderController.js !!!
// Import the controller methods once created
const {
    createCustomOrder,
    getMyCustomOrders,
    getAllCustomOrders,
    getSingleCustomOrder,
    updateCustomOrderStatus,
    deleteCustomOrder,
    addCustomOrderNote
} = require('../controllers/customOrderController'); // <-- MAKE SURE THIS FILE AND FUNCTIONS EXIST

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// --- User Routes ---
// User submits a new custom order request (requires login if model links to user)
// Consider if non-logged-in users can submit - if so, remove isAuthenticatedUser here
router.route('/custom-order/new').post(createCustomOrder); // Requires controller implementation
// User views their own custom order requests (requires login)
router.route('/custom-orders/me').get(isAuthenticatedUser, getMyCustomOrders); // Requires controller implementation

// --- Admin Routes ---
// Admin views all custom order requests
router.route('/admin/custom-orders').get(isAuthenticatedUser, authorizeRoles('admin'), getAllCustomOrders); // Requires controller implementation
// Admin manages a single custom order request
router.route('/admin/custom-order/:id')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getSingleCustomOrder) // View details
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateCustomOrderStatus) // Update status
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteCustomOrder); // Delete request
// Admin adds internal notes to a custom order
router.route('/admin/custom-order/:id/notes').post(isAuthenticatedUser, authorizeRoles('admin'), addCustomOrderNote); // Requires controller implementation


// --- Placeholder Routes (REMOVE when controllers/functions are implemented) ---
// router.route('/custom-order/new').post((req, res) => res.status(501).json({ success: false, message: 'Custom order creation endpoint not implemented yet.' }));
// router.route('/custom-orders/me').get(isAuthenticatedUser, (req, res) => res.status(501).json({ success: false, message: 'Get my custom orders endpoint not implemented yet.' }));
// router.route('/admin/custom-orders').get(isAuthenticatedUser, authorizeRoles('admin'), (req, res) => res.status(501).json({ success: false, message: 'Get all custom orders endpoint not implemented yet.' }));
// router.route('/admin/custom-order/:id')
//     .get(isAuthenticatedUser, authorizeRoles('admin'), (req, res) => res.status(501).json({ success: false, message: 'Get single custom order endpoint not implemented yet.' }))
//     .put(isAuthenticatedUser, authorizeRoles('admin'), (req, res) => res.status(501).json({ success: false, message: 'Update custom order status endpoint not implemented yet.' }))
//     .delete(isAuthenticatedUser, authorizeRoles('admin'), (req, res) => res.status(501).json({ success: false, message: 'Delete custom order endpoint not implemented yet.' }));
// router.route('/admin/custom-order/:id/notes').post(isAuthenticatedUser, authorizeRoles('admin'), (req, res) => res.status(501).json({ success: false, message: 'Add custom order note endpoint not implemented yet.' }));
// --- End Placeholder Routes ---

module.exports = router;