// backend/controllers/contactController.js
const Contact = require('../models/Contact');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendEmail = require('../utils/emailService');
const config = require('../config/config');

// Create new contact message => /api/v1/contact/new
exports.newContact = catchAsyncErrors(async (req, res, next) => {
    const { name, email, phone, subject, message } = req.body;
    console.log(`[CONTACT_FORM] Received submission from: ${email}, Subject: ${subject}`);

    // Basic validation
    if (!name || !email || !subject || !message) {
        return next(new ErrorHandler('Please fill in all required fields (Name, Email, Subject, Message)', 400));
    }

    const contact = await Contact.create({ name, email, phone, subject, message });
    console.log(`[CONTACT_FORM] Saved contact message with ID: ${contact._id}`);


    // --- Try sending notification emails ---

    // 1. Send notification to Admin
    const adminEmail = config.ADMIN_EMAIL || config.SMTP_EMAIL;
    if (adminEmail) {
        console.log(`[CONTACT_FORM] Attempting to send admin notification to: ${adminEmail}`);
        try {
            await sendEmail({
                email: adminEmail,
                subject: `[Homysa Contact] New Message: ${subject}`,
                html: `
                    <h2 style="color:#333;">New Contact Form Submission</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                    <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 1em 0;">
                    <p><strong>Message:</strong></p>
                    <p style="white-space: pre-wrap; background-color:#f9f9f9; padding: 10px; border-radius: 4px;">${message}</p>
                 `
            });
            console.log(`[CONTACT_FORM] Admin notification sent successfully to: ${adminEmail}`);
        } catch (error) {
            console.error('[CONTACT_FORM] ERROR sending admin notification email:', error);
            // Log stack trace for better debugging
            console.error(error.stack);
            // Do not stop the overall process, just log the email failure
        }
    } else {
        console.warn("[CONTACT_FORM] WARN: Admin email (ADMIN_EMAIL or SMTP_EMAIL) not configured. Cannot send admin notification.");
    }

    // 2. Send confirmation email to User
     console.log(`[CONTACT_FORM] Attempting to send user confirmation to: ${email}`);
    try {
        await sendEmail({
            email: email,
            subject: `We've Received Your Message - Homysa`,
             html: `
                <div style="font-family: sans-serif; line-height: 1.6;">
                    <h2>Thank you for contacting Homysa, ${name}!</h2>
                    <p>We have received your message regarding "<strong>${subject}</strong>" and will get back to you as soon as possible (usually within 1-2 business days).</p>
                    <p>For your reference, here is the message you sent:</p>
                    <blockquote style="border-left: 4px solid #ccc; padding-left: 1em; margin: 1em 0; background-color: #f9f9f9;">
                        <p style="white-space: pre-wrap;">${message}</p>
                    </blockquote>
                    <p>Best regards,<br/>The Homysa Team</p>
                    <p style="font-size: 0.8em; color: #777;">Please do not reply directly to this email.</p>
                </div>
             `
        });
         console.log(`[CONTACT_FORM] User confirmation sent successfully to: ${email}`);
    } catch (error) {
        console.error(`[CONTACT_FORM] ERROR sending user confirmation email to ${email}:`, error);
         // Log stack trace for better debugging
         console.error(error.stack);
         // Do not stop the overall process, just log the email failure
    }

    // --- Send success response to frontend ---
    // This indicates the contact form data was saved, even if emails failed
    res.status(201).json({
        success: true,
        message: 'Your message has been sent successfully! We will get back to you soon.',
        contactId: contact._id
    });
});

// --- ADMIN Routes (Keep as previously corrected) ---
exports.getContacts = catchAsyncErrors(async (req, res, next) => { /* ... */ });
exports.getSingleContact = catchAsyncErrors(async (req, res, next) => { /* ... */ });
exports.updateContact = catchAsyncErrors(async (req, res, next) => { /* ... */ });
exports.deleteContact = catchAsyncErrors(async (req, res, next) => { /* ... */ });