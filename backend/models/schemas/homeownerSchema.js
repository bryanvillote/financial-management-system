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
  role: {
    type: String,
    default: "Home Owner",
    immutable: true,
  },
  status: {
    type: String,
    enum: ["Active", "Warning", "Danger", "No Participation"],
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  penaltyLevel: {
    type: Number,
    default: 0,
  },
  pendingPenaltyLevel: {
    type: Number,
    default: null,
  },
  penaltyStartTime: {
    type: Date,
    default: null,
  },
  penaltyStatus: {
    type: String,
    enum: ["None", "Pending", "Active"],
    default: "None",
  },
});

// Compound unique index for block and lot numbers
homeownerSchema.index({ blockNo: 1, lotNo: 1 }, { unique: true });

module.exports = homeownerSchema;
