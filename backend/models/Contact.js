// backend/models/contact.js
const mongoose = require('mongoose');
const validator = require('validator');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        trim: true,
        maxLength: [100, 'Name cannot exceed 100 characters'] // Increased length slightly
    },
    email: {
        type: String,
        required: [true, 'Please enter your email address'],
        lowercase: true, // Store emails consistently
        trim: true,
        validate: [validator.isEmail, 'Please provide a valid email address']
    },
    phone: { // Consider adding validation if format is important
        type: String,
        trim: true
        // Example validation (allows optional country code, spaces, hyphens)
        // validate: {
        //     validator: function(v) {
        //         // Basic check, allows digits, spaces, hyphens, optional starting +
        //         return v == null || v.trim() === '' || /^\+?[\d\s-]{10,15}$/.test(v);
        //     },
        //     message: props => `${props.value} is not a valid phone number format!`
        // }
    },
    subject: {
        type: String,
        required: [true, 'Please select a subject'],
        trim: true,
        enum: { // Define allowed subjects clearly
            values: [
                'General Inquiry',
                'Product Information',
                'Custom Order',
                'Support',
                'Collaboration',
                'Feedback',
                'Customer Support', // Added Feedback option
                'Other', // Added Other option

            ],
            // Use a more specific error message
            message: 'Invalid subject selected. Please choose from the dropdown list.'
        }
    },
    message: {
        type: String,
        required: [true, 'Please enter your message'],
        trim: true,
        maxLength: [2000, 'Message cannot exceed 2000 characters'] // Limit message length
    },
    status: {
        type: String,
        enum: [ // Define possible statuses for admin management
            'New',
            'In Progress',
            'Resolved',
            'Closed'
        ],
        default: 'New',
        index: true // Indexing status for efficient admin filtering
    },
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: { // Track when the status was last updated
        type: Date
    }
});

// Middleware to automatically set 'updatedAt' on status change or any modification
contactSchema.pre('save', function(next) {
  if (this.isModified()) { // Check if any field was modified (including status)
    this.updatedAt = Date.now();
  }
  next();
});

// Add index on email for quicker lookups if needed
contactSchema.index({ email: 1 });

module.exports = mongoose.model('Contact', contactSchema);