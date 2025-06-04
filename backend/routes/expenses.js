const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const auth = require("../middleware/auth");
const expenseController = require('../controllers/expenseController');
const expenseAuditController = require('../controllers/expenseAuditController');

// GET all expenses for a user
router.get("/", auth, expenseController.getExpenses);

// POST a new expense
router.post("/", auth, expenseController.createExpense);

// DELETE an expense
router.delete("/:id", auth, expenseController.deleteExpense);

// UPDATE an expense
router.put("/:id", auth, expenseController.updateExpense);

// New audit logs route
router.get('/audit-logs', auth, expenseAuditController.getAuditLogs);

module.exports = router;
