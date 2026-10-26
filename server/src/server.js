const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Built-in JSON body parser middleware (Must be before routes)
app.use(express.json());

// Basic health check route to verify server is alive
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Padshala API is healthy and running'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});
