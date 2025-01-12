const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const auth = require("../middleware/auth");

// GET all expenses for a user
router.get("/", auth, async (req, res) => {
  //console.log("Fetching expenses for user ID: ", req.user.id);
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new expense
router.post("/", auth, async (req, res) => {
  const { expenseName, expenseAmount } = req.body;

  if (!expenseName || !expenseAmount) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newExpense = new Expense({
    userId: req.user.id,
    expenseName,
    expenseAmount,
  });

  try {
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE an expense
router.delete("/:id", auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense || expense.userId.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ message: "Expense not found or not authorized" });
    }

    await Expense.deleteOne({ _id: req.params.id });
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE an expense
router.put("/:id", auth, async (req, res) => {
  const { expenseName, expenseAmount } = req.body;

  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense || expense.userId.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ message: "Expense not found or not authorized" });
    }

    if (expenseName) expense.expenseName = expenseName;
    if (expenseAmount) expense.expenseAmount = expenseAmount;

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
