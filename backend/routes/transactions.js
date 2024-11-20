const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET all transactions
router.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new transaction
router.post('/', async (req, res) => {
    const { monthlyDue, carSticker, expenses } = req.body;

    const newTransaction = new Transaction({
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

// DELETE a transaction by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTransaction = await Transaction.findByIdAndDelete(id);
        if (!deletedTransaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json({ message: 'Transaction deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE a transaction by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { monthlyDue, carSticker, expenses } = req.body;

    try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            id,
            { monthlyDue, carSticker, expenses },
            { new: true, runValidators: true } // Return updated document and validate input
        );

        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json(updatedTransaction);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


module.exports = router;