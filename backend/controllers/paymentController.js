const { Homeowner, Payment, Billing } = require("../models");
const { resetPenaltyCycle, clearHomeownerTimeouts } = require("../services/penaltyService");
const { STATUS_ENUM } = require("../models/schemas/homeowner.schema");

// Process a new payment
exports.processPayment = async (req, res) => {
  try {
    const { homeownerId, amount, paymentMethod, referenceNumber } = req.body;

    // Validate homeowner exists
    const homeowner = await Homeowner.findById(homeownerId);
    if (!homeowner) {
      return res.status(404).json({ message: "Homeowner not found" });
    }

    // Create payment record
    const payment = new Payment({
      homeownerId,
      amount,
      paymentMethod,
      referenceNumber,
      status: "Completed",
    });

    await payment.save();

    // Update billing with new payment date
    const billing = await Billing.findOne({ homeownerId });   
    if (billing) {
      billing.dueAmount = Math.max(0, billing.dueAmount - amount);
      billing.lastPaymentDate = new Date();
      billing.lastPaymentAmount = amount;
      await billing.save();
    }

    // Clear any existing penalty timeouts
    clearHomeownerTimeouts(homeownerId);

    // Reset penalty cycle with new payment date
    await resetPenaltyCycle(homeownerId);

    res.status(201).json({
      message: "Payment processed successfully",
      payment,
      homeowner: {
        ...homeowner.toObject(),
        status: STATUS_ENUM.ACTIVE,
      },
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({
      message: "Failed to process payment",
      error: error.message
    });
  }
};

// Get payment history for a homeowner
exports.getPaymentHistory = async (req, res) => {
  try {
    const { homeownerId } = req.params;
    const payments = await Payment.find({ homeownerId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment history", error: error.message });
  }
};

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("homeownerId", "name blockNo lotNo")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
}; 