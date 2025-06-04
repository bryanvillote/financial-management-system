const Expense = require('../models/Expense');
const expenseAuditController = require('./expenseAuditController');

// Get all expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new expense
exports.createExpense = async (req, res) => {
  const { expenseName, expenseAmount } = req.body;

  if (!expenseName || !expenseAmount) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newExpense = new Expense({
    userId: req.user.id,
    expenseName,
    expenseAmount,
  });

  try {
    const savedExpense = await newExpense.save();
    // Create audit log
    await expenseAuditController.createAuditLog(
      req.user.email,
      'CREATE',
      `Created expense: ${expenseName} with amount ₱${expenseAmount}`,
      savedExpense._id
    );
    res.status(201).json(savedExpense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  const { expenseName, expenseAmount } = req.body;

  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense || expense.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: "Expense not found or not authorized" });
    }

    const oldExpense = { ...expense.toObject() };
    
    if (expenseName) expense.expenseName = expenseName;
    if (expenseAmount) expense.expenseAmount = expenseAmount;

    const updatedExpense = await expense.save();
    
    // Create audit log
    await expenseAuditController.createAuditLog(
      req.user.email,
      'UPDATE',
      `Updated expense from: ${oldExpense.expenseName} (₱${oldExpense.expenseAmount}) to: ${expenseName} (₱${expenseAmount})`,
      updatedExpense._id
    );
    
    res.json(updatedExpense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense || expense.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: "Expense not found or not authorized" });
    }

    // Create audit log before deleting
    await expenseAuditController.createAuditLog(
      req.user.email,
      'DELETE',
      `Deleted expense: ${expense.expenseName} with amount ₱${expense.expenseAmount}`,
      expense._id
    );

    await Expense.deleteOne({ _id: req.params.id });
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 