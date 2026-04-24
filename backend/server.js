const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';

// Security middleware
app.use(helmet());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS
const corsOptions = {
  origin: NODE_ENV === 'production'
    ? FRONTEND_URL
    : ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000', 'http://localhost:5000', 'null'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const { authenticateAdmin } = require('./routes/auth');
const { bookingOps, contactOps, reviewOps } = require('./db');

// ─── PUBLIC ROUTES ───

// POST /api/book - Public booking submission
app.post('/api/book',
  async (req, res) => {
    try {
      const { name, email, service, date, phone, message } = req.body;
      if (!name || !email || !service || !date) {
        return res.status(400).json({ message: 'Name, email, service and date are required' });
      }
      const booking = await bookingOps.create({
        name, email, service, date,
        phone: phone || '',
        message: message || '',
        status: 'pending'
      });
      res.status(201).json({ success: true, data: booking });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// POST /api/review - Public review submission
app.post('/api/review',
  async (req, res) => {
    try {
      const { name, email, rating, comment } = req.body;
      if (!name || !email || !rating || !comment) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be 1-5' });
      }
      const review = await reviewOps.create({ name, email, rating: parseInt(rating), comment });
      res.status(201).json({ success: true, data: review });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// GET /api/reviews - Public reviews (approved only)
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await reviewOps.find();
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/contact - Public contact submission
app.post('/api/contact',
  async (req, res) => {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      const contact = await contactOps.create({ name, email, message, status: 'unresolved' });
      res.status(201).json({ success: true, data: contact });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// POST /api/admin/login - Admin login
app.use('/api/admin/login', authRoutes.router);

// ─── PROTECTED ADMIN ROUTES ───

// GET /api/admin/bookings
app.get('/api/admin/bookings', authenticateAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    let bookings = await bookingOps.find(status ? { status } : {});
    if (search) {
      const q = search.toLowerCase();
      bookings = bookings.filter(b =>
        (b.name && b.name.toLowerCase().includes(q)) ||
        (b.email && b.email.toLowerCase().includes(q)) ||
        (b.service && b.service.toLowerCase().includes(q))
      );
    }
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/update/:id
app.post('/api/admin/update/:id', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const booking = await bookingOps.updateStatus(req.params.id, status);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/booking/:id
app.delete('/api/admin/booking/:id', authenticateAdmin, async (req, res) => {
  try {
    const booking = await bookingOps.delete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ success: true, message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/reviews
app.get('/api/admin/reviews', authenticateAdmin, async (req, res) => {
  try {
    const reviews = await reviewOps.find();
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/review/:id
app.delete('/api/admin/review/:id', authenticateAdmin, async (req, res) => {
  try {
    const review = await reviewOps.delete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/contacts
app.get('/api/admin/contacts', authenticateAdmin, async (req, res) => {
  try {
    const contacts = await contactOps.find();
    res.json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/contact/:id/toggle
app.post('/api/admin/contact/:id/toggle', authenticateAdmin, async (req, res) => {
  try {
    const contact = await contactOps.toggleResolved(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/stats
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const [totalBookings, pendingBookings, acceptedBookings, rejectedBookings, totalReviews, totalContacts] = await Promise.all([
      bookingOps.count(),
      bookingOps.count({ status: 'pending' }),
      bookingOps.count({ status: 'accepted' }),
      bookingOps.count({ status: 'rejected' }),
      reviewOps.count(),
      contactOps.count()
    ]);
    res.json({
      success: true,
      data: {
        totalBookings,
        pendingBookings,
        acceptedBookings,
        rejectedBookings,
        totalReviews,
        totalContacts
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root
app.get('/', (req, res) => res.send('City Mate API running!'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: NODE_ENV === 'production' ? 'Internal Server Error' : err.message });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${NODE_ENV})`);
});

// Connect to MongoDB
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
      console.error('MongoDB connection error:', err.message);
      console.log('Server running with in-memory fallback');
    });
} else {
  console.log('No MONGO_URI provided. Server running in memory-only mode.');
}

module.exports = { app, server };

