// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const {
    newOrder,
    getSingleOrder,
    myOrders,
    allOrders,
    updateOrder,
    deleteOrder
} = require('../controllers/orderController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// --- User Routes (Require Authentication) ---

// Create a new order
router.route('/order/new').post(isAuthenticatedUser, newOrder);

// Get details of a specific order (user must own it or be admin)
router.route('/order/:id').get(isAuthenticatedUser, getSingleOrder);

// Get all orders placed by the logged-in user
router.route('/orders/me').get(isAuthenticatedUser, myOrders);

// --- Admin Routes (Require Authentication and 'admin' role) ---

// Get all orders in the system
router.route('/admin/orders').get(isAuthenticatedUser, authorizeRoles('admin'), allOrders);

// Update or Delete a specific order by ID
router.route('/admin/order/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder) // Update order status/details
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder); // Delete an order (use with caution)

module.exports = router;