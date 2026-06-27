const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Security & utility middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];
    const isVercelPreview = origin && origin.endsWith('.vercel.app') && origin.includes('caleb-automated-bursary-clerance');
    
    if (!origin || allowed.includes(origin) || isVercelPreview) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsers
// NOTE: webhook route must use raw body — we'll override this in the webhook route
// Raw body needed for webhook signature validation
app.use('/api/webhook/paystack', express.raw({ type: 'application/json' }));

app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhook/paystack') return next();
  express.json()(req, res, next);
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Bursary Clearance API is running' });
});

// Routes will be mounted here as we build them
 app.use('/api/auth', require('./routes/auth'));
 app.use('/api/fees', require('./routes/fees'));
app.use('/api/payments', require('./routes/payments'));
 app.use('/api/webhook', require('./routes/webhook'));
 app.use('/api/clearance', require('./routes/clearance'));
 app.use('/api/reports', require('./routes/reports'));
 app.use('/api/users', require('./routes/users'));
 app.use('/api/notifications', require('./routes/notifications'));
 app.use('/api/hostels', require('./routes/hostels'));

// MongoDB connection + server start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });