// Load environment variables FIRST
require('dotenv').config();

const app = require('./app'); // Import the configured Express app
const connectDB = require('./config/db');
const config = require('./config/config'); // Use config for PORT

// Handle Uncaught Exceptions (Sync Errors) - Should be at the very top
process.on('uncaughtException', (err) => {
    console.error(`UNCAUGHT EXCEPTION! 💥 Shutting down...`);
    console.error(`${err.name}: ${err.message}`);
    console.error(err.stack);
    process.exit(1); // Exit immediately
});


// Connect to Database
connectDB();

// Start Server
const server = app.listen(config.PORT, () => {
    console.log(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
});

// Handle Unhandled Promise Rejections (Async Errors)
process.on('unhandledRejection', (err) => {
    console.error(`UNHANDLED REJECTION! 💥 Shutting down...`);
    console.error(`${err.name}: ${err.message}`);
    console.error(err.stack);
    // Close server gracefully & exit process
    server.close(() => {
        process.exit(1); // Exit after server closes
    });
});

// Optional: Handle SIGTERM for graceful shutdown (e.g., in Docker)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
    // db connection closing can be added here if needed
    process.exit(0);
  });
});


