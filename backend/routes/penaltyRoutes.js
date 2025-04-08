const express = require("express");
const router = express.Router();
const {
  startPenalty,
  checkAndUpdatePenalty,
} = require("../services/penaltyService");

router.post("/start", async (req, res) => {
  try {
    const { homeownerId, penaltyLevel } = req.body;
    const updatedHomeowner = await startPenalty(homeownerId, penaltyLevel);
    res.json(updatedHomeowner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/check/:homeownerId", async (req, res) => {
  try {
    const homeowner = await checkAndUpdatePenalty(req.params.homeownerId);
    res.json(homeowner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
