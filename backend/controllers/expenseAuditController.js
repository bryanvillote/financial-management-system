const ExpenseAuditLog = require('../models/ExpenseAuditLog');

// Get all audit logs
exports.getAuditLogs = async (req, res) => {
  try {
    const auditLogs = await ExpenseAuditLog.find()
      .sort({ timestamp: -1 }) // Sort by most recent first
      .limit(100); // Limit to last 100 logs
    res.json(auditLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create audit log entry
exports.createAuditLog = async (userEmail, action, details, expenseId) => {
  try {
    const auditLog = new ExpenseAuditLog({
      userEmail,
      action,
      details,
      expenseId
    });
    await auditLog.save();
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
}; 