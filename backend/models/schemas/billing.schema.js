const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema(
  {
    homeownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homeowner",
      required: true,
      unique: true,
    },
    dueAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    lastPaymentDate: {
      type: Date,
    },
    lastPaymentAmount: {
      type: Number,
    },
    paymentHistory: [{
      date: {
        type: Date,
        required: true,
        default: Date.now
      },
      amount: {
        type: Number,
        required: true
      },
      status: {
        type: String,
        enum: ["Completed", "Pending", "Failed"],
        default: "Completed"
      },
      referenceNo: {
        type: String
      }
    }]
  },
  { timestamps: true }
);

billingSchema.index({ homeownerId: 1 });

module.exports = billingSchema;
