const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB Database (Section 6.4 & 6.5)
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests (Section 7.4 & 11)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman or curl) or matching allowed list
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Built-in JSON body parser middleware (Must be before routes - Section 11)
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Padshala API is healthy and running'
  });
});

// Mount Resource Routes (Section 6.1)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));

// Central Error Handler Middleware (Must be registered AFTER all routes - Section 6.3)
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});
