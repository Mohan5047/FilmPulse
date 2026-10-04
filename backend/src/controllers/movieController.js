const { db } = require('../config/db');

// GET /api/movies
function getMovies(req, res) {
  try {
    const { search, genre, sort = 'highest_rated', page = 1, limit = 12, era } = req.query;
    const userId = req.user ? req.user.id : null;

    let whereClauses = [];
    let params = [];

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      whereClauses.push(`(m.title LIKE ? OR m.director LIKE ? OR m."cast" LIKE ? OR m.description LIKE ?)`);
      params.push(term, term, term, term);
    }

    if (genre && genre.trim() !== '' && genre.toLowerCase() !== 'all') {
      whereClauses.push(`m.genres LIKE ?`);
      params.push(`%${genre.trim()}%`);
    }

    if (era === 'previous') {
      whereClauses.push(`m.release_year < 2020`);
    } else if (era === 'recent') {
      whereClauses.push(`m.release_year >= 2020`);
    } else if (era === '2010s') {
      whereClauses.push(`m.release_year BETWEEN 2010 AND 2019`);
    } else if (era === '2000s') {
      whereClauses.push(`m.release_year BETWEEN 2000 AND 2009`);
    } else if (era === '90s') {
      whereClauses.push(`m.release_year BETWEEN 1990 AND 1999`);
    } else if (era === 'vintage' || era === 'classic') {
      whereClauses.push(`m.release_year < 1990`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    let orderSql = 'ORDER BY avg_rating DESC, total_reviews DESC';
    if (sort === 'most_reviewed') {
      orderSql = 'ORDER BY total_reviews DESC, avg_rating DESC';
    } else if (sort === 'newest') {
      orderSql = 'ORDER BY release_year DESC, id DESC';
    } else if (sort === 'oldest') {
      orderSql = 'ORDER BY release_year ASC';
    } else if (sort === 'title_asc') {
      orderSql = 'ORDER BY title ASC';
    } else if (sort === 'highest_rated') {
      orderSql = 'ORDER BY avg_rating DESC, total_reviews DESC';
    }

    // Count total
    const countRow = db.prepare(`SELECT COUNT(*) as total FROM movies m ${whereSql}`).get(...params);
    const total = countRow ? countRow.total : 0;

    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    // Query movies
    const moviesQuery = `
      SELECT 
        m.*,
        ${userId ? `(SELECT COUNT(*) FROM watchlist w WHERE w.movie_id = m.id AND w.user_id = ${userId}) AS is_in_watchlist` : '0 AS is_in_watchlist'}
      FROM movies m
      ${whereSql}
      ${orderSql}
      LIMIT ? OFFSET ?
    `;

    const movies = db.prepare(moviesQuery).all(...params, parseInt(limit), offset);

    // Format genres and cast into arrays
    const formatted = movies.map(m => ({
      ...m,
      is_in_watchlist: Boolean(m.is_in_watchlist),
      genres: m.genres ? m.genres.split(',').map(g => g.trim()) : [],
      cast: m.cast ? m.cast.split(',').map(c => c.trim()) : []
    }));

    return res.json({
      success: true,
      data: formatted,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('getMovies error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch movies.' });
  }
}

// GET /api/movies/:id
function getMovieById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const movie = db.prepare(`
      SELECT 
        m.*,
        ${userId ? `(SELECT COUNT(*) FROM watchlist w WHERE w.movie_id = m.id AND w.user_id = ${userId}) AS is_in_watchlist` : '0 AS is_in_watchlist'}
      FROM movies m
      WHERE m.id = ?
    `).get(id);

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    // Rating distribution (5, 4, 3, 2, 1)
    const distributionRows = db.prepare(`
      SELECT CAST(ROUND(rating) AS INT) as star, COUNT(*) as count 
      FROM reviews 
      WHERE movie_id = ? 
      GROUP BY star
    `).all(id);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    distributionRows.forEach(row => {
      if (row.star >= 1 && row.star <= 5) {
        distribution[row.star] = row.count;
      }
    });

    // Check if current user has already reviewed
    let userReview = null;
    if (userId) {
      userReview = db.prepare(`
        SELECT * FROM reviews WHERE movie_id = ? AND user_id = ?
      `).get(id, userId);
    }

    const formattedMovie = {
      ...movie,
      is_in_watchlist: Boolean(movie.is_in_watchlist),
      genres: movie.genres ? movie.genres.split(',').map(g => g.trim()) : [],
      cast: movie.cast ? movie.cast.split(',').map(c => c.trim()) : [],
      ratingDistribution: distribution,
      userReview: userReview || null
    };

    return res.json({ success: true, data: formattedMovie });
  } catch (error) {
    console.error('getMovieById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch movie details.' });
  }
}

// GET /api/movies/featured
function getFeaturedMovie(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const movie = db.prepare(`
      SELECT 
        m.*,
        ${userId ? `(SELECT COUNT(*) FROM watchlist w WHERE w.movie_id = m.id AND w.user_id = ${userId}) AS is_in_watchlist` : '0 AS is_in_watchlist'}
      FROM movies m
      ORDER BY avg_rating DESC, total_reviews DESC
      LIMIT 1
    `).get();

    if (!movie) {
      return res.status(404).json({ success: false, message: 'No featured movie available.' });
    }

    return res.json({
      success: true,
      data: {
        ...movie,
        is_in_watchlist: Boolean(movie.is_in_watchlist),
        genres: movie.genres ? movie.genres.split(',').map(g => g.trim()) : [],
        cast: movie.cast ? movie.cast.split(',').map(c => c.trim()) : []
      }
    });
  } catch (error) {
    console.error('getFeaturedMovie error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch featured movie.' });
  }
}

// GET /api/movies/genres
function getGenres(req, res) {
  try {
    const rows = db.prepare(`SELECT genres FROM movies`).all();
    const genreMap = {};

    rows.forEach(r => {
      if (r.genres) {
        r.genres.split(',').forEach(g => {
          const trimmed = g.trim();
          if (trimmed) {
            genreMap[trimmed] = (genreMap[trimmed] || 0) + 1;
          }
        });
      }
    });

    const genreList = Object.keys(genreMap).sort().map(name => ({
      name,
      count: genreMap[name]
    }));

    return res.json({ success: true, data: genreList });
  } catch (error) {
    console.error('getGenres error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch genres.' });
  }
}

// POST /api/movies
function createMovie(req, res) {
  try {
    const {
      title,
      tagline,
      description,
      release_year,
      duration,
      director,
      cast,
      genres,
      poster_url,
      backdrop_url,
      trailer_url
    } = req.body;

    if (!title || !description || !release_year || !director || !genres || !poster_url) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, release year, director, genres, and poster image are required.'
      });
    }

    const castString = Array.isArray(cast) ? cast.join(', ') : (cast || '');
    const genresString = Array.isArray(genres) ? genres.join(', ') : (genres || '');

    const result = db.prepare(`
      INSERT INTO movies (
        title, tagline, description, release_year, duration, 
        director, cast, genres, poster_url, backdrop_url, trailer_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      tagline || '',
      description,
      parseInt(release_year),
      parseInt(duration) || 120,
      director,
      castString,
      genresString,
      poster_url,
      backdrop_url || poster_url,
      trailer_url || ''
    );

    const newMovie = db.prepare('SELECT * FROM movies WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Movie added successfully!',
      data: {
        ...newMovie,
        genres: newMovie.genres.split(',').map(g => g.trim()),
        cast: newMovie.cast.split(',').map(c => c.trim())
      }
    });
  } catch (error) {
    console.error('createMovie error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create movie.' });
  }
}

// GET /api/movies/previous
function getPreviousMovies(req, res) {
  try {
    const { search, genre, sort = 'highest_rated', era = 'all', page = 1, limit = 16 } = req.query;
    const userId = req.user ? req.user.id : null;

    let whereClauses = ['m.release_year < 2020'];
    let params = [];

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      whereClauses.push(`(m.title LIKE ? OR m.director LIKE ? OR m."cast" LIKE ? OR m.description LIKE ?)`);
      params.push(term, term, term, term);
    }

    if (genre && genre.trim() !== '' && genre.toLowerCase() !== 'all') {
      whereClauses.push(`m.genres LIKE ?`);
      params.push(`%${genre.trim()}%`);
    }

    // Sub-era filtering
    if (era === '2010s') {
      whereClauses.push(`m.release_year BETWEEN 2010 AND 2019`);
    } else if (era === '2000s') {
      whereClauses.push(`m.release_year BETWEEN 2000 AND 2009`);
    } else if (era === '90s') {
      whereClauses.push(`m.release_year BETWEEN 1990 AND 1999`);
    } else if (era === 'vintage' || era === 'classic') {
      whereClauses.push(`m.release_year < 1990`);
    }

    const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

    let orderSql = 'ORDER BY avg_rating DESC, total_reviews DESC';
    if (sort === 'oldest') {
      orderSql = 'ORDER BY release_year ASC';
    } else if (sort === 'newest') {
      orderSql = 'ORDER BY release_year DESC';
    } else if (sort === 'most_reviewed') {
      orderSql = 'ORDER BY total_reviews DESC, avg_rating DESC';
    } else if (sort === 'title_asc') {
      orderSql = 'ORDER BY title ASC';
    } else if (sort === 'highest_rated') {
      orderSql = 'ORDER BY avg_rating DESC, total_reviews DESC';
    }

    const countRow = db.prepare(`SELECT COUNT(*) as total FROM movies m ${whereSql}`).get(...params);
    const total = countRow ? countRow.total : 0;

    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const moviesQuery = `
      SELECT 
        m.*,
        ${userId ? `(SELECT COUNT(*) FROM watchlist w WHERE w.movie_id = m.id AND w.user_id = ${userId}) AS is_in_watchlist` : '0 AS is_in_watchlist'}
      FROM movies m
      ${whereSql}
      ${orderSql}
      LIMIT ? OFFSET ?
    `;

    const movies = db.prepare(moviesQuery).all(...params, parseInt(limit), offset);

    // Compute era counts
    const eraStats = {
      all: db.prepare(`SELECT COUNT(*) as c FROM movies WHERE release_year < 2020`).get().c,
      '2010s': db.prepare(`SELECT COUNT(*) as c FROM movies WHERE release_year BETWEEN 2010 AND 2019`).get().c,
      '2000s': db.prepare(`SELECT COUNT(*) as c FROM movies WHERE release_year BETWEEN 2000 AND 2009`).get().c,
      '90s': db.prepare(`SELECT COUNT(*) as c FROM movies WHERE release_year BETWEEN 1990 AND 1999`).get().c,
      vintage: db.prepare(`SELECT COUNT(*) as c FROM movies WHERE release_year < 1990`).get().c
    };

    const formatted = movies.map(m => ({
      ...m,
      is_in_watchlist: Boolean(m.is_in_watchlist),
      genres: m.genres ? m.genres.split(',').map(g => g.trim()) : [],
      cast: m.cast ? m.cast.split(',').map(c => c.trim()) : []
    }));

    return res.json({
      success: true,
      data: formatted,
      eraStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('getPreviousMovies error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch previous movies.' });
  }
}

module.exports = {
  getMovies,
  getPreviousMovies,
  getMovieById,
  getFeaturedMovie,
  getGenres,
  createMovie
};
