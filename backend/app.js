// backend/app.js
const express = require('express');
const morgan = require('morgan'); // HTTP request logger
const cookieParser = require('cookie-parser'); // Parse cookies
const cors = require('cors'); // Enable Cross-Origin Resource Sharing
const fileUpload = require('express-fileupload'); // For handling file uploads
const path = require('path');
const dotenv = require('dotenv'); // Load environment variables

// Load Env Vars (do this early, before requiring config)
// Specify path if .env is not in the root directory relative to where node is run
// Using path.resolve ensures it works regardless of current working directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Import Utilities & Config (after dotenv)
const errorHandler = require('./middlewares/error');
const config = require('./config/config'); // Import your config (needs dotenv loaded first)

// --- Import ALL Route Handlers ---
// Ensure each route file is required only ONCE
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');
const userRoutes = require('./routes/userRoutes'); // Contains admin user routes
const customOrderRoutes = require('./routes/customOrderRoutes'); // Contains custom order routes
const chatbotRoutes = require('./routes/chatbotRoutes'); // Chatbot routes

// --- Initialize Express App ---
const app = express();

// --- Core Middlewares ---

// CORS Configuration
if (!config.CLIENT_URL) {
    // Log a warning but don't necessarily crash the server
    console.warn("---------------------------------------------------------------------");
    console.warn("WARN: CLIENT_URL environment variable not set.");
    console.warn("CORS might block frontend requests. Set CLIENT_URL in your .env file");
    console.warn("(e.g., CLIENT_URL=http://localhost:5173 for development).");
    console.warn("---------------------------------------------------------------------");
}
app.use(cors({
    // Allow requests ONLY from your frontend URL in production for security
    // In development, you might allow specific local origins or '*' (use with caution)
    origin: config.NODE_ENV === 'production'
        ? config.CLIENT_URL // Use the configured URL in production
        : [config.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'], // Allow common dev URLs
        // : '*', // Or allow all origins in development ONLY if necessary
    credentials: true // Important: Allow cookies and authorization headers to be sent cross-origin
}));

// Request Logging (Use 'dev' for development, 'combined' or 'tiny' for production)
if (config.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    // 'combined' provides more info (like user-agent, referrer) - good for production logs
    // 'tiny' is very minimal
    app.use(morgan('combined'));
}

// Body Parsers (Built-in with Express)
// Increase limit if handling large JSON payloads (e.g., base64 images, though file upload is preferred)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Cookie Parser - Parses Cookie header and populates req.cookies
app.use(cookieParser());

// File Upload Middleware (using express-fileupload)
// Configure temporary file storage - ensure the temp directory exists and is writable
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/', // Standard temp directory on Linux/macOS. For Windows, consider 'os.tmpdir()' or path.join(__dirname, 'tmp')
    // createParentPath: true, // Optional: Automatically create parent directories for temp files if they don't exist
    // limits: { fileSize: 10 * 1024 * 1024 }, // Optional: Limit file size (e.g., 10MB)
}));

// --- Static Files (Optional) ---
// Example: If you store non-Cloudinary files locally in an 'uploads' folder relative to app.js
// const uploadsPath = path.join(__dirname, 'uploads');
// app.use('/uploads', express.static(uploadsPath));
// console.log(`Serving static files from /uploads mapped to: ${uploadsPath}`);


// --- API Routes ---
// Mount all imported routers with a base path (e.g., /api/v1)
const apiBase = '/api/v1';
app.use(apiBase, authRoutes);
app.use(apiBase, productRoutes);
app.use(apiBase, orderRoutes);
app.use(apiBase, contactRoutes);
app.use(apiBase, userRoutes);        // Handles routes like /api/v1/admin/users
app.use(apiBase, customOrderRoutes); // Handles routes like /api/v1/custom-order/new
app.use(apiBase, chatbotRoutes);     // Handles routes like /api/v1/chatbot

// --- Simple Health Check Route ---
// Useful for load balancers, uptime monitoring, or basic connectivity check
app.get('/health', (req, res) => res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() }));


// --- Frontend Serving & Catch-all (Production Only) ---
// This block should come AFTER all API routes
if (config.NODE_ENV === 'production') {
  // Define the path to the frontend build directory
  // Assumes frontend build is in 'frontend/dist' relative to the *project root* (one level up from backend)
  const frontendBuildPath = path.resolve(__dirname, '..', 'frontend', 'dist');

  // Check if the build directory exists
  if (require('fs').existsSync(frontendBuildPath)) {
      // Serve static files (CSS, JS, images) from the build directory
      app.use(express.static(frontendBuildPath));

      // For any request that doesn't match an API route or a static file,
      // serve the 'index.html' file (this is standard for SPAs like React).
      // The React Router will then handle the client-side routing.
      app.get('*', (req, res) => {
          res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
      });
      console.log(`Production Mode: Serving static files from ${frontendBuildPath} and routing unmatched requests to index.html.`);
  } else {
       console.warn(`WARN: Frontend build directory not found at ${frontendBuildPath}. Cannot serve frontend static files.`);
       // Optional: Add a fallback for unmatched routes if frontend isn't served
       // app.get('*', (req, res) => res.status(404).json({ success: false, message: 'Resource not found' }));
  }
}


// --- Error Handling Middleware (Must be the LAST middleware loaded) ---
// This middleware catches errors passed via next(err) from controllers or other middleware
app.use(errorHandler);

// --- Export the configured Express App ---
module.exports = app;