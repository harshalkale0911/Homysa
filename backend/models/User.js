// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');
const config = require('../config/config');

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Name required'], maxLength: [100, 'Name too long'], trim: true },
    email: { type: String, required: [true, 'Email required'], unique: true, lowercase: true, trim: true, validate: [validator.isEmail, 'Valid email required'] },
    password: { type: String, required: [true, 'Password required'], minlength: [6, 'Password too short'], select: false },
    avatar: { public_id: { type: String }, url: { type: String, default: 'https://res.cloudinary.com/demo/image/upload/w_150,h_150,c_fill,g_face,r_max/default_avatar.png' }, _id: false },
    role: { type: String, enum: { values: ['user', 'admin'], message: 'Invalid role: {VALUE}' }, default: 'user' },
    // --- Password Reset Fields ---
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Generate JWT
userSchema.methods.getJwtToken = function () {
    if (!config.JWT_SECRET || !config.JWT_EXPIRE) { console.error("FATAL: JWT_SECRET or JWT_EXPIRE not configured!"); return null; }
    return jwt.sign({ id: this._id }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRE });
};

// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Password Reset Token (Method MUST exist)
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    console.log(`[User Model] Generated reset token (unhashed): ${resetToken} for user ${this._id}`); // Log for debug
    return resetToken; // Return UNHASHED token
};

module.exports = mongoose.model('User', userSchema);