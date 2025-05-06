const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// Configure nodemailer with your email service
const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

router.post("/send-receipt", async (req, res) => {
  const { email, receiptHtml, subject } = req.body;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: receiptHtml,
    });

    res.json({ message: "Receipt sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send receipt" });
  }
});

module.exports = router;
