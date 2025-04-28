// backend/models/Product.js
const mongoose = require('mongoose');

// Define review sub-schema separately for clarity
const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // Name is already stored on the User ref, no need to duplicate here unless you want snapshot
    // name: { type: String, required: true },
    rating: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: {
        type: String,
        required: false, // Comment might be optional
        trim: true,
        maxLength: [500, 'Review comment cannot exceed 500 characters']
    },
    createdAt: { // Add timestamp for review creation
         type: Date,
         default: Date.now
    }
}, {
     _id: true, // Ensure reviews get their own _id (default is true anyway)
     // timestamps: { createdAt: true, updatedAt: false } // Could add timestamps to reviews too
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [200, 'Product name cannot exceed 200 characters'], // Increased length
        index: true // Index name for searching
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        min: [0, 'Price cannot be negative'],
        default: 0.0
    },
    description: {
        type: String,
        required: [true, 'Please enter product description'],
        trim: true,
        maxLength: [4000, 'Description cannot exceed 4000 characters'] // Increased length
    },
    ratings: { // Average rating - calculated field
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        // Use a setter to round the rating to one decimal place
        set: val => Math.round(val * 10) / 10
    },
    images: [ // Array of images from Cloudinary
        {
            public_id: { // Cloudinary public ID
                type: String,
                required: true
            },
            url: { // Cloudinary secure URL
                type: String,
                required: true
            },
             _id: false // Don't need separate _id for each image object within the array
        }
    ],
    category: {
        type: String,
        required: [true, 'Please select a category for this product'],
        trim: true,
        enum: {
            // Ensure these values are consistent across frontend/backend
            values: [
                'Tables', 'Chairs', 'Storage', 'Sets', 'Beds',
                'Decor', 'Outdoor', 'Office', 'Other'
            ],
            message: 'Please select a valid category for the product: {VALUE}'
        },
        index: true // Index category for filtering
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock quantity'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0,
        min: 0
    },
    reviews: [reviewSchema], // Embed the review sub-schema
    user: { // User who created/owns this product listing (usually admin)
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true // Ensure we know who created the product
    },
    // Optional detailed fields
    dimensions: { // e.g., "L: 180cm, W: 90cm, H: 75cm"
        type: String,
        trim: true,
        maxLength: [200, 'Dimensions description too long']
    },
    material: { // e.g., "Solid Teak Wood, Metal Legs"
        type: String,
        trim: true,
        maxLength: [200, 'Material description too long']
    },
    colors: [{ // Array of available color names/codes
        type: String,
        trim: true,
        lowercase: true // Store colors consistently
    }],
    weight: { // In kg, for shipping calculations?
        type: Number,
        min: 0
    },
    isFeatured: { // For featured products section on homepage
        type: Boolean,
        default: false,
        index: true
    },
    tags: [{ // For searching/filtering based on keywords
        type: String,
        lowercase: true,
        trim: true
    }],
    // Timestamps handled by option below
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date }
}, { timestamps: true }); // Automatically add createdAt and updatedAt

// --- Middleware ---
// No specific pre-save needed here unless calculating something complex

// --- Indexes ---
// Add text index for searching multiple fields (if using MongoDB text search)
// productSchema.index({ name: 'text', description: 'text', category: 'text', tags: 'text' });
// Ensure only ONE text index exists per collection if you use it.

// Index price for sorting/filtering by price range
productSchema.index({ price: 1 });
// Index average rating for sorting
productSchema.index({ ratings: -1 });

module.exports = mongoose.model('Product', productSchema);