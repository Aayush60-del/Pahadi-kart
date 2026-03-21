const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    family: 4
})
    .then(() => console.log('✅ MongoDB connected!'))
    .catch(err => console.log('❌ Error:', err));

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'PahadiKart API running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});