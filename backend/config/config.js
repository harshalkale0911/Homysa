// backend/config/config.js
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') }); // Ensure .env path is correct

module.exports = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
    COOKIE_EXPIRES_TIME: process.env.COOKIE_EXPIRES_TIME || 30, // Days

    // SMTP Configuration
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_EMAIL: process.env.SMTP_EMAIL,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    FROM_EMAIL: process.env.FROM_EMAIL || `noreply@${process.env.DOMAIN || 'homysa.com'}`,
    FROM_NAME: process.env.FROM_NAME || 'Homysa Furniture',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL, // Email for contact form notifications

    // Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

    // Frontend URL (CRITICAL for password reset links)
    CLIENT_URL: process.env.CLIENT_URL,

    // Node Environment
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Gemini API Key
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};

// --- Essential Variable Checks ---
const essentialVars = [
    'MONGO_URI', 'JWT_SECRET', 'CLIENT_URL',
    'SMTP_HOST', 'SMTP_PORT', 'SMTP_EMAIL', 'SMTP_PASSWORD', // Make email vars essential
];

let missingVarsCount = 0;
console.log("--- Checking Essential Environment Variables ---");
essentialVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`FATAL ERROR: Environment variable ${varName} is not defined.`);
        missingVarsCount++;
    } else {
        if (!['JWT_SECRET', 'SMTP_PASSWORD', 'CLOUDINARY_API_SECRET', 'GEMINI_API_KEY', 'MONGO_URI'].includes(varName)) {
             console.log(`  ✔ ${varName} = ${process.env[varName]}`);
        } else if (varName === 'MONGO_URI') {
             console.log(`  ✔ ${varName} = MONGODB_URI is set (content hidden).`);
        } else {
             console.log(`  ✔ ${varName} = Variable is set (secret value hidden).`);
        }
    }
});

// Check ADMIN_EMAIL separately
if (!process.env.ADMIN_EMAIL) {
    console.warn("WARN: ADMIN_EMAIL not set in .env. Contact form submissions will not send admin notifications.");
} else {
     console.log(`  ✔ ADMIN_EMAIL = ${process.env.ADMIN_EMAIL}`);
}


if (missingVarsCount > 0) {
    console.error(`-------------------------------------------------`);
    console.error(` ${missingVarsCount} essential variable(s) missing. Server cannot start.`);
    console.error(` Please check your .env file.`);
    console.error(`-------------------------------------------------`);
    process.exit(1);
} else {
     console.log("--- All checked essential variables are defined. ---");
}


if (process.env.NODE_ENV === 'development') {
    const { JWT_SECRET, SMTP_PASSWORD, CLOUDINARY_API_SECRET, GEMINI_API_KEY, MONGO_URI, ...safeConfig } = module.exports;
    const maskedMongoUri = MONGO_URI ? MONGO_URI.replace(/([^:]+):([^@]+)@/, '$1:****@') : undefined;
    console.log("--- Configuration Loaded (Dev Mode - Secrets Hidden) ---", { ...safeConfig, MONGO_URI: maskedMongoUri ? 'Set' : 'Not Set' });
    console.log("-----------------------------------------------------");
}