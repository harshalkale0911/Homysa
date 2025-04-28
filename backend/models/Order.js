// backend/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    shippingInfo: {
        // Consider adding recipient name if different from user
        // name: { type: String, required: [true, 'Recipient name is required'] }
        address: { type: String, required: [true, 'Shipping address is required'], trim: true, maxLength: 200 },
        city: { type: String, required: [true, 'Shipping city is required'], trim: true, maxLength: 50 },
        state: { type: String, required: [true, 'Shipping state is required'], trim: true, maxLength: 50 },
        country: { type: String, required: [true, 'Shipping country is required'], trim: true, maxLength: 50 },
        pinCode: { type: String, required: [true, 'Shipping pin code is required'], trim: true, maxLength: 10 },
        phoneNo: { type: String, required: [true, 'Shipping phone number is required'], trim: true, maxLength: 15 }
    },
    orderItems: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },
            price: { type: Number, required: true }, // Price *at the time of order*
            image: { type: String, required: true }, // URL of the product image
            product: { // Reference to the actual product
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true
            },
             _id: false // No need for subdocument ID here
        }
    ],
    user: { // User who placed the order
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        index: true // Index user for faster 'myOrders' queries
    },
    paymentInfo: {
        id: { type: String, required: true }, // Payment gateway transaction ID (e.g., Stripe PaymentIntent ID)
        status: { type: String, required: true }, // e.g., 'succeeded', 'pending', 'failed'
        method: { type: String } // Optional: 'card', 'upi', etc.
    },
    paidAt: { // Timestamp when payment was successful
        type: Date
        // Should be set when paymentInfo.status becomes 'succeeded'
    },
    itemsPrice: { // Subtotal of items
        type: Number,
        required: true,
        default: 0.0,
         min: 0
    },
    taxPrice: { // Calculated tax amount
        type: Number,
        required: true,
        default: 0.0,
         min: 0
    },
    shippingPrice: { // Cost of shipping
        type: Number,
        required: true,
        default: 0.0,
         min: 0
    },
    totalPrice: { // Grand total (items + tax + shipping)
        type: Number,
        required: true,
        default: 0.0,
         min: 0
    },
    orderStatus: {
        type: String,
        required: true,
        enum: [ // Define allowed order statuses clearly
            'Payment Pending', // Initial state before payment confirmation
            'Processing',      // Payment received, order being prepared
            'Shipped',
            'Delivered',
            'Cancelled',       // Order cancelled by user or admin
            'Failed'           // Payment failed or other processing failure
        ],
        default: 'Payment Pending',
        index: true // Useful for filtering orders by status
    },
    deliveredAt: { // Timestamp when order was marked as delivered
        type: Date
    },
    // Timestamps handled by Mongoose option below
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date }
}, { timestamps: true }); // Automatically add createdAt and updatedAt

// Ensure correct calculation of total price if done on backend
// orderSchema.pre('save', function(next) {
//     if (this.isModified('itemsPrice') || this.isModified('taxPrice') || this.isModified('shippingPrice')) {
//         this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;
//     }
//     next();
// });

orderSchema.index({ createdAt: -1 }); // Index for sorting by creation date

module.exports = mongoose.model('Order', orderSchema);