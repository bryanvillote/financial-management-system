const mongoose = require('mongoose')

const billingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  billingAmount: {
    type: Number,
    rqeuired: true
  },
  date: {
    type: Date,
    default: Date.now
  }
})
