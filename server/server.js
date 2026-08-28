import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import seoRoutes from './routes/seoRoutes.js';
import shippingRoutes from './routes/shippingRoutes.js';

import { errorHandler } from './middleware/errorLogger.js';


import { authenticateToken } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    req.rawBody = buf ? buf.toString('utf8') : '';
  },
}));

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/products', express.static(path.join(__dirname, '../public/products')));
app.use(authenticateToken);


// Sitemap & Robots.txt Routes (Root level)
app.use('/', seoRoutes);

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Parthvi Ayurveda E-Commerce Platform Engine',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/shipping', shippingRoutes);


// Static assets (if serving built frontend in production)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('Parthvi Ayurveda API Server Running on port ' + PORT);
  }
});

// Global Error Handler
app.use(errorHandler);

const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  Parthvi Ayurveda E-Commerce Server Running`);
      console.log(`  DB: Supabase PostgreSQL`);
      console.log(`  URL: http://localhost:${PORT}`);
      console.log(`  Health: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please terminate the process using port ${PORT} or specify a different PORT.`);
      } else {
        console.error('Server error:', err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};


startServer();
