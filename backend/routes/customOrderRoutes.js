// backend/routes/customOrderRoutes.js
const express = require('express');
const router = express.Router();

// Import the controller methods
const {
    createCustomOrder,
    getMyCustomOrders,
    getAllCustomOrders,
    getSingleCustomOrder,
    updateCustomOrderStatus,
    deleteCustomOrder,
    addCustomOrderNote
} = require('../controllers/customOrderController'); // Ensure this file exists and exports these functions

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// --- User Routes ---
// POST /api/v1/custom-order/new
router.route('/custom-order/new').post(createCustomOrder); // Use implemented controller

// GET /api/v1/custom-orders/me (Requires login)
router.route('/custom-orders/me').get(isAuthenticatedUser, getMyCustomOrders);

// --- Admin Routes (Require Admin Role) ---
// GET /api/v1/admin/custom-orders
router.route('/admin/custom-orders').get(isAuthenticatedUser, authorizeRoles('admin'), getAllCustomOrders);

// GET, PUT, DELETE /api/v1/admin/custom-order/:id
router.route('/admin/custom-order/:id')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getSingleCustomOrder)
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateCustomOrderStatus)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteCustomOrder);

// POST /api/v1/admin/custom-order/:id/notes
router.route('/admin/custom-order/:id/notes').post(isAuthenticatedUser, authorizeRoles('admin'), addCustomOrderNote);

module.exports = router;