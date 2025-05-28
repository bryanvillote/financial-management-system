const express = require("express");
const router = express.Router();
const {
  schedulePenaltyUpdates,
  calculatePenaltyStatus,
  updateHomeownerStatus,
  clearHomeownerTimeouts,
  STATUS_ENUM,
} = require("../services/penaltyService");
const { Homeowner, Billing } = require("../models");

// Set JSON content type for all routes
router.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Start penalty process for a homeowner
router.post("/start/:homeownerId", async (req, res) => {
  try {
    const { homeownerId } = req.params;
    
    // Check if homeowner exists
    const homeowner = await Homeowner.findById(homeownerId);
    if (!homeowner) {
      return res.status(404).json({
        success: false,
        message: "Homeowner not found"
      });
    }

    // Get billing information
    const billing = await Billing.findOne({ homeownerId });
    if (!billing) {
      return res.status(404).json({
        success: false,
        message: "Billing information not found"
      });
    }

    // Clear any existing timeouts
    clearHomeownerTimeouts(homeownerId);

    // Schedule new penalty updates
    const { timeouts } = await schedulePenaltyUpdates(homeownerId, new Date());

    res.json({
      success: true,
      message: "Penalty process started",
      data: {
        homeowner: {
          ...homeowner.toObject(),
          status: homeowner.status,
        }
      }
    });
  } catch (error) {
    console.error("Error starting penalty:", error);
    res.status(500).json({
      success: false,
      message: "Error starting penalty",
      error: error.message
    });
  }
});

// Get current penalty status
router.get("/status/:homeownerId", async (req, res) => {
  try {
    const { homeownerId } = req.params;
    
    const homeowner = await Homeowner.findById(homeownerId);
    if (!homeowner) {
      return res.status(404).json({
        success: false,
        message: "Homeowner not found"
      });
    }

    const billing = await Billing.findOne({ homeownerId });
    if (!billing) {
      return res.status(404).json({
        success: false,
        message: "Billing information not found"
      });
    }

    const penaltyStatus = calculatePenaltyStatus(billing.lastPaymentDate || new Date());

    res.json({
      success: true,
      data: {
        homeowner: {
          ...homeowner.toObject(),
          status: homeowner.status,
        },
        penaltyStatus,
      }
    });
  } catch (error) {
    console.error("Error getting penalty status:", error);
    res.status(500).json({
      success: false,
      message: "Error getting penalty status",
      error: error.message
    });
  }
});

// Clear penalty for a homeowner
router.post("/clear/:homeownerId", async (req, res) => {
  try {
    const { homeownerId } = req.params;
    
    // Clear any existing timeouts
    clearHomeownerTimeouts(homeownerId);

    // Update homeowner status to Active
    const homeowner = await updateHomeownerStatus(homeownerId, STATUS_ENUM.ACTIVE, 0);

    res.json({
      success: true,
      message: "Penalty cleared",
      data: {
        homeowner: {
          ...homeowner.toObject(),
          status: homeowner.status,
        }
      }
    });
  } catch (error) {
    console.error("Error clearing penalty:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing penalty",
      error: error.message
    });
  }
});

module.exports = router;
