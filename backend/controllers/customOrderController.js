// backend/controllers/customOrderController.js
const CustomOrder = require('../models/CustomOrder');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const { uploadImage } = require('../utils/upload'); // Import upload utility
const sendEmail = require('../utils/emailService'); // Import email utility
const config = require('../config/config'); // For ADMIN_EMAIL etc.

// --- Create New Custom Order Request ---
exports.createCustomOrder = catchAsyncErrors(async (req, res, next) => {
    console.log("[CUSTOM_ORDER] Received submission.");
    // console.log("Body:", req.body); // Log body for debugging (careful with large data)
    // console.log("Files:", req.files); // Log files for debugging

    const { name, email, phone, category, description, budget, dimensions, woodType, timeframe } = req.body;

    // --- Basic Server-Side Validation ---
    // Mongoose validation will also run on save
    if (!name || !email || !phone || !category || !description) {
        console.warn("[CUSTOM_ORDER] Failed: Missing required fields.");
        return next(new ErrorHandler('Please provide all required fields: name, email, phone, category, description.', 400));
    }
    // Add more specific validation if needed (e.g., email format - though model handles it)

    // --- Handle File Uploads (Reference Images) ---
    let uploadedImages = []; // Array to store { public_id, url }
    if (req.files && req.files.referenceImages) {
        console.log("[CUSTOM_ORDER] Processing reference images...");
        // Ensure referenceImages is always an array
        const filesArray = Array.isArray(req.files.referenceImages)
            ? req.files.referenceImages
            : [req.files.referenceImages];

         // Limit number of files server-side as well (e.g., max 5)
         if (filesArray.length > 5) {
             console.warn("[CUSTOM_ORDER] Failed: Too many reference images uploaded.");
             return next(new ErrorHandler('You can upload a maximum of 5 reference images.', 400));
         }

         try {
            for (const file of filesArray) {
                 // Basic checks on the file object from express-fileupload
                 if (!file || !file.tempFilePath || !file.mimetype || file.size === 0) {
                     console.warn("[CUSTOM_ORDER] Skipping invalid file:", file ? file.name : 'undefined file');
                     continue;
                 }
                 // Optional: Add stricter size/type checks if needed here

                 console.log(`[CUSTOM_ORDER] Uploading image: ${file.name}`);
                 const result = await uploadImage(file.tempFilePath, 'homysa/custom_orders'); // Use upload utility
                 uploadedImages.push({ public_id: result.public_id, url: result.url });
                 console.log(`[CUSTOM_ORDER] Image uploaded successfully: ${result.public_id}`);
            }
         } catch (error) {
             console.error("[CUSTOM_ORDER] ERROR during reference image upload:", error);
             // Note: uploadImage utility should handle temp file cleanup
             return next(new ErrorHandler(`Failed to upload reference images: ${error.message || 'Upload error'}`, 500));
         }
         console.log(`[CUSTOM_ORDER] ${uploadedImages.length} images processed.`);
    } else {
        console.log("[CUSTOM_ORDER] No reference images provided.");
    }

    // --- Prepare Data for DB ---
    const orderData = {
        name, email, phone, category, description, budget, dimensions, woodType, timeframe,
        referenceImages: uploadedImages,
        // Optional: Link to logged-in user if your setup supports it
        // user: req.user?._id // Only if using authentication middleware for this route
    };

    // --- Create Document in Database ---
    console.log("[CUSTOM_ORDER] Creating database entry...");
    const customOrder = await CustomOrder.create(orderData);
    console.log(`[CUSTOM_ORDER] Custom order saved with ID: ${customOrder._id}`);

    // --- Send Notification Emails (Optional - Fire and Forget) ---
    // 1. To Admin
    const adminEmail = config.ADMIN_EMAIL || config.SMTP_EMAIL;
    if (adminEmail) {
        console.log(`[CUSTOM_ORDER] Attempting to send admin notification to: ${adminEmail}`);
        sendEmail({
            email: adminEmail,
            subject: `[Homysa Custom Order] New Request Received - ${category}`,
            html: `<h2>New Custom Order Request</h2>
                   <p><strong>Name:</strong> ${name}</p>
                   <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                   <p><strong>Phone:</strong> ${phone}</p>
                   <hr>
                   <p><strong>Category:</strong> ${category}</p>
                   <p><strong>Description:</strong></p><p style="white-space: pre-wrap;">${description}</p>
                   <p><strong>Dimensions:</strong> ${dimensions || 'N/A'}</p>
                   <p><strong>Budget:</strong> ${budget || 'N/A'}</p>
                   <p><strong>Wood Type:</strong> ${woodType || 'N/A'}</p>
                   <p><strong>Timeframe:</strong> ${timeframe || 'N/A'}</p>
                   <p><strong>Reference Images:</strong> ${uploadedImages.length} uploaded</p>
                   <p><em>Order ID: ${customOrder._id}</em></p>`
                   // Add links to images if needed: uploadedImages.map(img => `<a href="${img.url}">Image</a>`).join('<br>')
        }).catch(err => console.error("[CUSTOM_ORDER] ERROR sending admin notification:", err)); // Log errors but don't block response
    } else {
        console.warn("[CUSTOM_ORDER] Admin email not configured, skipping notification.");
    }

    // 2. To User
    console.log(`[CUSTOM_ORDER] Attempting to send user confirmation to: ${email}`);
    sendEmail({
        email: email,
        subject: `Your Homysa Custom Order Request (#${customOrder._id.toString().slice(-6)})`,
        html: `<div style="font-family: sans-serif; line-height: 1.6;">
                   <h2>Thank you for your custom order request, ${name}!</h2>
                   <p>We've received your request for a custom <strong>${category}</strong> piece.</p>
                   <p>Your Request ID is: <strong>${customOrder._id}</strong></p>
                   <p>Our design team will review your details and contact you shortly (usually within 1-2 business days) to discuss the next steps.</p>
                   <p><strong>Summary of your request:</strong></p>
                   <ul style="list-style: none; padding-left: 0;">
                       <li><strong>Description:</strong> ${description.substring(0, 100)}...</li>
                       ${dimensions ? `<li><strong>Dimensions:</strong> ${dimensions}</li>` : ''}
                       ${budget ? `<li><strong>Budget:</strong> ${budget}</li>` : ''}
                       ${woodType ? `<li><strong>Wood Type:</strong> ${woodType}</li>` : ''}
                       ${timeframe ? `<li><strong>Timeframe:</strong> ${timeframe}</li>` : ''}
                       <li><strong>Reference Images:</strong> ${uploadedImages.length} uploaded</li>
                   </ul>
                   <p>If you have any immediate questions, feel free to contact us.</p>
                   <p>Best regards,<br/>The Homysa Team</p>
               </div>`
    }).catch(err => console.error(`[CUSTOM_ORDER] ERROR sending user confirmation to ${email}:`, err)); // Log errors

    // --- Send Success Response to Frontend ---
    res.status(201).json({ // 201 Created status
        success: true,
        message: "Custom order request submitted successfully! We will contact you soon.",
        customOrder: { // Send back minimal confirmation data
            _id: customOrder._id,
            email: customOrder.email
        }
    });
});

// --- Placeholders for Other Admin Functions ---
exports.getMyCustomOrders = catchAsyncErrors(async (req, res, next) => {
    console.warn("[CUSTOM_ORDER] Get My Custom Orders not implemented yet.");
    return next(new ErrorHandler('Functionality not implemented yet.', 501));
});
exports.getAllCustomOrders = catchAsyncErrors(async (req, res, next) => {
    console.warn("[CUSTOM_ORDER] Get All Custom Orders not implemented yet.");
    return next(new ErrorHandler('Functionality not implemented yet.', 501));
});
exports.getSingleCustomOrder = catchAsyncErrors(async (req, res, next) => {
    console.warn("[CUSTOM_ORDER] Get Single Custom Order not implemented yet.");
    return next(new ErrorHandler('Functionality not implemented yet.', 501));
});
exports.updateCustomOrderStatus = catchAsyncErrors(async (req, res, next) => {
    console.warn("[CUSTOM_ORDER] Update Custom Order Status not implemented yet.");
    return next(new ErrorHandler('Functionality not implemented yet.', 501));
});
exports.deleteCustomOrder = catchAsyncErrors(async (req, res, next) => {
    console.warn("[CUSTOM_ORDER] Delete Custom Order not implemented yet.");
    return next(new ErrorHandler('Functionality not implemented yet.', 501));
});
exports.addCustomOrderNote = catchAsyncErrors(async (req, res, next) => {
    console.warn("[CUSTOM_ORDER] Add Custom Order Note not implemented yet.");
    return next(new ErrorHandler('Functionality not implemented yet.', 501));
});