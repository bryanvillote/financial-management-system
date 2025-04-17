const express = require("express");
const router = express.Router();
const billingService = require("../services/billingService");

// Get billing info for all homeowners
router.get("/billing", async (req, res) => {
  try {
    const billingInfo = await billingService.getAllBillingInfo();
    res.json(billingInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get billing info for a specific homeowner
router.get("/billing/:homeownerId", async (req, res) => {
  try {
    const billingInfo = await billingService.getBillingInfo(
      req.params.homeownerId
    );
    res.json(billingInfo);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Process a payment
router.post("/billing/payment", async (req, res) => {
  try {
    const { homeownerId, amount } = req.body;
    if (!homeownerId || !amount) {
      return res
        .status(400)
        .json({ message: "Homeowner ID and amount are required" });
    }
    const result = await billingService.processPayment(
      homeownerId,
      parseFloat(amount)
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
