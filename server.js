const express = require('express');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Initialize express
const app = express();

// Define routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});