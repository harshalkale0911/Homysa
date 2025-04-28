// backend/utils/upload.js
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const config = require('../config/config'); // Import config
const ErrorHandler = require('./errorHandler');

// --- Cloudinary Configuration Check ---
// It's best practice to configure Cloudinary once when the app starts.
// This check ensures the necessary config variables are present.
if (!config.CLOUDINARY_CLOUD_NAME || !config.CLOUDINARY_API_KEY || !config.CLOUDINARY_API_SECRET) {
    console.error("FATAL ERROR: Cloudinary configuration (CLOUD_NAME, API_KEY, API_SECRET) missing in environment variables.");
    // Depending on your app's dependency on Cloudinary, you might exit here
    // process.exit(1);
} else {
    // Configure Cloudinary globally - this can also be done in app.js or config/config.js
    cloudinary.config({
        cloud_name: config.CLOUDINARY_CLOUD_NAME,
        api_key: config.CLOUDINARY_API_KEY,
        api_secret: config.CLOUDINARY_API_SECRET,
        secure: true // Always use HTTPS URLs for Cloudinary assets
    });
    console.log("Cloudinary configured successfully."); // Confirmation log
}


/**
 * Uploads a file (image, video, raw) from a temporary path to Cloudinary.
 * Handles temporary file deletion after upload (success or failure).
 * Assumes 'express-fileupload' middleware provides `filePath`.
 *
 * @param {string} filePath - The temporary file path (e.g., req.files.someFile.tempFilePath).
 * @param {string} [folder='homysa/default'] - The Cloudinary folder to upload into.
 * @returns {Promise<{public_id: string, url: string}>} - Object containing public_id and secure_url.
 * @throws {ErrorHandler} - Throws error on invalid path or upload failure.
 */
exports.uploadImage = async (filePath, folder = 'homysa/default') => {
    if (!filePath) {
        console.error("Upload attempt failed: No file path provided.");
        throw new ErrorHandler('No file path provided for upload.', 400);
    }

    let result; // To store Cloudinary result

    try {
        console.log(`Uploading file from path: ${filePath} to Cloudinary folder: ${folder}`);

        // Perform the upload to Cloudinary
        result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: "auto", // Automatically detect resource type (image, video, raw)
            // Optional: Add transformations, tags, etc.
            // transformation: [{ width: 1200, height: 1200, crop: "limit" }],
            // tags: "product, homysa",
        });

        console.log(`Cloudinary upload successful for ${filePath}. Public ID: ${result.public_id}`);

        // Return the essential data
        return {
            public_id: result.public_id,
            url: result.secure_url // Use the secure HTTPS URL
        };

    } catch (error) {
        console.error(`Cloudinary upload failed for path ${filePath}:`, error);
        // Throw a specific error indicating upload failure
        throw new ErrorHandler(`Image upload failed: ${error.message || 'Cloudinary error'}`, 500);

    } finally {
        // --- Temporary File Cleanup ---
        // Always attempt to delete the temporary file, regardless of upload success/failure
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Deleted temporary file: ${filePath}`);
            } else {
                 console.warn(`Temporary file not found for deletion (might have been already removed): ${filePath}`);
            }
        } catch (unlinkError) {
             // Log error during cleanup but don't throw, as the primary operation (upload/failure) is more important
             console.error(`Error deleting temporary file ${filePath}:`, unlinkError);
        }
    }
};

/**
 * Deletes an asset (image, video, etc.) from Cloudinary using its public ID.
 *
 * @param {string} publicId - The public ID of the asset to delete.
 * @returns {Promise<void>}
 * @throws {ErrorHandler} - Can optionally throw on failure if deletion is critical.
 */
exports.deleteImage = async (publicId) => {
     if (!publicId) {
        console.warn("Attempted to delete image with null or undefined publicId.");
        // Return early or throw depending on how critical deletion is
        // throw new ErrorHandler("Cannot delete image: public ID is missing.", 400);
        return;
    }

    try {
        console.log(`Attempting to delete asset from Cloudinary: ${publicId}`);

        // Use 'destroy' to delete the asset.
        // Optional: Add { invalidate: true } to try and invalidate CDN cache,
        // but 'destroy' usually handles this.
        const result = await cloudinary.uploader.destroy(publicId);

        // Log the result from Cloudinary (can be 'ok', 'not found', or potentially an error string)
        console.log(`Cloudinary deletion result for ${publicId}:`, result?.result);

        // Check if deletion was explicitly not 'ok' (and not 'not found', which is acceptable)
        if (result?.result && result.result !== 'ok' && result.result !== 'not found') {
             console.warn(`Cloudinary deletion for ${publicId} may not have been fully successful: Result - ${result.result}`);
             // Optionally throw an error if a non-'ok'/'not found' result is critical
             // throw new ErrorHandler(`Cloudinary deletion failed for ${publicId}. Result: ${result.result}`, 500);
        }

    } catch (error) {
        console.error(`Failed to delete asset ${publicId} from Cloudinary:`, error);
        // Decide whether to throw or just log. Throwing might interrupt processes like user deletion.
        // throw new ErrorHandler(`Failed to delete image from cloud: ${error.message}`, 500);
    }
};