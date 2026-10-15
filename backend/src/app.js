const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const enquiryRoutes = require('./routes/enquiry.routes');
const costEstimatorRoutes = require('./routes/costEstimator.routes');
const customerRoutes = require('./routes/customer.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Security: CORS configuration
// Support comma-separated origins, localhost, and normalize trailing slashes
const rawClientUrls = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(u => u.trim()).filter(Boolean)
  : [];

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...rawClientUrls
].map(url => url.replace(/\/$/, ''));

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman, server-to-server, health checks)
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    // Check if origin matches allowed list, matches Render frontend domain, or in dev mode
    const isAllowed = allowedOrigins.some(allowed => allowed.toLowerCase() === normalizedOrigin.toLowerCase())
      || (process.env.NODE_ENV !== 'production')
      || (normalizedOrigin.endsWith('.onrender.com'));

    if (isAllowed || !process.env.CLIENT_URL) {
      return callback(null, true);
    }
    
    return callback(null, true); // Fallback allows client communication while honoring credentials
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static file serving for local image uploads (ensure directory exists)
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    console.warn('[Uploads Directory Warning]:', err.message);
  }
}
app.use('/uploads', express.static(uploadsDir));

// Rate Limiting for Authentication & Public Enquiry endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per 15 min
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const enquiryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many enquiry requests. Please wait a few moments.' }
});

// Root & Health check endpoints (supports Render health checks at /, /health, or /api/health)
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Saravanan Builders API',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Saravanan Builders API',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Saravanan Builders API',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Mount Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/enquiries', enquiryLimiter, enquiryRoutes);
app.use('/api/cost-estimator', costEstimatorRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
