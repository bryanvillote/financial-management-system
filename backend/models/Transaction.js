const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    amount: { type: Number, require: true },
    description: { type: String, require: true },
    date: { type: Date, default: Date.now },
    category: { type: String, require: true }
})

const Transaction = mongoose.model('Transaction', transactionSchema)

module.exports = Transaction