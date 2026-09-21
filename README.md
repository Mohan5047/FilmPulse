# 🎬 CineVerse — Full-Stack Movie Review & Rating Application

A modern, cinematic full-stack web application for discovering movies, rating films, writing critiques with spoiler protection, upvoting helpful reviews, and curating a personal watchlist.

---

## 🌟 Key Features

### 🎬 For Movie Lovers & Critics
- **Hero Spotlight**: Featured premier movie showcase with backdrop art, rating summary, and embedded YouTube trailer modal.
- **Dynamic Catalog**: Browse films across Sci-Fi, Action, Drama, Animation, Thriller, and more.
- **Search & Sort**: Instant search by title, director, or cast; sort by Highest Rated, Most Reviewed, Release Year, or Title.
- **Interactive Ratings & Reviews**:
  - 1 to 5 star rating system with interactive hover stars.
  - Review headline and rich critique formatting.
  - **Spoiler Guard**: Mark reviews containing plot spoilers—community members can click "Reveal Spoiler" when ready.
  - **Helpful Upvotes**: Like and highlight high-quality critiques.
  - Rating breakdown bar chart displaying the 5-star distribution.
- **Personal Watchlist**: 1-click bookmarking of films to watch later.
- **User Profile**: Track your review history, average rating given, and saved watchlist.
- **Add Movie Modal**: Submit new movies to the catalog with cast, director, trailer, and poster URLs.

### 🛡️ Architecture & Security
- **Authentication**: JWT token authentication with bcryptjs password hashing.
- **Zero-Config Database**: Embedded SQLite database (`database.sqlite`) powered by WebAssembly (`sql.js`), ensuring it runs on any machine with zero external database configuration.
- **Pre-seeded Dataset**: Comes pre-populated with 12 iconic movies (Inception, The Dark Knight, Interstellar, Dune: Part Two, Parasite, Spirited Away, etc.) and realistic community reviews.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) & npm

### 1. Start Both Backend & Frontend with One Command
From the root directory:
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

> Alternatively, run them separately:
> - Backend: `npm run backend:dev` (runs on port 5000)
> - Frontend: `npm run frontend` (runs on port 5173)

### 2. Reseed Database (Optional)
To reset the database with clean demo movies, users, and reviews:
```bash
npm run seed
```

---

## 🔑 Demo Credentials

A demo account is pre-configured and ready to use. You can also click **"Fill Demo Account"** on the Sign In page for one-click testing:

| Username | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| `cinephile` | `cinephile@example.com` | `password123` | Admin / Critic |
| `sarah_watches` | `sarah@example.com` | `password123` | User |
| `alex_critic` | `alex@example.com` | `password123` | User |

*You can also register a new account anytime via the Sign Up page!*

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`username`, `email`, `password`)
- `POST /api/auth/login` — Login with username/email and password; returns JWT token
- `GET /api/auth/me` — Get current user profile and activity stats (Bearer token required)

### Movies (`/api/movies`)
- `GET /api/movies` — List movies with optional query params (`search`, `genre`, `sort`, `page`, `limit`)
- `GET /api/movies/featured` — Get top-rated featured premiere movie
- `GET /api/movies/genres` — Get unique genres and movie counts
- `GET /api/movies/:id` — Get movie details and 5-star rating distribution
- `POST /api/movies` — Add a new movie (Auth required)

### Reviews (`/api/reviews` & `/api/movies/:id/reviews`)
- `GET /api/movies/:movieId/reviews` — Fetch all reviews for a movie
- `POST /api/movies/:movieId/reviews` — Submit a review (Auth required)
- `PUT /api/reviews/:id` — Update your existing review (Author only)
- `DELETE /api/reviews/:id` — Delete review (Author/Admin only)
- `POST /api/reviews/:id/like` — Toggle helpful vote on a review (Auth required)
- `GET /api/reviews/user/me` — Fetch all reviews written by current user

### Watchlist (`/api/watchlist`)
- `GET /api/watchlist` — Get all saved movies in user's watchlist (Auth required)
- `POST /api/watchlist/toggle/:movieId` — Add or remove a movie from watchlist (Auth required)

### System Metrics (`/api/stats`)
- `GET /api/stats` — Platform counts: total movies, total reviews, average platform rating, total users

---

## 🛠️ Project Structure

```
movie review/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js            # SQLite database schema, connections & persistence
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── movieController.js
│   │   │   ├── reviewController.js
│   │   │   └── watchlistController.js
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── movieRoutes.js
│   │   │   ├── reviewRoutes.js
│   │   │   └── watchlistRoutes.js
│   │   ├── seed/
│   │   │   └── seedData.js      # 12+ movies and review seed generator
│   │   └── server.js            # Express API server entry point
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddMovieModal.jsx # Modal to add new movies
│   │   │   ├── Footer.jsx        # Live community stats ticker
│   │   │   ├── HeroBanner.jsx    # Spotlight backdrop & trailer trigger
│   │   │   ├── MovieCard.jsx     # Card with rating badge & watchlist toggle
│   │   │   ├── Navbar.jsx        # Search, navigation & user avatar dropdown
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ReviewForm.jsx    # Rating input, headline, spoiler toggle
│   │   │   ├── ReviewList.jsx    # Reviews feed with likes & spoiler covers
│   │   │   ├── StarRating.jsx    # Interactive gold stars component
│   │   │   └── TrailerModal.jsx  # Responsive YouTube video modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global session state & helper methods
│   │   ├── pages/
│   │   │   ├── HomePage.jsx      # Film catalog, filters & sorting
│   │   │   ├── LoginPage.jsx     # Auth with demo login helper
│   │   │   ├── MovieDetailPage.jsx # Full movie specs, ratings & reviews
│   │   │   ├── ProfilePage.jsx   # User stats & personal reviews list
│   │   │   ├── RegisterPage.jsx  # New critic registration
│   │   │   └── WatchlistPage.jsx # Bookmarked films collection
│   │   ├── services/
│   │   │   └── api.js            # Axios client with interceptors
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── package.json                  # Root runner scripts
└── README.md                     # Documentation
```
