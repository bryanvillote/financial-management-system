require("dotenv").config();
// Debug environment variables
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Password:', process.env.EMAIL_PASS ? 'Password is set' : 'Password is not set');

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Create Express app
const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Connect to MongoDB first
mongoose
  .connect(process.env.DATABASE_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Global middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import routes
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const expenseRoutes = require("./routes/expenses");
const billingRoutes = require("./routes/billings");
const homeownerRoutes = require("./routes/homeownerRoutes");
const penaltyRoutes = require("./routes/penaltyRoutes");
const emailRoutes = require("./routes/emailRoutes");

// Routes
app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/expenses", expenseRoutes);
app.use("/billing", billingRoutes);
app.use("/homeowners", homeownerRoutes);
app.use("/penalty", penaltyRoutes);
app.use("/email", emailRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for: ${process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173'}`);
});
