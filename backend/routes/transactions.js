const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

// GET all transactions
router.get("/", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new transaction
router.post("/", auth, async (req, res) => {
  const { monthlyDue, carSticker, expenses, block, lot } = req.body;

  if (!monthlyDue || !carSticker || !expenses || !block || !lot) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newTransaction = new Transaction({
    userId: req.user.id,
    monthlyDue,
    carSticker,
    expenses,
    block,
    lot,
  });

  try {
    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Block and lot combination must be unique" });
    }
    res.status(400).json({ message: err.message });
  }
});

// DELETE a transaction
router.delete("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction || transaction.userId.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ message: "Transaction not found or not authorized" });
    }

    await Transaction.deleteOne({ _id: req.params.id });
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE a transaction
router.put("/:id", auth, async (req, res) => {
  const { monthlyDue, carSticker, expenses, block, lot } = req.body;

  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction || transaction.userId.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ message: "Transaction not found or not authorized" });
    }

    if (monthlyDue) transaction.monthlyDue = monthlyDue;
    if (carSticker) transaction.carSticker = carSticker;
    if (expenses) transaction.expenses = expenses;
    if (block) transaction.block = block;
    if (lot) transaction.lot = lot;

    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Block and lot combination must be unique" });
    }
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
