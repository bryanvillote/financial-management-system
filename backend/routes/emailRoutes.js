const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const html2pdf = require("html-pdf");

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test the connection
transporter.verify(function (error, success) {
  if (error) {
    console.log("Error setting up email:", error);
  } else {
    console.log("Email server is ready");
  }
});

router.post("/send-receipt", async (req, res) => {
  try {
    const { html, email, blockNo, lotNo } = req.body;

    // Add custom styling for PDF
    const styledHtml = `
      <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; border: 1px solid #ddd; }
        h1, h2 { text-align: center; }
        .paid { color: #2e7d32; font-weight: bold; }
        .unpaid { color: #d32f2f; font-weight: bold; }
      </style>
      ${html}
    `;

    // Convert HTML to PDF
    const pdfBuffer = await new Promise((resolve, reject) => {
      html2pdf
        .create(styledHtml, {
          format: "A4",
          border: {
            top: "20px",
            right: "20px",
            bottom: "20px",
            left: "20px",
          },
        })
        .toBuffer((err, buffer) => {
          if (err) reject(err);
          else resolve(buffer);
        });
    });

    // Setup email data
    const mailOptions = {
      from: `"Centro de San Lorenzo" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Receipt for Block ${blockNo} Lot ${lotNo} - Centro de San Lorenzo`,
      text: `Dear Homeowner,

Please find attached your receipt from Centro de San Lorenzo.

Block: ${blockNo}
Lot: ${lotNo}

This is an automated email. Please do not reply.

Best regards,
Centro de San Lorenzo Management`,
      attachments: [
        {
          filename: `Receipt_Block${blockNo}_Lot${lotNo}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Receipt sent successfully to your email",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send receipt",
      error: error.message,
    });
  }
});

// Add this new route for payment notifications
router.post("/send-payment-reminder", async (req, res) => {
  try {
    const { email, name, dueAmount, blockNo, lotNo } = req.body;

    // Validate required fields
    if (!email || !blockNo || !lotNo || dueAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Setup email data
    const mailOptions = {
      from: `"Centro de San Lorenzo" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Payment Reminder - Centro de San Lorenzo`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B1E54; text-align: center;">Payment Reminder</h2>
          <p>Dear ${name || `Block ${blockNo} Lot ${lotNo} Resident`},</p>
          <p>This is a friendly reminder about your outstanding payment at Centro de San Lorenzo.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Block:</strong> ${blockNo}</p>
            <p style="margin: 10px 0;"><strong>Lot:</strong> ${lotNo}</p>
            <p style="margin: 0; color: #dc3545;"><strong>Due Amount:</strong> ₱${parseFloat(
              dueAmount
            ).toFixed(2)}</p>
          </div>
          <p>Please settle your payment at your earliest convenience to avoid any penalties.</p>
          <p>If you have already made the payment, please disregard this message.</p>
          <p style="color: #6c757d; font-size: 0.9em;">This is an automated email. Please do not reply.</p>
          <hr style="border: 1px solid #dee2e6; margin: 20px 0;">
          <p style="text-align: center; color: #6c757d; font-size: 0.8em;">
            Centro de San Lorenzo Management<br>
            Contact us: ${process.env.EMAIL_USER}
          </p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Payment reminder sent successfully",
    });
  } catch (error) {
    console.error("Error sending payment reminder:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send payment reminder",
      error: error.message,
    });
  }
});

module.exports = router;
