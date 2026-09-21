require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { db, initializeDatabase } = require('./config/db');
const { seed } = require('./seed/seedData');

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/watchlist', watchlistRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CineVerse API'
  });
});

// Platform stats endpoint
app.get('/api/stats', (req, res) => {
  try {
    const movieStats = db.prepare('SELECT COUNT(*) as movieCount FROM movies').get();
    const reviewStats = db.prepare('SELECT COUNT(*) as reviewCount, COALESCE(AVG(rating), 0) as avgRating FROM reviews').get();
    const userStats = db.prepare('SELECT COUNT(*) as userCount FROM users').get();

    res.json({
      success: true,
      data: {
        totalMovies: movieStats.movieCount,
        totalReviews: reviewStats.reviewCount,
        averageRating: Math.round(reviewStats.avgRating * 10) / 10,
        totalUsers: userStats.userCount
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch platform stats' });
  }
});

// Serve frontend static build in unified production deployments
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

async function startServer() {
  await initializeDatabase();

  // Auto-seed on first deployment if movie table is empty
  try {
    const movieCountRow = db.prepare('SELECT COUNT(*) as count FROM movies').get();
    if (!movieCountRow || movieCountRow.count === 0) {
      console.log('📦 Empty database detected. Auto-seeding initial movies & reviews...');
      await seed();
    }
  } catch (err) {
    console.warn('Auto-seed check note:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`🎬 CineVerse API Server running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer();
