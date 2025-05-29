require("dotenv").config();
// Debug environment variables
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Password:', process.env.EMAIL_PASS ? 'Password is set' : 'Password is not set');

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Create Express app
const app = express();

// Connect to MongoDB first
mongoose
  .connect(process.env.DATABASE_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Global middleware
app.use(cors({
  origin: [
    'https://financial-management-system-eta.vercel.app',
    /^https:\/\/financial-management-system-.*\.vercel\.app$/,  // Allow all Vercel preview URLs
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());

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
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
