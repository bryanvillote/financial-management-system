const express = require("express");
const router = express.Router();
const homeownerController = require("../controllers/homeownerController");
const { Homeowner } = require("../models");

// Get all homeowners
router.get("/", homeownerController.getAllHomeowners);

// Create a new homeowner
router.post("/", homeownerController.registerHomeowner);

// Get homeowner by email
router.get("/email/:email", homeownerController.getHomeownerByEmail);

// Update a homeowner
router.put("/:id", homeownerController.updateHomeowner);

// Delete a homeowner
router.delete("/:id", homeownerController.deleteHomeowner);

// Get audit logs for homeowners
router.get("/logs/audit", homeownerController.getAuditLogs);

module.exports = router;
