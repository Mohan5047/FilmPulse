const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, watchlistController.getWatchlist);
router.post('/toggle/:movieId', authenticate, watchlistController.toggleWatchlist);

module.exports = router;
