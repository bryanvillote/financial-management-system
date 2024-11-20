// Import required modules
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();  // To load environment variables from .env file

const app = express();

// Middleware
app.use(express.json()); // Parse JSON requests

// MongoDB connection using Mongoose
mongoose.connect(process.env.DATABASE_URI)
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
    });

// Basic route
app.get('/', (req, res) => {
    res.send('Hello, MongoDB with Express!');
});

// Routes
const transactionRoutes = require('./routes/transactions');
app.use('/api/transactions', transactionRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
