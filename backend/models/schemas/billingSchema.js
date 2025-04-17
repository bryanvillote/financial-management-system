const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema(
  {
    homeownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homeowner",
      required: true,
    },
    dueAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    lastPaymentDate: {
      type: Date,
    },
    lastPaymentAmount: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = billingSchema;
