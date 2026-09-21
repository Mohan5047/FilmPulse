const { db, updateMovieRating } = require('../config/db');

// GET /api/movies/:movieId/reviews
function getMovieReviews(req, res) {
  try {
    const { movieId } = req.params;
    const userId = req.user ? req.user.id : null;

    const query = `
      SELECT 
        r.*,
        u.username,
        u.avatar,
        ${userId ? `(SELECT COUNT(*) FROM review_likes rl WHERE rl.review_id = r.id AND rl.user_id = ${userId}) AS has_liked` : '0 AS has_liked'},
        ${userId ? `(CASE WHEN r.user_id = ${userId} THEN 1 ELSE 0 END) AS is_own_review` : '0 AS is_own_review'}
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.movie_id = ?
      ORDER BY r.likes_count DESC, r.created_at DESC
    `;

    const reviews = db.prepare(query).all(movieId);

    const formatted = reviews.map(r => ({
      ...r,
      has_liked: Boolean(r.has_liked),
      is_own_review: Boolean(r.is_own_review),
      contains_spoilers: Boolean(r.contains_spoilers)
    }));

    return res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('getMovieReviews error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
}

// POST /api/movies/:movieId/reviews
function createReview(req, res) {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;
    const { rating, title, content, contains_spoilers } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5 stars.' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Review headline is required.' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Review text is required.' });
    }

    // Verify movie exists
    const movie = db.prepare('SELECT id FROM movies WHERE id = ?').get(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    // Check existing review
    const existing = db.prepare('SELECT id FROM reviews WHERE movie_id = ? AND user_id = ?').get(movieId, userId);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this movie. You can edit your existing review instead.'
      });
    }

    const result = db.prepare(`
      INSERT INTO reviews (movie_id, user_id, rating, title, content, contains_spoilers)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      movieId,
      userId,
      parseFloat(rating),
      title.trim(),
      content.trim(),
      contains_spoilers ? 1 : 0
    );

    // Recalculate movie rating
    const updatedStats = updateMovieRating(movieId);

    const newReview = db.prepare(`
      SELECT 
        r.*,
        u.username,
        u.avatar,
        0 as has_liked,
        1 as is_own_review
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `).get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: {
        ...newReview,
        contains_spoilers: Boolean(newReview.contains_spoilers),
        has_liked: false,
        is_own_review: true
      },
      movieStats: updatedStats
    });
  } catch (error) {
    console.error('createReview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create review.' });
  }
}

// PUT /api/reviews/:id
function updateReview(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, title, content, contains_spoilers } = req.body;

    const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this review.' });
    }

    const newRating = rating ? parseFloat(rating) : review.rating;
    const newTitle = title ? title.trim() : review.title;
    const newContent = content ? content.trim() : review.content;
    const newSpoilers = contains_spoilers !== undefined ? (contains_spoilers ? 1 : 0) : review.contains_spoilers;

    db.prepare(`
      UPDATE reviews 
      SET rating = ?, title = ?, content = ?, contains_spoilers = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newRating, newTitle, newContent, newSpoilers, id);

    const updatedStats = updateMovieRating(review.movie_id);

    const updatedReview = db.prepare(`
      SELECT 
        r.*,
        u.username,
        u.avatar,
        (SELECT COUNT(*) FROM review_likes rl WHERE rl.review_id = r.id AND rl.user_id = ?) AS has_liked,
        1 as is_own_review
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `).get(userId, id);

    return res.json({
      success: true,
      message: 'Review updated successfully!',
      data: {
        ...updatedReview,
        has_liked: Boolean(updatedReview.has_liked),
        is_own_review: true,
        contains_spoilers: Boolean(updatedReview.contains_spoilers)
      },
      movieStats: updatedStats
    });
  } catch (error) {
    console.error('updateReview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update review.' });
  }
}

// DELETE /api/reviews/:id
function deleteReview(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this review.' });
    }

    db.prepare('DELETE FROM reviews WHERE id = ?').run(id);

    const updatedStats = updateMovieRating(review.movie_id);

    return res.json({
      success: true,
      message: 'Review deleted successfully!',
      movieStats: updatedStats
    });
  } catch (error) {
    console.error('deleteReview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
}

// POST /api/reviews/:id/like
function toggleLikeReview(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = db.prepare('SELECT id, likes_count FROM reviews WHERE id = ?').get(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const existingLike = db.prepare('SELECT id FROM review_likes WHERE review_id = ? AND user_id = ?').get(id, userId);

    let hasLiked = false;
    let newLikesCount = review.likes_count;

    if (existingLike) {
      // Unlike
      db.prepare('DELETE FROM review_likes WHERE review_id = ? AND user_id = ?').run(id, userId);
      newLikesCount = Math.max(0, review.likes_count - 1);
      db.prepare('UPDATE reviews SET likes_count = ? WHERE id = ?').run(newLikesCount, id);
      hasLiked = false;
    } else {
      // Like
      db.prepare('INSERT INTO review_likes (review_id, user_id) VALUES (?, ?)').run(id, userId);
      newLikesCount = review.likes_count + 1;
      db.prepare('UPDATE reviews SET likes_count = ? WHERE id = ?').run(newLikesCount, id);
      hasLiked = true;
    }

    return res.json({
      success: true,
      has_liked: hasLiked,
      likes_count: newLikesCount
    });
  } catch (error) {
    console.error('toggleLikeReview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle like.' });
  }
}

// GET /api/users/:userId/reviews or current user's reviews
function getUserReviews(req, res) {
  try {
    const targetUserId = req.params.userId || req.user.id;

    const reviews = db.prepare(`
      SELECT 
        r.*,
        m.title AS movie_title,
        m.poster_url AS movie_poster,
        m.release_year AS movie_year,
        m.avg_rating AS movie_avg_rating
      FROM reviews r
      JOIN movies m ON r.movie_id = m.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `).all(targetUserId);

    return res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('getUserReviews error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user reviews.' });
  }
}

module.exports = {
  getMovieReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleLikeReview,
  getUserReviews
};
