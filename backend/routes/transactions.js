const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

// GET all transactions
router.get("/", auth, async (req, res) => {
  try {
    // Check if homeownerId is provided in query params
    const { homeownerId } = req.query;
    
    if (homeownerId) {
      // Get homeowner details
      const Homeowner = require("../models/Homeowner");
      const Billing = require("../models/Billing");
      
      const homeowner = await Homeowner.findById(homeownerId);
      
      if (!homeowner) {
        return res.status(404).json({
          success: false,
          message: "Homeowner not found"
        });
      }

      console.log("Finding billing for homeowner:", homeownerId);

      // Find billing record for this homeowner
      const billing = await Billing.findOne({ homeownerId });
      
      if (!billing) {
        return res.json({
          success: true,
          data: []
        });
      }

      console.log("Found billing record:", billing);

      // Transform the payment history data
      const paymentHistory = billing.paymentHistory.map(payment => ({
        amount: payment.amount,
        status: payment.status,
        referenceNumber: payment.referenceNo,
        createdAt: payment.date,
        details: {
          monthlyDue: payment.amount,
          carSticker: 0,
          expenses: 0
        }
      }));

      console.log("Transformed payment history:", paymentHistory);

      return res.json({
        success: true,
        data: paymentHistory || []
      });
    }

    // If no homeownerId, return all transactions for the user
    const transactions = await Transaction.find({ userId: req.user.id });
    res.json({
      success: true,
      data: transactions || []
    });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching transactions",
      error: err.message 
    });
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

// GET transactions by homeowner ID
router.get("/homeowner/:homeownerId", auth, async (req, res) => {
  try {
    // First get the homeowner details to get block and lot
    const Homeowner = require("../models/Homeowner");
    const homeowner = await Homeowner.findById(req.params.homeownerId);
    
    if (!homeowner) {
      return res.status(404).json({
        success: false,
        message: "Homeowner not found"
      });
    }

    // Find transactions matching the homeowner's block and lot
    const transactions = await Transaction.find({ 
      block: homeowner.blockNo,
      lot: homeowner.lotNo
    }).sort({ date: -1 });
    
    // Transform the data to match the expected format
    const paymentHistory = transactions.map(transaction => ({
      amount: transaction.monthlyDue + transaction.carSticker + transaction.expenses,
      status: "Completed",
      referenceNumber: transaction._id,
      createdAt: transaction.date
    }));

    res.json({
      success: true,
      data: paymentHistory
    });
  } catch (err) {
    console.error("Error fetching homeowner transactions:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching payment history",
      error: err.message 
    });
  }
});

module.exports = router;
