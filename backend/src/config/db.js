const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbFilePath = path.resolve(__dirname, '../../database.sqlite');
let rawDb = null;

function saveDb() {
  if (!rawDb) return;
  try {
    const data = rawDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFilePath, buffer);
  } catch (err) {
    console.error('Failed to persist database file:', err);
  }
}

const db = {
  exec(sql) {
    if (!rawDb) throw new Error('Database not initialized');
    rawDb.exec(sql);
    saveDb();
  },
  prepare(sql) {
    return {
      get(...params) {
        if (!rawDb) throw new Error('Database not initialized');
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const stmt = rawDb.prepare(sql);
        stmt.bind(flatParams);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        }
        stmt.free();
        return null;
      },
      all(...params) {
        if (!rawDb) throw new Error('Database not initialized');
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const stmt = rawDb.prepare(sql);
        stmt.bind(flatParams);
        const rows = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
      },
      run(...params) {
        if (!rawDb) throw new Error('Database not initialized');
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        rawDb.run(sql, flatParams);
        const rowIdRes = rawDb.exec("SELECT last_insert_rowid() AS id");
        const lastInsertRowid = (rowIdRes.length && rowIdRes[0].values.length) ? rowIdRes[0].values[0][0] : 0;
        saveDb();
        return { lastInsertRowid };
      }
    };
  }
};

async function initializeDatabase() {
  if (rawDb) return db;
  const SQL = await initSqlJs();
  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    rawDb = new SQL.Database(fileBuffer);
  } else {
    rawDb = new SQL.Database();
  }

  // Create tables if they don't exist
  rawDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      tagline TEXT,
      description TEXT NOT NULL,
      release_year INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      director TEXT NOT NULL,
      cast TEXT NOT NULL,
      genres TEXT NOT NULL,
      poster_url TEXT NOT NULL,
      backdrop_url TEXT NOT NULL,
      trailer_url TEXT,
      avg_rating REAL DEFAULT 0,
      total_reviews INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating REAL NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      contains_spoilers INTEGER DEFAULT 0,
      likes_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(movie_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      movie_id INTEGER NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
      UNIQUE(user_id, movie_id)
    );

    CREATE TABLE IF NOT EXISTS review_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(review_id, user_id)
    );
  `);

  saveDb();
  return db;
}

function updateMovieRating(movieId) {
  const stats = db.prepare(`
    SELECT 
      COUNT(*) AS count,
      COALESCE(AVG(rating), 0) AS average
    FROM reviews 
    WHERE movie_id = ?
  `).get(movieId);

  const roundedAvg = Math.round(stats.average * 10) / 10;

  db.prepare(`
    UPDATE movies 
    SET avg_rating = ?, total_reviews = ?
    WHERE id = ?
  `).run(roundedAvg, stats.count, movieId);

  return { avg_rating: roundedAvg, total_reviews: stats.count };
}

module.exports = {
  db,
  initializeDatabase,
  updateMovieRating
};
