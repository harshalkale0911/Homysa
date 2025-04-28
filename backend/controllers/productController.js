// backend/controllers/productController.js
const Product = require('../models/Product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('cloudinary').v2;
// Import upload/delete utilities if they handle temp file deletion etc.
const { uploadImage, deleteImage } = require('../utils/upload');

// Note: Cloudinary config should be done once at app startup (e.g., in app.js or config/config.js)
// Ensure config.CLOUDINARY_... variables are set in .env

// Create new product - ADMIN => /api/v1/admin/product/new
exports.newProduct = catchAsyncErrors(async (req, res, next) => {
    // --- Image Handling ---
    // Assumes 'express-fileupload' middleware is used and files are in req.files.images
    // Frontend should send images under the key 'images' (can be single or multiple)

    let uploadedImages = []; // To store Cloudinary results { public_id, url }
    const imageFiles = req.files?.images; // Use optional chaining

    if (!imageFiles) {
        return next(new ErrorHandler('Product images are required', 400));
    }

    // Normalize imageFiles to always be an array
    const filesArray = Array.isArray(imageFiles) ? imageFiles : [imageFiles];

    if (filesArray.length === 0) {
        return next(new ErrorHandler('At least one product image is required', 400));
    }

    try {
        for (const file of filesArray) {
            if (!file.tempFilePath) {
                 console.warn("Skipping file due to missing tempFilePath:", file.name);
                 continue; // Skip if middleware didn't process correctly
            }
            const result = await uploadImage(file.tempFilePath, 'homysa/products'); // Use upload utility
            uploadedImages.push({
                public_id: result.public_id,
                url: result.url // secure_url is usually preferred
            });
        }
    } catch (error) {
        // uploadImage utility should handle temp file cleanup on error
        console.error("Cloudinary Upload Error during product creation:", error);
        // Decide if partial uploads should be deleted or if the error prevents product creation
        // For simplicity, we'll prevent creation on any upload error.
        // Cleanup already uploaded images if an error occurs mid-loop (optional, more complex)
        // for (const img of uploadedImages) { await deleteImage(img.public_id); }
        return next(new ErrorHandler(`Failed to upload images: ${error.message || 'Cloudinary error'}`, 500));
    }

    // Check if any images were successfully uploaded
     if (uploadedImages.length === 0) {
         return next(new ErrorHandler('No images were successfully uploaded.', 400));
     }

    // --- Prepare Product Data ---
    // Assign user ID from authenticated admin user
    req.body.user = req.user._id;
    req.body.images = uploadedImages; // Assign the array of Cloudinary image data

    // Remove uploaded image data if it was accidentally sent in body besides files
    // If using `req.body.images` for base64, handle that logic instead of file uploads.
    // Assuming file uploads, delete req.body.images if it exists.
    // delete req.body.images; // Might cause issues if frontend *only* sends base64

    // Add other required fields validation if not handled by Mongoose schema
    if (!req.body.name || !req.body.price || !req.body.description || !req.body.category || req.body.stock == null) {
        return next(new ErrorHandler('Please provide all required product fields (name, price, description, category, stock)', 400));
    }

    // Create the product
    const product = await Product.create(req.body);

    res.status(201).json({ // 201 Created status
        success: true,
        product
    });
});

// Get all products => /api/v1/products (Public)
exports.getProducts = catchAsyncErrors(async (req, res, next) => {
    // FIX: Removed 'as string' TypeScript syntax
    const resPerPage = parseInt(req.query.limit) || 9; // Products per page, default 9
    const productsCount = await Product.countDocuments(); // Total count before any filtering

    const apiFeatures = new APIFeatures(Product.find(), req.query)
        .search() // Apply keyword search first
        .filter() // Then apply other filters (category, price range)
        .sort(); // Apply sorting

    // Clone the query *before* pagination to count filtered results accurately
    const filteredQuery = apiFeatures.query.clone();
    const filteredProductsCount = await filteredQuery.countDocuments();

    // Apply pagination to the original query object
    apiFeatures.pagination(resPerPage);

    // Execute the final query with pagination
    const products = await apiFeatures.query;
    // .populate('reviews.user', 'name'); // Optional: populate user name in reviews if needed

    const totalPages = Math.ceil(filteredProductsCount / resPerPage);

    res.status(200).json({
        success: true,
        count: productsCount, // Total products in DB
        filteredCount: filteredProductsCount, // Products matching filters
        productsPerPage: resPerPage,
        totalPages: totalPages,
        currentPage: Number(req.query.page) || 1,
        products // Products for the current page
    });
});

// Get single product details => /api/v1/product/:id (Public)
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
                           .populate('reviews.user', 'name email avatar'); // Populate review user details including avatar

    if (!product) {
        return next(new ErrorHandler(`Product not found with ID: ${req.params.id}`, 404));
    }

    // --- Optional: Fetch Related Products ---
    // Example: Fetch 3 products from the same category, excluding the current one
    const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id } // Exclude current product
    })
    .limit(4) // Fetch 4 related products
    .select('name price images category _id'); // Select only needed fields

    // Attach related products to the response by converting to object first
    const productData = product.toObject(); // Convert Mongoose doc to plain object
    productData.relatedProducts = relatedProducts; // Attach related products
    // --- End Related Products ---


    res.status(200).json({
        success: true,
        product: productData // Send modified product data
    });
});

// Update product - ADMIN => /api/v1/admin/product/:id
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler(`Product not found with ID: ${req.params.id}`, 404));
    }

    // --- Handle Image Updates ---
    // Check if new images are provided via file upload (req.files.images)
    let uploadedImages = [];
    const imageFiles = req.files?.images;

    if (imageFiles) {
        const filesArray = Array.isArray(imageFiles) ? imageFiles : [imageFiles];

        if (filesArray.length > 0) {
             console.log(`Updating images for product ${product._id}`);
            // 1. Delete existing images from Cloudinary
            // Ensure product.images exists and is an array
            const deletePromises = (product.images || []).map(img => deleteImage(img.public_id));
            try {
                 await Promise.all(deletePromises);
                 console.log(`Deleted old images for product ${product._id}`);
            } catch (deleteError) {
                 console.error(`Failed to delete one or more old images for product ${product._id}:`, deleteError);
                 // Log error but continue update? Or stop? Consider implications.
                 // return next(new ErrorHandler('Failed to clean up old images during update', 500));
            }

            // 2. Upload new images
             try {
                 for (const file of filesArray) {
                      if (!file.tempFilePath) continue;
                     const result = await uploadImage(file.tempFilePath, 'homysa/products');
                     uploadedImages.push({
                         public_id: result.public_id,
                         url: result.url
                     });
                 }
                  // Assign the new images array to the request body *only if* upload succeeded
                  if (uploadedImages.length > 0) {
                      req.body.images = uploadedImages;
                  } else {
                       console.warn(`Image files provided for update, but none uploaded successfully for product ${product._id}.`);
                       // Keep existing images if new upload failed or resulted in empty array
                       delete req.body.images;
                  }

             } catch (uploadError) {
                 console.error("Cloudinary Upload Error during product update:", uploadError);
                 return next(new ErrorHandler(`Failed to upload new images: ${uploadError.message || 'Cloudinary error'}`, 500));
             }
        } else {
             // If req.files.images exists but is empty array, don't change existing images
             delete req.body.images;
        }
    } else {
         // If no 'images' key in req.files, ensure req.body.images (if sent e.g. as base64) doesn't accidentally overwrite
         // If you exclusively use file uploads, you can safely delete req.body.images here.
         // If you might receive base64 URLs, handle that logic separately.
         delete req.body.images; // Assuming file uploads are primary method
    }

    // --- Update Product Data ---
     // Ensure sensitive/calculated fields aren't accidentally changed
     delete req.body.user;
     delete req.body.ratings;
     delete req.body.numOfReviews;
     delete req.body.reviews; // Reviews are updated via separate endpoint

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // Return the updated document
        runValidators: true, // Run schema validations
        context: 'query' // Recommended for update validators
    });

    res.status(200).json({
        success: true,
        message: "Product updated successfully", // Added success message
        product
    });
});


// Delete product - ADMIN => /api/v1/admin/product/:id
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler(`Product not found with ID: ${req.params.id}`, 404));
    }

    // --- Delete Images from Cloudinary ---
    if (product.images && product.images.length > 0) {
         console.log(`Deleting images for product ${product._id}`);
         const deletePromises = product.images.map(img => deleteImage(img.public_id));
        try {
            await Promise.all(deletePromises);
             console.log(`Successfully deleted Cloudinary images for product ${product._id}`);
        } catch(error) {
             console.error(`Failed to delete one or more Cloudinary images for product ${product._id}:`, error);
             // Log error but continue deletion of the product itself from DB
        }
    }

    // --- Delete Product from Database ---
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: `Product '${product.name}' deleted successfully.`
    });
});

// --- Product Reviews ---

// Create/Update product review => /api/v1/review (Authenticated User)
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    const userId = req.user._id; // User ID from authenticated request

    // Validate inputs
    if (rating == null || !productId) { // Check for null/undefined rating
         return next(new ErrorHandler('Rating and Product ID are required', 400));
    }
    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
         return next(new ErrorHandler('Rating must be a number between 1 and 5', 400));
    }

    // Prepare the review object
    const review = {
        user: userId,
        // name: req.user.name, // Name comes from populate('reviews.user', 'name') when fetching
        rating: numericRating,
        comment: comment?.trim() || '', // Trim comment, default to empty string
        createdAt: Date.now() // Explicitly set timestamp
    };

    const product = await Product.findById(productId);

    if (!product) {
         return next(new ErrorHandler(`Product not found with ID: ${productId}`, 404));
    }

    // Check if the user has already reviewed this product
    const existingReviewIndex = product.reviews.findIndex(
        r => r.user.toString() === userId.toString()
    );

    if (existingReviewIndex > -1) {
        // Update existing review
        product.reviews[existingReviewIndex].rating = numericRating;
        product.reviews[existingReviewIndex].comment = review.comment; // Use prepared comment
        product.reviews[existingReviewIndex].createdAt = review.createdAt; // Update timestamp
        console.log(`Updating review for product ${productId} by user ${userId}`);
    } else {
        // Add new review
        product.reviews.push(review);
        console.log(`Adding new review for product ${productId} by user ${userId}`);
    }

    // Recalculate average rating and number of reviews
    product.numOfReviews = product.reviews.length;
    if (product.numOfReviews > 0) {
         product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.numOfReviews;
     } else {
         product.ratings = 0;
     }

    // Save the product with updated review data
    await product.save({ validateBeforeSave: false }); // Skip full validation if only updating reviews/ratings

    res.status(200).json({
        success: true,
        message: 'Review submitted successfully.'
        // Optionally return the updated product or reviews array
    });
});

// Get all reviews for a product => /api/v1/reviews?productId=<productId> (Public)
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const productId = req.query.productId;
    if (!productId) {
         return next(new ErrorHandler('Product ID query parameter is required', 400));
    }

    // Find product and populate user details in reviews
    // Only select necessary user fields
    const product = await Product.findById(productId)
        .populate({
            path: 'reviews.user',
            select: 'name avatar' // Select name and avatar URL
        })
        .select('reviews'); // Select only the reviews field from the product

    if (!product) {
         return next(new ErrorHandler(`Product not found with ID: ${productId}`, 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews // Return only the reviews array
    });
});

// Delete review => /api/v1/reviews?productId=<productId>&id=<reviewId> (Admin or Review Owner)
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const { productId, id: reviewId } = req.query; // Get productId and reviewId (aliased as 'id')

    if (!productId || !reviewId) {
         return next(new ErrorHandler('Product ID and Review ID query parameters are required', 400));
    }

    const product = await Product.findById(productId);

    if (!product) {
        return next(new ErrorHandler(`Product not found with ID: ${productId}`, 404));
    }

    // Find the specific review to check ownership and get its details
     const reviewToDeleteIndex = product.reviews.findIndex(
         review => review._id.toString() === reviewId.toString()
     );

    if (reviewToDeleteIndex === -1) {
         return next(new ErrorHandler(`Review not found with ID: ${reviewId} for this product`, 404));
    }

     const reviewToDelete = product.reviews[reviewToDeleteIndex];

    // --- Authorization Check ---
    // Allow deletion if the logged-in user is the owner OR if the user is an admin
     if (reviewToDelete.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
         return next(new ErrorHandler('Not authorized to delete this review', 403));
     }
     console.log(`User ${req.user._id} (Role: ${req.user.role}) deleting review ${reviewId} owned by ${reviewToDelete.user}`);


    // Remove the review from the array
    product.reviews.splice(reviewToDeleteIndex, 1);

    // Recalculate number of reviews and average rating
    product.numOfReviews = product.reviews.length;
    if (product.numOfReviews > 0) {
        product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.numOfReviews;
    } else {
        product.ratings = 0;
    }

    // Update the product using save to ensure recalculations are persisted
    await product.save({ validateBeforeSave: false }); // Skip full validation

    res.status(200).json({
        success: true,
        message: 'Review deleted successfully.'
    });
});