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

module.exports = router;
