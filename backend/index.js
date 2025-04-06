require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const expenseRoutes = require("./routes/expenses");
const billingRoutes = require("./routes/billings");
const homeownerRoutes = require("./routes/homeownerRoutes");
const cors = require("cors");

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/expenses", expenseRoutes);
app.use("/billing", billingRoutes);
app.use("/homeowners", homeownerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: err.message,
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.DATABASE_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
