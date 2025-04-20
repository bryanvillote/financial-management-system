const express = require("express");
const router = express.Router();
const homeownerController = require("../controllers/homeownerController");
const { Homeowner } = require("../models");

// Make sure these match exactly with your controller method names
router.post("/register", homeownerController.registerHomeowner);
router.get("/", async (req, res) => {
  try {
    const homeowners = await Homeowner.find().lean();
    // Transform the data to ensure all fields are present
    const formattedHomeowners = homeowners.map((homeowner) => ({
      _id: homeowner._id.toString(),
      name: homeowner.name,
      email: homeowner.email,
      blockNo: homeowner.blockNo,
      lotNo: homeowner.lotNo,
      phoneNo: homeowner.phoneNo,
      status: homeowner.status || "Active",
    }));
    console.log("Sending homeowners:", formattedHomeowners); // Debug log
    res.json(formattedHomeowners);
  } catch (error) {
    console.error("Error fetching homeowners:", error);
    res.status(500).json({ message: error.message });
  }
});
router.put("/:id", homeownerController.updateHomeowner);
router.delete("/:id", homeownerController.deleteHomeowner);
router.get("/email/:email", homeownerController.getHomeownerByEmail);

module.exports = router;
