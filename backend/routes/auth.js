const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET; // Store securely in environment variables

// Register a new user

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("role")
      .isIn(["President", "Vice President", "Treasurer"])
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, role } = req.body;

      // Log the received data (remove in production)
      console.log("Received registration request for email:", email);

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("Password hashed successfully");

      const newUser = new User({ email, password: hashedPassword, role });
      await newUser.save();
      console.log("User saved successfully");

      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      // More detailed error logging
      console.error("Registration error:", err);
      res.status(500).json({
        message: "Server error during registration",
        error: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
    }
  }
);

// Login a user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({ token, message: "Logged in successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// Fetch all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "email role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update a user
router.put("/users/:id", async (req, res) => {
  const { email, role } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { email, role },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete a user
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
