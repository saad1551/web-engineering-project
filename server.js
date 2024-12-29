const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/errorMiddleware');
const cors = require('cors');

const sellerRouter = require('./routes/sellerRoute');
const buyerRouter = require('./routes/buyerRoute');
const productRouter = require('./routes/productRoute');
const adminRouter = require('./routes/adminRoute');

// Load env vars
dotenv.config();

// Initialize express
const app = express();

// Enable CORS for the frontend
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

// add parsing middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(errorHandler);

app.use("/uploads", express.static(path.join(__dirname,
    "uploads"
)));

// Define routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Mount routers
app.use('/api/sellers', sellerRouter);
app.use('/api/buyers', buyerRouter);
app.use('/api/products/', productRouter);
app.use('/api/admin', adminRouter);

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

