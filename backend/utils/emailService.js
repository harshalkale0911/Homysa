// backend/utils/emailService.js
const nodemailer = require('nodemailer');
const config = require('../config/config');

const sendEmail = async (options) => {
    // --- Input Validation ---
    if (!options.email || !options.subject || (!options.message && !options.html)) {
        const missing = ['email', 'subject', 'message/html'].filter(key => !options[key] || (key === 'message/html' && !options.message && !options.html)).join(', ');
        console.error(`[EMAIL_SERVICE] Email options missing: ${missing}. Required: 'email', 'subject', and 'message' or 'html'.`);
        throw new Error(`Missing required email options: ${missing}.`);
    }

    // --- Configuration Check ---
    const requiredSmtpVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_EMAIL', 'SMTP_PASSWORD'];
    const missingSmtpVars = requiredSmtpVars.filter(v => !config[v]);
    if (missingSmtpVars.length > 0) {
         console.error(`[EMAIL_SERVICE] SMTP configuration is incomplete. Missing: ${missingSmtpVars.join(', ')}`);
         throw new Error("Server email configuration error. Email cannot be sent.");
    }

    // --- Transporter Creation ---
    let transporter;
    try {
        const transportOptions = {
            host: config.SMTP_HOST,
            port: parseInt(config.SMTP_PORT, 10),
            secure: parseInt(config.SMTP_PORT, 10) === 465, // true for 465, false for 587/STARTTLS
            auth: {
                user: config.SMTP_EMAIL,
                pass: config.SMTP_PASSWORD
            },
            // Enable verbose logging in development environment ONLY
            logger: config.NODE_ENV === 'development',
            debug: config.NODE_ENV === 'development',
            // Optional: Adjust timeouts if ETIMEDOUT persists despite firewall checks
            // connectionTimeout: 15000, // 15 seconds (default is often longer)
            // greetingTimeout: 15000,
            // socketTimeout: 15000,
        };
        console.log(`[EMAIL_SERVICE] Creating transporter with options:`, {
            host: transportOptions.host,
            port: transportOptions.port,
            secure: transportOptions.secure,
            user: transportOptions.auth.user,
            // Do NOT log password
        });
        transporter = nodemailer.createTransport(transportOptions);

        // Optional: Verify connection - helpful for initial setup diagnosis
        // console.log("[EMAIL_SERVICE] Verifying transporter connection (this may take a moment)...");
        // await transporter.verify();
        // console.log("[EMAIL_SERVICE] Transporter connection verified successfully.");

    } catch (transportError) {
         console.error("[EMAIL_SERVICE] Failed to create or verify Nodemailer transporter:");
         console.error(transportError);
         throw new Error(`Server email configuration error: ${transportError.message}`);
    }

    // --- Mail Options ---
    const mailOptions = {
        from: `"${config.FROM_NAME}" <${config.FROM_EMAIL}>`, // e.g., "Homysa Furniture" <noreply@homysa.com>
        to: options.email,
        subject: options.subject,
        text: options.message || options.text, // Plain text version
        html: options.html // HTML version (optional)
    };

    // --- Sending Email ---
    try {
        console.log(`[EMAIL_SERVICE] Attempting to send email via transporter... To: ${options.email}, Subject: "${options.subject}"`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL_SERVICE] Email sent successfully! Message ID: ${info.messageId}, Response: ${info.response}`);
        return info;
    } catch (error) {
        console.error(`[EMAIL_SERVICE] <<<< FAILED to send email to ${options.email} >>>>`);
        console.error(`  Error Code: ${error.code || 'N/A'}`);
        console.error(`  Error Message: ${error.message}`);
        if (error.response) console.error(`  Error Response: ${error.response}`);
        if (error.responseCode) console.error(`  Error Response Code: ${error.responseCode}`);
        // Log the full stack trace for detailed debugging
        console.error("  Full Error Stack:", error.stack);

        // Throw a specific error for the controller to catch
        throw new Error(`Failed to send email. [Code: ${error.code || 'Nodemailer Error'}]`);
    }
};

module.exports = sendEmail;