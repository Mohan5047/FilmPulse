const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

router.put('/:id', authenticate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);
router.post('/:id/like', authenticate, reviewController.toggleLikeReview);
router.get('/user/me', authenticate, reviewController.getUserReviews);
router.get('/user/:userId', reviewController.getUserReviews);

module.exports = router;
