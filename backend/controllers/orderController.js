// backend/controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Helper function to update product stock - now returns true on success, false on failure
async function updateStock(productId, quantity, operation = 'subtract') {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            console.error(`Product not found for stock update: ${productId}`);
            // This should ideally not happen if product validation is done before order creation
            // Depending on strictness, you might throw an error here that rolls back the order?
            // For now, log and return failure.
            return false;
        }

        if (operation === 'subtract') {
             if (product.stock < quantity) {
                 console.error(`Insufficient stock for product ${productId}. Required: ${quantity}, Available: ${product.stock}`);
                 // Throwing an error here is better as it prevents order creation with insufficient stock
                 throw new ErrorHandler(`Insufficient stock for product: ${product.name}`, 400);
                 // return false; // Less strict option
             }
             product.stock -= quantity;
        } else if (operation === 'add') {
            product.stock += quantity;
        } else {
             console.error(`Invalid stock operation: ${operation}`);
             return false;
        }


        await product.save({ validateBeforeSave: false }); // Skip validation if only updating stock
        return true; // Indicate success

    } catch (error) {
         console.error(`Error updating stock for product ${productId}:`, error);
         // Re-throw specific known errors
         if (error instanceof ErrorHandler) throw error;
         // Throw a generic error for unexpected issues
         throw new ErrorHandler(`Failed to update stock for product ID ${productId}`, 500);
         // return false; // Less strict option
    }
}


// Create a new order => /api/v1/order/new
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice, // Frontend should calculate this based on cart items
        taxPrice, // Frontend or backend calculation? Be consistent.
        shippingPrice, // Frontend or backend calculation? Be consistent.
        totalPrice, // Frontend or backend calculation? Be consistent.
        paymentInfo // Assume this contains { id, status } from payment gateway
    } = req.body;

    // --- Robust Validation ---
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
        return next(new ErrorHandler('Order must contain at least one item', 400));
    }
    if (!shippingInfo) {
         return next(new ErrorHandler('Shipping information is required', 400));
    }
     // Validate required shipping fields (mirroring the model)
     const requiredShippingFields = ['address', 'city', 'state', 'country', 'pinCode', 'phoneNo'];
     for (const field of requiredShippingFields) {
         if (!shippingInfo[field]) {
             return next(new ErrorHandler(`Shipping information missing required field: ${field}`, 400));
         }
     }
     if (!paymentInfo || !paymentInfo.id || !paymentInfo.status) {
        return next(new ErrorHandler('Payment information (id and status) is required', 400));
    }
    // Basic check for price calculations (can be made more robust)
    if (itemsPrice == null || taxPrice == null || shippingPrice == null || totalPrice == null) {
         return next(new ErrorHandler('Price details (items, tax, shipping, total) are required', 400));
    }
    // TODO: Optionally, recalculate totalPrice on the backend for security/consistency
    // const backendTotalPrice = itemsPrice + taxPrice + shippingPrice;
    // if (Math.abs(backendTotalPrice - totalPrice) > 0.01) { // Allow for small floating point differences
    //     console.warn(`Total price discrepancy. Frontend: ${totalPrice}, Backend calculated: ${backendTotalPrice}`);
    //     // Decide whether to reject the order or use the backend calculation
    //     // return next(new ErrorHandler('Total price mismatch', 400));
    // }

    // --- Create Order Object ---
    const orderData = {
        orderItems, // Consider validating item structure (name, quantity, price, image, product ID)
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice, // Use the validated/recalculated total price
        paymentInfo, // Ensure structure matches the model
        paidAt: paymentInfo.status === 'succeeded' ? Date.now() : undefined, // Set paidAt if payment succeeded
        user: req.user._id, // User ID from authenticated request
        orderStatus: paymentInfo.status === 'succeeded' ? 'Processing' : 'Payment Pending' // Initial status based on payment
    };

     // Validate product existence and sufficient stock BEFORE creating the order
     // Only check stock if payment succeeded (otherwise stock doesn't matter yet)
     if (orderData.orderStatus === 'Processing') {
         for (const item of orderItems) {
             const product = await Product.findById(item.product);
             if (!product) {
                 return next(new ErrorHandler(`Product with ID ${item.product} not found.`, 404));
             }
             if (product.stock < item.quantity) {
                 return next(new ErrorHandler(`Insufficient stock for product: ${product.name} (Requested: ${item.quantity}, Available: ${product.stock})`, 400));
             }
         }
     }


    // --- Create Order & Update Stock ---
    const order = await Order.create(orderData);

    // Update stock ONLY if payment was successful (status is 'Processing')
    if (order.orderStatus === 'Processing') {
        // Using a loop with await ensures stock updates happen sequentially.
        // For higher performance, consider Promise.all, but error handling/rollback becomes more complex.
         for (const item of order.orderItems) {
             // updateStock now throws an error on failure, which catchAsyncErrors will handle
             await updateStock(item.product, item.quantity, 'subtract');
         }
    }

    res.status(201).json({ // Use 201 for resource creation
        success: true,
        message: 'Order placed successfully!',
        order // Return the created order
    });
});

// Get single order details => /api/v1/order/:id
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email'); // Populate user details

    if (!order) {
        return next(new ErrorHandler(`Order not found with ID: ${req.params.id}`, 404));
    }

    // Authorization check: Ensure the logged-in user owns the order OR is an admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ErrorHandler('Not authorized to view this order', 403)); // 403 Forbidden
    }

    res.status(200).json({
        success: true,
        order
    });
});

// Get logged in user's orders => /api/v1/orders/me
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    // TODO: Add pagination for user orders if the list can get very long
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }); // Sort newest first

    res.status(200).json({
        success: true,
        count: orders.length,
        orders
    });
});

// --- ADMIN ROUTES ---

// Get all orders - ADMIN => /api/v1/admin/orders
exports.allOrders = catchAsyncErrors(async (req, res, next) => {
    // TODO: Add filtering (by status, user, date range) and pagination
    const orders = await Order.find()
                              .populate('user', 'name email') // Populate user details
                              .sort({ createdAt: -1 }); // Sort newest first

    const orderCount = await Order.countDocuments(); // Consider estimatedDocumentCount

    // Calculate total revenue from all orders (optional)
    let totalAmount = 0;
    orders.forEach(order => {
        // Only sum orders that are not 'Cancelled' or 'Failed'? Depends on requirements.
        if (order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Failed') {
            totalAmount += order.totalPrice;
        }
    });

    res.status(200).json({
        success: true,
        count: orderCount,
        totalAmount, // Consider formatting currency if needed
        orders
    });
});

// Update order status - ADMIN => /api/v1/admin/order/:id
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const orderId = req.params.id;
    const { status } = req.body; // Expecting status like 'Shipped', 'Delivered', 'Cancelled'

    const order = await Order.findById(orderId);

    if (!order) {
        return next(new ErrorHandler(`Order not found with ID: ${orderId}`, 404));
    }

    // Validate the new status against the model's enum
    const allowedStatuses = Order.schema.path('orderStatus').enumValues;
    if (!status || !allowedStatuses.includes(status)) {
        return next(new ErrorHandler(`Invalid status provided. Allowed statuses: ${allowedStatuses.join(', ')}`, 400));
    }

    // Prevent updating status of already delivered or cancelled orders? Optional logic.
    if (order.orderStatus === 'Delivered') {
        return next(new ErrorHandler('Cannot update status. Order has already been delivered.', 400));
    }
    if (order.orderStatus === 'Cancelled') {
         return next(new ErrorHandler('Cannot update status. Order has already been cancelled.', 400));
    }

    // --- Stock Management on Status Change (Careful Logic Needed!) ---
    // Stock is typically DECREMENTED when payment succeeds (order status becomes 'Processing').
    // It should only be INCREMENTED (restored) if an order is CANCELLED *after* stock was decremented.
    let stockUpdatePromises = []; // Array to hold potential stock update promises

    if (status === 'Cancelled' && order.orderStatus === 'Processing') { // Or other statuses where stock was decremented
        console.log(`Order ${orderId} changing to Cancelled. Restoring stock.`);
        for (const item of order.orderItems) {
            // Add promises to update stock (add quantity back)
            stockUpdatePromises.push(updateStock(item.product, item.quantity, 'add'));
        }
    }

    // If changing status TO 'Delivered'
    if (status === 'Delivered') {
        order.deliveredAt = Date.now();
        console.log(`Order ${orderId} marked as Delivered.`);
    }

    // --- Update Order Status and Potentially Restore Stock ---
    order.orderStatus = status;

    // If stock needs restoring, execute the updates.
    // If any stock update fails, the error should propagate and the order status won't be saved below.
    if (stockUpdatePromises.length > 0) {
        await Promise.all(stockUpdatePromises); // Wait for all stock updates to complete
    }

    await order.save({ validateBeforeSave: true }); // Save the updated order status and deliveredAt timestamp

    res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        order // Return updated order
    });
});


// Delete order - ADMIN => /api/v1/admin/order/:id
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
        return next(new ErrorHandler(`Order not found with ID: ${orderId}`, 404));
    }

    // --- IMPORTANT: Consider implications of deleting orders ---
    // - Financial records? Generally, orders shouldn't be hard deleted. Mark as 'Cancelled' or 'Archived'.
    // - Stock restoration? If deleting an order that *had* decremented stock (e.g., 'Processing'),
    //   you might need to restore stock here, similar to the 'Cancelled' logic in updateOrder.
    //   This depends heavily on business rules.

    // Example: Restore stock if deleting a 'Processing' order (use with caution)
    /*
    if (order.orderStatus === 'Processing') {
        console.warn(`Deleting 'Processing' order ${orderId}. Attempting to restore stock.`);
        try {
            let stockPromises = order.orderItems.map(item => updateStock(item.product, item.quantity, 'add'));
            await Promise.all(stockPromises);
            console.log(`Stock potentially restored for deleted order ${orderId}.`);
        } catch (stockError) {
             console.error(`Failed to restore stock while deleting order ${orderId}:`, stockError);
             // Decide whether to proceed with deletion or return an error
             // return next(new ErrorHandler(`Failed to restore stock. Order deletion aborted.`, 500));
        }
    }
    */

    // Perform the deletion
    await Order.findByIdAndDelete(orderId);

    res.status(200).json({
        success: true,
        message: 'Order deleted successfully.' // Inform admin, but consider soft delete in real-world apps
    });
});