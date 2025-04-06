const express = require("express");
const router = express.Router();
const homeownerController = require("../controllers/homeownerController");

// Register new homeowner
router.post("/register", homeownerController.register);

// Get all homeowners
router.get("/", homeownerController.getAllHomeowners);

// Get homeowner by ID
router.get("/:id", homeownerController.getHomeownerById);

// Update homeowner
router.put("/:id", homeownerController.updateHomeowner);

module.exports = router;
