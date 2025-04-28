// backend/routes/chatbotRoutes.js
const express = require('express');
const router = express.Router();
const { handleChatMessage } = require('../controllers/chatbotController');
// Optional: Add authentication if chatbot access should be restricted
// const { isAuthenticatedUser } = require('../middlewares/auth');

// POST route to handle incoming chat messages
router.route('/chatbot').post(handleChatMessage); // Add isAuthenticatedUser if needed

module.exports = router;