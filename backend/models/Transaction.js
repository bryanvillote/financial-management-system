const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  monthlyDue: { type: Number, required: true },
  carSticker: { type: Number, required: true },
  expenses: { type: Number, required: true },
  block: {
    type: Number,
    required: true,
  },
  lot: {
    type: Number,
    required: true,
  },
  date: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
