const express = require("express");
const router = express.Router();
const { upload } = require('../services/emailService');
const { sendReceipt, sendPaymentReminder } = require('../controllers/emailController');

// Send receipt with optional image attachment
router.post('/send-receipt', upload.single('receiptImage'), sendReceipt);

// Send payment reminder
router.post('/send-payment-reminder', sendPaymentReminder);

module.exports = router;