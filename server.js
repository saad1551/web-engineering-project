const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const sellerRouter = require('./routes/sellerRoute');
const mongoose = require('mongoose');

// Load env vars
dotenv.config();

// Initialize express
const app = express();

// add parsing middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Define routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Mount routers
app.use('/api/sellers', sellerRouter);

// Define port
const PORT = process.env.PORT || 5000;

// Connect to the database
mongoose.connect(process.env.MONGO_URI, {
}).then(() => {
    console.log('MongoDB connected');
    // Start server only if the database connection is successful
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

