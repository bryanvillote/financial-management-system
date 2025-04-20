const express = require("express");
const router = express.Router();
const homeownerController = require("../controllers/homeownerController");
const Homeowner = require("../models/homeowner");

// Register new homeowner
router.post("/register", homeownerController.register);

// Get all homeowners
router.get("/", homeownerController.getAllHomeowners);

// Get homeowner by ID
router.get("/:id", homeownerController.getHomeownerById);

// Update homeowner
router.put("/:id", homeownerController.updateHomeowner);

// Get homeowner by email
router.get("/email/:email", async (req, res) => {
  try {
    const homeowner = await Homeowner.findOne({ email: req.params.email });
    if (!homeowner) {
      return res.status(404).json({ message: "Homeowner not found" });
    }
    res.json(homeowner);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
