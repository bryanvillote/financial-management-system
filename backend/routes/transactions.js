const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth')

// GET all transactions
router.get('/', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new transaction
router.post('/', auth, async (req, res) => {
    const { monthlyDue, carSticker, expenses } = req.body;

    const newTransaction = new Transaction({
        userId: req.user.id,
        monthlyDue,
        carSticker,
        expenses,
    });

    try {
        const savedTransaction = await newTransaction.save();
        res.status(201).json(savedTransaction);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a transaction
router.delete('/:id', auth, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction || transaction.userId.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Transaction not found or not authorized' });
        }

        await transaction.remove();
        res.json({ message: 'Transaction deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE a transaction
router.put('/:id', auth, async (req, res) => {
    const { amount, description, category } = req.body;

    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction || transaction.userId.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Transaction not found or not authorized' });
        }

        transaction.amount = amount || transaction.amount;
        transaction.description = description || transaction.description;
        transaction.category = category || transaction.category;

        const updatedTransaction = await transaction.save();
        res.json(updatedTransaction);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;