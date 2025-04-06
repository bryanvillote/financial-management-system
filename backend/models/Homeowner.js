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
    immutable: true, // Cannot be changed once set
  },
  status: {
    type: String,
    enum: ["Active", "Inactive", "Pending"],
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound unique index for block and lot numbers
homeownerSchema.index({ blockNo: 1, lotNo: 1 }, { unique: true });

module.exports = mongoose.model("Homeowner", homeownerSchema);
