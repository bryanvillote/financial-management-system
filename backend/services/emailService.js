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
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const emailService = {
  // Send receipt with all payment details
  async sendReceipt({
    email,
    receiptHtml,
    subject,
    homeownerName,
    blockNo,
    lotNo,
    dueAmount,
    paymentDate,
    referenceNumber,
    pdfAttachment,
    pdfFileName
  }) {
    try {
      const mailOptions = {
        from: {
          name: 'Centro De San Lorenzo HOA',
          address: "Centro De San Lorenzo HOA <centrodesanlorenzohoa@gmail.com>"
        },
        to: email,
        subject: subject || `HOA Payment Receipt - Block ${blockNo}, Lot ${lotNo}`,
        html: receiptHtml,
        attachments: []
      };

      // Attach the generated PDF if provided
      if (pdfAttachment && pdfFileName) {
        mailOptions.attachments.push({
          filename: pdfFileName,
          content: pdfAttachment,
          contentType: 'application/pdf'
        });
      }

      // Send to homeowner
      await transporter.sendMail(mailOptions);

      // Send system copy
      const systemMailOptions = {
        ...mailOptions,
        to: process.env.EMAIL_USER,
        subject: `[System Copy] ${mailOptions.subject}`
      };
      await transporter.sendMail(systemMailOptions);

      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      console.error('Email configuration:', {
        host: 'smtp.gmail.com',
        port: 587,
        user: process.env.EMAIL_USER,
        hasPassword: !!process.env.EMAIL_PASS
      });
      console.error('Mail options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        hasHtml: !!mailOptions.html,
        hasAttachments: !!mailOptions.attachments.length
      });
      throw error;
    }
  },

  // Send payment reminder
  async sendPaymentReminder(email, name, dueAmount, blockNo, lotNo) {
    try {
      const mailOptions = {
        from: {
          name: 'Centro De San Lorenzo HOA',
          address: process.env.EMAIL_USER
        },
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
          <p>Centro De San Lorenzo HOA</p>
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