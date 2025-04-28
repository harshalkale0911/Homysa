// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {
    // Product CRUD (Admin)
    newProduct,
    updateProduct,
    deleteProduct,
    // Product Retrieval (Public/Admin)
    getProducts,
    getSingleProduct,
    // Review CRUD (User/Admin)
    createProductReview,
    getProductReviews,
    deleteReview
} = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// --- Public Routes ---
// GET all products (supports filtering, search, pagination via query params)
router.route('/products').get(getProducts);
// GET single product details by ID
router.route('/product/:id').get(getSingleProduct);
// GET reviews for a specific product (requires productId query param)
router.route('/reviews').get(getProductReviews); // e.g., /api/v1/reviews?productId=12345

// --- Authenticated User Routes ---
// PUT to create or update a review for a product
router.route('/review').put(isAuthenticatedUser, createProductReview);
// DELETE own review (or admin deletes any review) - requires productId & reviewId query params
// Authorization check is handled within the controller
router.route('/reviews').delete(isAuthenticatedUser, deleteReview); // e.g., /api/v1/reviews?productId=123&id=abc

// --- Admin Routes (Require Authentication and 'admin' role) ---
// POST to create a new product
router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);

// PUT and DELETE a specific product by ID
router.route('/admin/product/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

// --- Optional Admin Review Management ---
// Example: Route for admin to delete any review directly by review ID (if needed separate from product context)
// router.route('/admin/review/:reviewId').delete(isAuthenticatedUser, authorizeRoles('admin'), adminDeleteReview);
// Example: Route for admin to get all reviews (potentially with filtering)
// router.route('/admin/reviews').get(isAuthenticatedUser, authorizeRoles('admin'), adminGetAllReviews);

module.exports = router;