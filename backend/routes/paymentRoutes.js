const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticateToken } = require("../middleware/auth");

// Process a new payment
router.post("/process", authenticateToken, paymentController.processPayment);

// Get payment history for a specific homeowner
router.get("/history/:homeownerId", authenticateToken, paymentController.getPaymentHistory);

// Get all payments
router.get("/all", authenticateToken, paymentController.getAllPayments);

module.exports = router; 