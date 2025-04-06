const mongoose = require("mongoose");

const homeownerSchema = new mongoose.Schema({
  blockNo: {
    type: String,
    required: true,
  },
  lotNo: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "active", "inactive"],
    default: "pending",
  },
});

// Compound unique index for block and lot numbers
homeownerSchema.index({ blockNo: 1, lotNo: 1 }, { unique: true });

module.exports = mongoose.model("Homeowner", homeownerSchema);
