// backend/config/db.js
const mongoose = require('mongoose');
const config = require('./config'); // Use config file for URI

const connectDB = async () => {
  try {
    // Recommended for Mongoose v7+: Set strictQuery to avoid deprecation warnings
    // Set to true to prevent querying fields not in schema, false to allow.
    mongoose.set('strictQuery', true); // Or false based on your preference

    const conn = await mongoose.connect(config.MONGO_URI, {
      // useNewUrlParser and useUnifiedTopology are true by default in Mongoose 6+
      // useCreateIndex and useFindAndModify are not supported in Mongoose 6+
      // Add other options if needed, e.g., serverSelectionTimeoutMS
      // serverSelectionTimeoutMS: 5000 // Example: Timeout after 5s instead of 30s
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    console.error(err.stack); // Log stack trace for detailed debugging
    // Exit process with failure code
    process.exit(1);
  }
};

module.exports = connectDB;