const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const emailService = {
  // Send receipt with optional image attachment
  async sendReceipt(email, html, blockNo, lotNo, receiptImage = null) {
    try {
      const simpleMessage = `
        <p>Attached is my proof of payment for Block ${blockNo}, Lot ${lotNo}.</p>
        <p>Thank you,</p>
        <p>HOA Management</p>
      `;

      // Send to homeowner
      const homeownerMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `HOA Payment Receipt - Block ${blockNo}, Lot ${lotNo}`,
        html: simpleMessage,
        attachments: receiptImage ? [
          {
            filename: receiptImage.originalname,
            path: receiptImage.path
          }
        ] : []
      };

      // Send to system email
      const systemMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to system's email
        subject: `[System Copy] HOA Payment Receipt - Block ${blockNo}, Lot ${lotNo}`,
        html: simpleMessage,
        attachments: receiptImage ? [
          {
            filename: receiptImage.originalname,
            path: receiptImage.path
          }
        ] : []
      };

      // Send both emails
      await Promise.all([
        transporter.sendMail(homeownerMailOptions),
        transporter.sendMail(systemMailOptions)
      ]);

      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  // Send payment reminder
  async sendPaymentReminder(email, name, dueAmount, blockNo, lotNo) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'HOA Payment Reminder',
        html: `
          <h2>Payment Reminder</h2>
          <p>Dear ${name},</p>
          <p>This is a reminder that you have a pending payment of ${dueAmount} for your HOA dues.</p>
          <p>Block: ${blockNo}</p>
          <p>Lot: ${lotNo}</p>
          <p>Please make the payment as soon as possible to avoid any penalties.</p>
          <p>Thank you,</p>
          <p>HOA Management</p>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      throw error;
    }
  }
};

module.exports = {
  emailService,
  upload
}; 