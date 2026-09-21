const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const reviewController = require('../controllers/reviewController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, movieController.getMovies);
router.get('/featured', optionalAuth, movieController.getFeaturedMovie);
router.get('/genres', movieController.getGenres);
router.get('/:id', optionalAuth, movieController.getMovieById);
router.post('/', authenticate, movieController.createMovie);

// Nested reviews endpoints for a movie
router.get('/:movieId/reviews', optionalAuth, reviewController.getMovieReviews);
router.post('/:movieId/reviews', authenticate, reviewController.createReview);

module.exports = router;
