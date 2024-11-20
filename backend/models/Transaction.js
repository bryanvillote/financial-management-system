const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    monthlyDue: { type: Number, require: true },
    carSticker: { type: Number, require: true },
    expenses: { type: Number, require: true },
    block: {
        type: Number,
        required: true,
        unique: true,
    },
    lot: {
        type: Number,
        required: true,
        unique: true,
    },
    date: { type: Date, default: Date.now },
})

const Transaction = mongoose.model('Transaction', transactionSchema)

module.exports = Transaction
