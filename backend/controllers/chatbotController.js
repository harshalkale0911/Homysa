// backend/controllers/chatbotController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const config = require('../config/config');

// Initialize Google Generative AI
if (!config.GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not configured in environment variables.");
    // Optionally exit or handle this state where chatbot won't work
    // process.exit(1);
}

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"}); // Or "gemini-pro"

// Pre-defined context for the chatbot
const CHATBOT_CONTEXT = `
You are "Homysa Helper", an AI assistant for Homysa Furniture, a company specializing in handcrafted wooden furniture and interior design.
Your primary role is to provide helpful information and suggestions related to wooden work, furniture types, wood properties, care tips, and Homysa's services (like custom orders and interior design).
Be friendly, informative, and focus on furniture and wood-related topics.
Do not answer questions outside of this scope (e.g., politics, personal opinions, complex math).
If asked about pricing, availability, or specific orders, politely state that you cannot access real-time data and direct the user to check the website shop, contact form, or customer support.
Keep responses concise and easy to understand.
Example valid topics: "Tell me about Teak wood", "What's the difference between Sheesham and Mango wood?", "How to care for a wooden table?", "What styles of chairs do you offer?", "Can you make custom bookshelves?", "What is Homysa's interior design process?".
Example invalid topics: "What's the weather like?", "Who won the election?", "Solve this calculus problem".
`;

// Store conversation history (simple in-memory store for demo - use DB for production)
// Key: A user identifier (e.g., session ID - needs implementation), Value: Array of {role: "user"/"model", parts: [{text: ""}]}
const chatHistories = {};

exports.handleChatMessage = catchAsyncErrors(async (req, res, next) => {
    const { message, history } = req.body; // Expect message and potentially conversation history from frontend

    if (!message) {
        return next(new ErrorHandler("Message content is required", 400));
    }

    if (!config.GEMINI_API_KEY) {
         return next(new ErrorHandler("Chatbot service is currently unavailable.", 503)); // Service Unavailable
    }

    // --- Simple History Management (Replace with robust session/DB based history) ---
    // For this example, we'll just use the history sent from the frontend if provided,
    // combined with the system context. In a real app, manage history server-side per user.
    const conversationHistory = [
        { role: "user", parts: [{ text: CHATBOT_CONTEXT }] }, // Start with system context
        { role: "model", parts: [{ text: "Hello! I'm Homysa Helper. How can I assist you with furniture or wooden work today?" }] }, // Initial model greeting
        ...(history || []) // Add history sent from frontend
    ];
     conversationHistory.push({ role: "user", parts: [{ text: message }] });
    // --- End Simple History ---


    try {
        const chat = model.startChat({
            history: conversationHistory.slice(0, -1), // Provide history *before* the current user message
            generationConfig: {
                maxOutputTokens: 250, // Limit response length
                temperature: 0.7,    // Adjust creativity (0-1)
            },
        });

        const result = await chat.sendMessage(message); // Send only the latest user message
        const response = result.response;
        const botReply = response.text();

        // Add bot reply to history (for potential future use if history is managed server-side)
         conversationHistory.push({ role: "model", parts: [{ text: botReply }] });

        res.status(200).json({
            success: true,
            reply: botReply,
            // Optionally send back the updated history if frontend needs it
            // updatedHistory: conversationHistory
        });

    } catch (error) {
        console.error("Error interacting with Gemini API:", error);
        // Handle potential safety blocks or other API errors
        let errorMessage = "Sorry, I couldn't process that request. Please try rephrasing.";
         if (error.message.includes('SAFETY')) {
            errorMessage = "I cannot respond to that request due to safety guidelines.";
         } else if (error.message.includes('API key')) {
            errorMessage = "Chatbot configuration error."; // Don't expose API key issues
         }
        return next(new ErrorHandler(errorMessage, 500));
    }
});