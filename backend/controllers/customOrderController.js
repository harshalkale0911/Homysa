// backend/controllers/customOrderController.js
const CustomOrder = require('../models/CustomOrder'); // Import the model if you use it
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
// Import other necessary utilities (e.g., upload, sendEmail) when implementing fully

// Placeholder function for creating a custom order
exports.createCustomOrder = catchAsyncErrors(async (req, res, next) => {
    console.log("Received custom order request body:", req.body);
    console.log("Received custom order request files:", req.files); // Check if files are received

    // --- TODO: Implement actual logic ---
    // 1. Validate input data thoroughly.
    // 2. Handle file uploads (e.g., to Cloudinary using uploadImage utility).
    // 3. Create CustomOrder document in the database.
    // 4. Send notification emails (admin, user confirmation).

    // For now, send a "Not Implemented" response
    return next(new ErrorHandler('Custom order creation not fully implemented yet.', 501));

    /* --- Example Structure (Implement Later) ---
    const { name, email, phone, category, description, budget, dimensions, woodType, timeframe } = req.body;

    // Basic Validation
    if (!name || !email || !phone || !category || !description) {
        return next(new ErrorHandler('Please provide all required fields: name, email, phone, category, description.', 400));
    }

    let uploadedImages = [];
    if (req.files && req.files.referenceImages) {
         const filesArray = Array.isArray(req.files.referenceImages) ? req.files.referenceImages : [req.files.referenceImages];
         try {
            for (const file of filesArray) {
                if (!file.tempFilePath) continue;
                 const result = await require('../utils/upload').uploadImage(file.tempFilePath, 'homysa/custom_orders');
                uploadedImages.push({ public_id: result.public_id, url: result.url });
            }
         } catch (error) {
             console.error("Custom order image upload error:", error);
             return next(new ErrorHandler('Failed to upload reference images.', 500));
         }
    }

    const orderData = {
        name, email, phone, category, description, budget, dimensions, woodType, timeframe,
        referenceImages: uploadedImages,
        user: req.user?._id // Link to user if logged in
    };

    const customOrder = await CustomOrder.create(orderData);

    // TODO: Send emails

    res.status(201).json({
        success: true,
        message: "Custom order request submitted successfully!",
        customOrder
    });
    */
});

// Placeholder for getting user's custom orders
exports.getMyCustomOrders = catchAsyncErrors(async (req, res, next) => {
    // TODO: Find orders where user matches req.user._id
    return next(new ErrorHandler('Get My Custom Orders not implemented yet.', 501));
});

// Placeholder for getting all custom orders (Admin)
exports.getAllCustomOrders = catchAsyncErrors(async (req, res, next) => {
    // TODO: Find all orders, add filtering/pagination
    return next(new ErrorHandler('Get All Custom Orders not implemented yet.', 501));
});

// Placeholder for getting a single custom order (Admin)
exports.getSingleCustomOrder = catchAsyncErrors(async (req, res, next) => {
    // TODO: Find order by req.params.id
    return next(new ErrorHandler('Get Single Custom Order not implemented yet.', 501));
});

// Placeholder for updating custom order status (Admin)
exports.updateCustomOrderStatus = catchAsyncErrors(async (req, res, next) => {
    // TODO: Find order by req.params.id, update status from req.body.status
    return next(new ErrorHandler('Update Custom Order Status not implemented yet.', 501));
});

// Placeholder for deleting a custom order (Admin)
exports.deleteCustomOrder = catchAsyncErrors(async (req, res, next) => {
    // TODO: Find order by req.params.id and delete (handle image cleanup?)
    return next(new ErrorHandler('Delete Custom Order not implemented yet.', 501));
});

// Placeholder for adding a note to a custom order (Admin)
exports.addCustomOrderNote = catchAsyncErrors(async (req, res, next) => {
    // TODO: Find order by req.params.id, add note from req.body.text, link to req.user._id
    return next(new ErrorHandler('Add Custom Order Note not implemented yet.', 501));
});