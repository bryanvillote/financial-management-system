const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const {
  startPenalty,
  checkAndUpdatePenalty,
} = require("../services/penaltyService");

// Add auth middleware and role verification
router.post(
  "/start",
  auth,
  roleAuth(["President", "Vice President", "Treasurer"]),
  async (req, res) => {
    try {
      const { homeownerId } = req.body;
      const result = await startPenalty(homeownerId);
      res.json(result);
    } catch (error) {
      console.error("Penalty application error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  "/check/:homeownerId",
  auth,
  roleAuth(["President", "Vice President", "Treasurer"]),
  async (req, res) => {
    try {
      const homeowner = await checkAndUpdatePenalty(req.params.homeownerId);
      res.json(homeowner);
    } catch (error) {
      console.error("Penalty check error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
