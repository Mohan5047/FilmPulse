const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
function register(req, res) {
  try {
    const { username, email, password, avatar } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email, and password are required.' });
    }

    if (username.length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check existing
    const existing = db.prepare('SELECT id, email, username FROM users WHERE email = ? OR username = ?').get(email.toLowerCase(), username);
    if (existing) {
      if (existing.email === email.toLowerCase()) {
        return res.status(409).json({ success: false, message: 'Email is already registered.' });
      }
      return res.status(409).json({ success: false, message: 'Username is already taken.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const userAvatar = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;

    const result = db.prepare(`
      INSERT INTO users (username, email, password, avatar)
      VALUES (?, ?, ?, ?)
    `).run(username, email.toLowerCase(), hashedPassword, userAvatar);

    const newUser = {
      id: result.lastInsertRowid,
      username,
      email: email.toLowerCase(),
      avatar: userAvatar,
      role: 'user'
    };

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
}

// POST /api/auth/login
function login(req, res) {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ success: false, message: 'Email/username and password are required.' });
    }

    const user = db.prepare(`
      SELECT * FROM users 
      WHERE email = ? OR username = ?
    `).get(emailOrUsername.toLowerCase(), emailOrUsername);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role
    };

    const token = generateToken(userData);

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
}

// GET /api/auth/me
function getMe(req, res) {
  try {
    const user = db.prepare(`
      SELECT id, username, email, avatar, role, created_at
      FROM users 
      WHERE id = ?
    `).get(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Get user stats
    const reviewStats = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(AVG(rating), 0) as avgGivenRating
      FROM reviews
      WHERE user_id = ?
    `).get(user.id);

    const watchlistStats = db.prepare(`
      SELECT COUNT(*) as count FROM watchlist WHERE user_id = ?
    `).get(user.id);

    return res.json({
      success: true,
      user: {
        ...user,
        stats: {
          reviewsCount: reviewStats.count,
          avgRatingGiven: Math.round(reviewStats.avgGivenRating * 10) / 10,
          watchlistCount: watchlistStats.count
        }
      }
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

module.exports = {
  register,
  login,
  getMe
};
