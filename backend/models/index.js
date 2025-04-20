const mongoose = require("mongoose");

// Define schemas
const homeownerSchema = new mongoose.Schema(
  {
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
    name: {
      type: String,
      required: true,
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
  },
  { timestamps: true }
);

// Add pre-delete middleware
homeownerSchema.pre("remove", async function (next) {
  try {
    // Delete associated billing record
    await mongoose.model("Billing").deleteOne({ homeownerId: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

// Add compound index for block and lot numbers
homeownerSchema.index({ blockNo: 1, lotNo: 1 }, { unique: true });

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

// Create models
const models = {
  Homeowner:
    mongoose.models.Homeowner || mongoose.model("Homeowner", homeownerSchema),
  Billing: mongoose.models.Billing || mongoose.model("Billing", billingSchema),
};

module.exports = models;
