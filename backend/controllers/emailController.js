const { emailService, upload } = require('../services/emailService');

// Send receipt with optional image attachment
exports.sendReceipt = async (req, res) => {
  try {
    const { 
      email, 
      receiptHtml, 
      subject,
      homeownerName,
      blockNo,
      lotNo,
      dueAmount,
      paymentDate,
      referenceNumber
    } = req.body;

    if (!email || !receiptHtml) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    await emailService.sendReceipt({
      email,
      receiptHtml,
      subject,
      homeownerName,
      blockNo,
      lotNo,
      dueAmount,
      paymentDate,
      referenceNumber
    });

    res.status(200).json({
      success: true,
      message: 'Receipt sent successfully'
    });
  } catch (error) {
    console.error('Error sending receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send receipt',
      error: error.message
    });
  }
};

// Send payment reminder
exports.sendPaymentReminder = async (req, res) => {
  try {
    const { email, name, dueAmount, blockNo, lotNo } = req.body;

    if (!email || !name || !dueAmount || !blockNo || !lotNo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    await emailService.sendPaymentReminder(email, name, dueAmount, blockNo, lotNo);

    res.status(200).json({
      success: true,
      message: 'Payment reminder sent successfully'
    });
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send payment reminder',
      error: error.message
    });
  }
}; 