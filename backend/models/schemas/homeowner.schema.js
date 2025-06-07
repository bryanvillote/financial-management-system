const mongoose = require("mongoose");

const STATUS_ENUM = {
  ACTIVE: "Active",
  WARNING: "Warning",
  PENALTY_1: "Penalty 1",
  PENALTY_2: "Penalty 2",
  PENALTY_3: "Penalty 3",
  NO_PARTICIPATION: "No Participation"
};

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
    houseModel: {
      type: String,
      required: true,
    },
    propertyTitleSerialNo: {
      type: String,
      required: true,
    },
    registrationDate: {
      type: Date,
      required: true
    },
    role: {
      type: String,
      default: "Home Owner",
      immutable: true,
    },
    status: {
      type: String,
      enum: [
        STATUS_ENUM.ACTIVE,
        STATUS_ENUM.WARNING,
        STATUS_ENUM.PENALTY_1,
        STATUS_ENUM.PENALTY_2,
        STATUS_ENUM.PENALTY_3,
        STATUS_ENUM.NO_PARTICIPATION
      ],
      default: STATUS_ENUM.ACTIVE,
    },
    penaltyLevel: {
      type: Number,
      default: 0,
    },
    pendingPenaltyLevel: {
      type: Number,
      default: null,
    },
    penaltyStatus: {
      type: String,
      enum: ["None", "Pending", "Active"],
      default: "None",
    },
    penaltyTimeoutId: {
      type: String,
      default: null,
    }
  },
  { timestamps: true }
);

// Compound unique index for block and lot numbers
homeownerSchema.index({ blockNo: 1, lotNo: 1 }, { unique: true });

module.exports = {
  homeownerSchema,
  STATUS_ENUM
};
