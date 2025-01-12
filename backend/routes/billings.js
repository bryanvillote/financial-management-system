const express = require("express");
const router = express.Router();
const Billing = require("../models/Billings");
const auth = require("../middleware/auth");

// GET all expenses for a user
router.get("/", auth, async (req, res) => {
  //console.log("Fetching expenses for user ID: ", req.user.id);
  try {
    const billings = await Billing.find({ userId: req.user.id });
    res.json(billings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new expense
router.post("/", auth, async (req, res) => {
  const { billingAmount } = req.body;

  if (!billingAmount) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newBilling = new Billing({
    userId: req.user.id,
    billingAmount,
  });

  try {
    const savedBilling = await newBilling.save();
    res.status(201).json(savedBilling);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE an expense
router.delete("/:id", auth, async (req, res) => {
  try {
    const billings = await Billing.findById(req.params.id);

    if (!billings || billings.userId.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ message: "Billing not found or not authorized" });
    }

    await Billing.deleteOne({ _id: req.params.id });
    res.json({ message: "Billing deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE an expense
router.put("/:id", auth, async (req, res) => {
  const { billingAmount } = req.body;

  try {
    const billings = await Billing.findById(req.params.id);

    if (!billings || billings.userId.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ message: "Billing not found or not authorized" });
    }

    if (billingAmount) billings.billingAmount = billingAmount;

    const updatedBilling = await billings.save();
    res.json(updatedBilling);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
