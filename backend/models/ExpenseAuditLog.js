const mongoose = require('mongoose');

const expenseAuditLogSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: {
    type: String,
    required: true
  },
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense'
  }
});

module.exports = mongoose.model('ExpenseAuditLog', expenseAuditLogSchema); 