require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const expenseRoutes = require("./routes/expenses");
const billingRoutes = require("./routes/billings");
const homeownerRoutes = require("./routes/homeownerRoutes");
const penaltyRoutes = require("./routes/penaltyRoutes");
const cors = require("cors");

const app = express();

// Connect to MongoDB first
mongoose
  .connect(process.env.DATABASE_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/expenses", expenseRoutes);
app.use("/billing", billingRoutes);
app.use("/homeowners", homeownerRoutes);
app.use("/penalty", penaltyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
