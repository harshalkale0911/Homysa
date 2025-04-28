// backend/controllers/userController.js
const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
// const { deleteImage } = require('../utils/upload'); // Uncomment if handling avatar deletion

// Get all users - ADMIN => /api/v1/admin/users
exports.allUsers = catchAsyncErrors(async (req, res, next) => {
    // TODO: Implement pagination for large user lists
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10
    const skip = (page - 1) * limit;

    const users = await User.find().limit(limit).skip(skip);
    const userCount = await User.countDocuments();

    res.status(200).json({
        success: true,
        count: userCount,
        totalPages: Math.ceil(userCount / limit),
        currentPage: page,
        users
    });
});

// Get user details - ADMIN => /api/v1/admin/user/:id
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User not found with ID: ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        user
    });
});

// Update user role/details - ADMIN => /api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    const userId = req.params.id;
    const { name, email, role } = req.body;

    // Prepare update data - only include fields that are actually sent
    // FIX: Removed TypeScript type annotation
    const newUserData = {};
    // Optional: Use JSDoc for type hinting in JS
    /** @type {{ name?: string; email?: string; role?: 'user' | 'admin' }} */

    if (name) newUserData.name = name;

    if (email) {
        // Check if the email is being changed and if the new email is already taken
         const currentUser = await User.findById(userId).select('+email'); // Get current email
         if (!currentUser) return next(new ErrorHandler(`User not found with ID: ${userId}`, 404));

        if (email.toLowerCase() !== currentUser.email.toLowerCase()) {
             const emailExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
             if (emailExists) {
                 return next(new ErrorHandler(`Email address '${email}' is already associated with another account.`, 400));
             }
             newUserData.email = email.toLowerCase();
        }
    }

    if (role) {
         // Validate role against allowed values in the schema
         const allowedRoles = User.schema.path('role').enumValues;
         if (!allowedRoles.includes(role)) {
             return next(new ErrorHandler(`Invalid role specified. Allowed roles: ${allowedRoles.join(', ')}`, 400));
         }
         // Prevent admin from demoting themselves? Optional check
         if (req.user._id.toString() === userId && req.user.role === 'admin' && role !== 'admin') {
            return next(new ErrorHandler('Admins cannot change their own role.', 400));
         }
         newUserData.role = role;
    }

    // Prevent empty updates
    if (Object.keys(newUserData).length === 0) {
        return next(new ErrorHandler('No update data provided (name, email, or role)', 400));
    }

    const updatedUser = await User.findByIdAndUpdate(userId, newUserData, {
        new: true, // Return the updated document
        runValidators: true, // Run schema validations
        context: 'query' // Necessary for some update validators
    });

     // Check if update was successful (findByIdAndUpdate returns null if not found)
     if (!updatedUser) {
        return next(new ErrorHandler(`User not found with ID: ${userId}`, 404)); // Should have been caught earlier, but good practice
    }

    res.status(200).json({
        success: true,
        message: 'User updated successfully.',
        user: updatedUser // Return updated user
    });
});

// Delete user - ADMIN => /api/v1/admin/user/:id
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === userId) {
        return next(new ErrorHandler('You cannot delete your own administrator account.', 400));
    }

    const user = await User.findById(userId);

    if (!user) {
        return next(new ErrorHandler(`User not found with ID: ${userId}`, 404));
    }

    // --- Avatar Deletion Logic (Uncomment and adapt if using Cloudinary) ---
    /*
    const image_id = user.avatar?.public_id; // Optional chaining
    // Check against your specific default avatar identifier (URL path segment or public_id)
    // Example: Check if the URL includes a known default path or ID
    const isDefaultAvatar = user.avatar?.url?.includes('/default_avatar');

    if (image_id && !isDefaultAvatar) { // Check if it's not the default
        try {
             await deleteImage(image_id); // Use the utility function
             console.log(`Deleted Cloudinary avatar for user ${user._id}: ${image_id}`);
        } catch (error) {
             console.error(`Failed to delete Cloudinary avatar ${image_id} for user ${user._id}:`, error);
             // Log error, but proceed with user deletion from DB
        }
    }
    */
    // --- End Avatar Deletion ---

    // Delete the user from the database
    await User.findByIdAndDelete(userId);

    res.status(200).json({
        success: true,
        message: `User '${user.name}' deleted successfully.`
    });
});