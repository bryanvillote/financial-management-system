const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      required: true,
      enum: ["President", "Vice President", "Treasurer", "Home Owner"],
    },
  },
  { timestamps: true }
);

// Drop any existing indexes before creating new ones
//userSchema.index({ email: 1 }, { unique: true });

// method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  try {
    const match = await bcrypt.compare(password, this.password);
    return match;
  } catch (error) {
    console.error("Error comparing passwords.", error);
    return false;
  }
};

module.exports = mongoose.model("User", userSchema);
