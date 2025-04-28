// backend/models/CustomOrder.js (EXTREMELY Simplified Version)
const mongoose = require('mongoose');
console.log(">>> LOADING EXTREMELY SIMPLIFIED CustomOrder MODEL <<<"); // Log entry

const customOrderSchema = new mongoose.Schema({
    // Only one required field for minimal validation
    name: {
        type: String,
        required: true,
        trim: true
    },
    // Add a simple subdocument to test _id: true if needed
    // simpleNote: [{
    //     text: String,
    //     _id: true // Lowercase boolean
    // }]
}, {
    timestamps: true // Lowercase boolean
});

console.log(">>> EXTREMELY SIMPLIFIED CustomOrder SCHEMA CREATED <<<"); // Log success

module.exports = mongoose.model('CustomOrder', customOrderSchema);