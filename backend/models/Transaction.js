const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    monthlyDue: { type: Number, require: true },
    carSticker: { type: Number, require: true },
    expenses: { type: Number, require: true },
    date: { type: Date, default: Date.now },
})

const Transaction = mongoose.model('Transaction', transactionSchema)

module.exports = Transaction
