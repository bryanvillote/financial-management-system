const express = require("express");
const router = express.Router();
const { Homeowner, Billing } = require("../models");

// Get all billing information
router.get("/", async (req, res) => {
  try {
    const billings = await Billing.find().lean();

    // Map billing records to include all necessary information
    const billingInfo = billings.map((billing) => ({
      _id: billing._id.toString(),
      homeownerId: billing.homeownerId.toString(),
      dueAmount: billing.dueAmount || 0,
      lastPaymentDate: billing.lastPaymentDate,
      lastPaymentAmount: billing.lastPaymentAmount,
    }));

    res.json(billingInfo);
  } catch (error) {
    console.error("Error in GET /billing:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get billing info for a specific homeowner
router.get("/:homeownerId", async (req, res) => {
  try {
    const homeowner = await Homeowner.findById(req.params.homeownerId);
    if (!homeowner) {
      return res.status(404).json({ message: "Homeowner not found" });
    }

    const billing = (await Billing.findOne({ homeownerId: homeowner._id })) || {
      dueAmount: 0,
    };
    res.json({
      _id: homeowner._id,
      name: homeowner.name,
      email: homeowner.email,
      dueAmount: billing.dueAmount,
    });
  } catch (error) {
    console.error("Error in GET /billing/:homeownerId:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add a route to get billing info by homeowner email
router.get("/by-email/:email", async (req, res) => {
  try {
    // First find the homeowner by email
    const homeowner = await Homeowner.findOne({ email: req.params.email });
    if (!homeowner) {
      return res.status(404).json({
        success: false,
        message: "Homeowner not found",
      });
    }

    // Then get their billing information
    const billing = await Billing.findOne({ homeownerId: homeowner._id });

    // Return billing data with proper defaults if no billing record exists
    res.json({
      success: true,
      data: {
        dueAmount: billing?.dueAmount || 0,
        lastPaymentDate: billing?.lastPaymentDate || null,
        lastPaymentAmount: billing?.lastPaymentAmount || null,
        isPaid: billing ? billing.dueAmount === 0 : true,
      },
    });
  } catch (error) {
    console.error("Error fetching billing info:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update the payment processing route
router.post("/payment", async (req, res) => {
  try {
    const { homeownerId, amount } = req.body;
    if (!homeownerId || !amount) {
      return res
        .status(400)
        .json({ message: "Homeowner ID and amount are required" });
    }

    // Find the billing record
    let billing = await Billing.findOne({ homeownerId });
    if (!billing) {
      billing = new Billing({ homeownerId, dueAmount: 0 });
    }

    // Process the payment
    billing.dueAmount = Math.max(0, billing.dueAmount - parseFloat(amount));
    billing.lastPaymentDate = new Date();
    billing.lastPaymentAmount = parseFloat(amount);
    await billing.save();

    // If payment clears the due amount, update homeowner status to Active
    if (billing.dueAmount === 0) {
      await Homeowner.findByIdAndUpdate(homeownerId, {
        status: "Active",
        penaltyLevel: 0,
        pendingPenaltyLevel: null,
        penaltyStartTime: null,
        penaltyStatus: "None",
      });
    }

    res.json({
      success: true,
      data: {
        amountPaid: amount,
        remainingBalance: billing.dueAmount,
        lastPaymentDate: billing.lastPaymentDate,
        isPaid: billing.dueAmount === 0,
        status: billing.dueAmount === 0 ? "Active" : undefined,
      },
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update the route that handles due amount updates
router.put("/:id/update-due", async (req, res) => {
  try {
    const { id } = req.params;
    const { dueAmount } = req.body;

    if (dueAmount === undefined || dueAmount === null) {
      return res.status(400).json({
        success: false,
        message: "Due amount is required",
      });
    }

    // Convert dueAmount to number and ensure it's not negative
    const newDueAmount = Math.max(0, Number(dueAmount));

    // Use findOneAndUpdate with upsert to create if doesn't exist
    const billing = await Billing.findOneAndUpdate(
      { homeownerId: id },
      {
        $set: {
          dueAmount: newDueAmount,
          // Only update lastPaymentDate if amount is being reduced
          ...(newDueAmount === 0 ? { lastPaymentDate: new Date() } : {}),
        },
      },
      {
        new: true, // Return updated document
        upsert: true, // Create if doesn't exist
        runValidators: true, // Run schema validations
      }
    );

    // Log the update for debugging
    console.log("Updated billing:", billing);

    res.json({
      success: true,
      message: "Due amount updated successfully",
      data: billing,
    });
  } catch (error) {
    console.error("Error updating due amount:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update due amount",
      error: error.message,
    });
  }
});

// Update the route that handles new homeowner registration to initialize billing
router.post("/initialize", async (req, res) => {
  try {
    const { homeownerId } = req.body;

    // Check if billing record already exists
    let billing = await Billing.findOne({ homeownerId });

    if (!billing) {
      // Create new billing record with 0 due amount
      billing = await Billing.create({
        homeownerId,
        dueAmount: 0,
      });
    }

    res.json({
      success: true,
      data: billing,
    });
  } catch (error) {
    console.error("Error initializing billing:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
