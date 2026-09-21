const { db } = require('../config/db');

// GET /api/watchlist
function getWatchlist(req, res) {
  try {
    const userId = req.user.id;

    const movies = db.prepare(`
      SELECT 
        m.*,
        w.added_at,
        1 AS is_in_watchlist
      FROM watchlist w
      JOIN movies m ON w.movie_id = m.id
      WHERE w.user_id = ?
      ORDER BY w.added_at DESC
    `).all(userId);

    const formatted = movies.map(m => ({
      ...m,
      is_in_watchlist: true,
      genres: m.genres ? m.genres.split(',').map(g => g.trim()) : [],
      cast: m.cast ? m.cast.split(',').map(c => c.trim()) : []
    }));

    return res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('getWatchlist error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch watchlist.' });
  }
}

// POST /api/watchlist/toggle/:movieId
function toggleWatchlist(req, res) {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    // Check movie exists
    const movie = db.prepare('SELECT id, title FROM movies WHERE id = ?').get(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    const existing = db.prepare('SELECT id FROM watchlist WHERE user_id = ? AND movie_id = ?').get(userId, movieId);

    if (existing) {
      db.prepare('DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?').run(userId, movieId);
      return res.json({
        success: true,
        is_in_watchlist: false,
        message: `Removed "${movie.title}" from watchlist.`
      });
    } else {
      db.prepare('INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)').run(userId, movieId);
      return res.json({
        success: true,
        is_in_watchlist: true,
        message: `Added "${movie.title}" to watchlist!`
      });
    }
  } catch (error) {
    console.error('toggleWatchlist error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update watchlist.' });
  }
}

module.exports = {
  getWatchlist,
  toggleWatchlist
};
