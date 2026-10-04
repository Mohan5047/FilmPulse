import axios from 'axios';
import { initialMovies, initialReviews } from './mockData';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000
});

// Local storage helpers for static / demo deployment fallback
function getLocalMovies() {
  try {
    const stored = localStorage.getItem('cineverse_demo_movies');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    // Ignore
  }
  return initialMovies;
}

function saveLocalMovies(movies) {
  try {
    localStorage.setItem('cineverse_demo_movies', JSON.stringify(movies));
  } catch (e) {
    // Ignore
  }
}

function getLocalReviews() {
  try {
    const stored = localStorage.getItem('cineverse_demo_reviews');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    // Ignore
  }
  return initialReviews;
}

function saveLocalReviews(reviews) {
  try {
    localStorage.setItem('cineverse_demo_reviews', JSON.stringify(reviews));
  } catch (e) {
    // Ignore
  }
}

function getLocalWatchlist() {
  try {
    const stored = localStorage.getItem('cineverse_demo_watchlist');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    // Ignore
  }
  return [];
}

function saveLocalWatchlist(list) {
  try {
    localStorage.setItem('cineverse_demo_watchlist', JSON.stringify(list));
  } catch (e) {
    // Ignore
  }
}

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cineverse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: async (userData) => {
    try {
      return await api.post('/auth/register', userData);
    } catch (err) {
      // Demo fallback
      const demoUser = {
        id: Date.now(),
        username: userData.username,
        email: userData.email,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: 'user'
      };
      localStorage.setItem('cineverse_token', 'demo_token_' + Date.now());
      localStorage.setItem('cineverse_user', JSON.stringify(demoUser));
      return {
        data: {
          success: true,
          data: { user: demoUser, token: 'demo_token' }
        }
      };
    }
  },
  login: async (credentials) => {
    try {
      return await api.post('/auth/login', credentials);
    } catch (err) {
      // Demo fallback
      const demoUser = {
        id: 1,
        username: credentials.email ? credentials.email.split('@')[0] : 'cinephile',
        email: credentials.email || 'user@example.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: 'user'
      };
      localStorage.setItem('cineverse_token', 'demo_token_' + Date.now());
      localStorage.setItem('cineverse_user', JSON.stringify(demoUser));
      return {
        data: {
          success: true,
          data: { user: demoUser, token: 'demo_token' }
        }
      };
    }
  },
  getMe: async () => {
    try {
      return await api.get('/auth/me');
    } catch (err) {
      const stored = localStorage.getItem('cineverse_user');
      if (stored) {
        return { data: { success: true, data: JSON.parse(stored) } };
      }
      throw err;
    }
  }
};

// Movies endpoints
export const moviesAPI = {
  getAll: async (params = {}) => {
    try {
      return await api.get('/movies', { params });
    } catch (err) {
      // Static fallback
      let list = [...getLocalMovies()];
      const watchlist = getLocalWatchlist();
      list = list.map(m => ({ ...m, is_in_watchlist: watchlist.includes(m.id) }));

      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(m =>
          m.title.toLowerCase().includes(q) ||
          m.director.toLowerCase().includes(q) ||
          (Array.isArray(m.cast) ? m.cast.join(' ') : m.cast).toLowerCase().includes(q)
        );
      }

      if (params.genre && params.genre !== 'All') {
        list = list.filter(m =>
          Array.isArray(m.genres)
            ? m.genres.some(g => g.toLowerCase() === params.genre.toLowerCase())
            : m.genres.toLowerCase().includes(params.genre.toLowerCase())
        );
      }

      if (params.sort === 'highest_rated') {
        list.sort((a, b) => b.avg_rating - a.avg_rating);
      } else if (params.sort === 'release_year') {
        list.sort((a, b) => b.release_year - a.release_year);
      } else if (params.sort === 'title') {
        list.sort((a, b) => a.title.localeCompare(b.title));
      }

      return {
        data: {
          success: true,
          data: list,
          pagination: {
            page: 1,
            limit: list.length,
            total: list.length,
            totalPages: 1
          }
        }
      };
    }
  },
  getPrevious: async (params = {}) => {
    try {
      return await api.get('/movies/previous', { params });
    } catch (err) {
      let list = [...getLocalMovies()].filter(m => m.release_year < 2020);
      const watchlist = getLocalWatchlist();
      list = list.map(m => ({ ...m, is_in_watchlist: watchlist.includes(m.id) }));

      if (params.era && params.era !== 'all') {
        if (params.era === '2010s') list = list.filter(m => m.release_year >= 2010 && m.release_year <= 2019);
        else if (params.era === '2000s') list = list.filter(m => m.release_year >= 2000 && m.release_year <= 2009);
        else if (params.era === '90s') list = list.filter(m => m.release_year >= 1990 && m.release_year <= 1999);
        else if (params.era === 'vintage' || params.era === 'classic') list = list.filter(m => m.release_year < 1990);
      }

      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(m =>
          m.title.toLowerCase().includes(q) ||
          m.director.toLowerCase().includes(q) ||
          (Array.isArray(m.cast) ? m.cast.join(' ') : m.cast).toLowerCase().includes(q)
        );
      }

      if (params.genre && params.genre !== 'All') {
        list = list.filter(m =>
          Array.isArray(m.genres)
            ? m.genres.some(g => g.toLowerCase() === params.genre.toLowerCase())
            : m.genres.toLowerCase().includes(params.genre.toLowerCase())
        );
      }

      if (params.sort === 'highest_rated') {
        list.sort((a, b) => b.avg_rating - a.avg_rating);
      } else if (params.sort === 'oldest') {
        list.sort((a, b) => a.release_year - b.release_year);
      } else if (params.sort === 'newest') {
        list.sort((a, b) => b.release_year - a.release_year);
      }

      return {
        data: {
          success: true,
          data: list,
          eraStats: {
            all: getLocalMovies().filter(m => m.release_year < 2020).length,
            '2010s': getLocalMovies().filter(m => m.release_year >= 2010 && m.release_year <= 2019).length,
            '2000s': getLocalMovies().filter(m => m.release_year >= 2000 && m.release_year <= 2009).length,
            '90s': getLocalMovies().filter(m => m.release_year >= 1990 && m.release_year <= 1999).length,
            vintage: getLocalMovies().filter(m => m.release_year < 1990).length
          },
          pagination: {
            page: 1,
            limit: list.length,
            total: list.length,
            totalPages: 1
          }
        }
      };
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/movies/${id}`);
    } catch (err) {
      const movies = getLocalMovies();
      const movie = movies.find(m => String(m.id) === String(id)) || movies[0];
      const watchlist = getLocalWatchlist();
      return {
        data: {
          success: true,
          data: { ...movie, is_in_watchlist: watchlist.includes(movie.id) }
        }
      };
    }
  },
  getFeatured: async () => {
    try {
      return await api.get('/movies/featured');
    } catch (err) {
      const movies = getLocalMovies();
      const watchlist = getLocalWatchlist();
      const featured = movies[0];
      return {
        data: {
          success: true,
          data: { ...featured, is_in_watchlist: watchlist.includes(featured.id) }
        }
      };
    }
  },
  getGenres: async () => {
    try {
      return await api.get('/movies/genres');
    } catch (err) {
      const genresList = [
        { name: 'Action', count: 4 },
        { name: 'Sci-Fi', count: 4 },
        { name: 'Drama', count: 5 },
        { name: 'Adventure', count: 3 },
        { name: 'Animation', count: 2 },
        { name: 'Crime', count: 2 },
        { name: 'Thriller', count: 3 }
      ];
      return { data: { success: true, data: genresList } };
    }
  },
  create: async (movieData) => {
    try {
      return await api.post('/movies', movieData);
    } catch (err) {
      const movies = getLocalMovies();
      const newMovie = {
        ...movieData,
        id: Date.now(),
        avg_rating: 0,
        total_reviews: 0,
        created_at: new Date().toISOString(),
        is_in_watchlist: false
      };
      movies.unshift(newMovie);
      saveLocalMovies(movies);
      return { data: { success: true, data: newMovie } };
    }
  }
};

// Reviews endpoints
export const reviewsAPI = {
  getByMovieId: async (movieId) => {
    try {
      return await api.get(`/movies/${movieId}/reviews`);
    } catch (err) {
      const reviews = getLocalReviews();
      const filtered = reviews.filter(r => String(r.movie_id) === String(movieId));
      return { data: { success: true, data: filtered } };
    }
  },
  create: async (movieId, reviewData) => {
    try {
      return await api.post(`/movies/${movieId}/reviews`, reviewData);
    } catch (err) {
      const reviews = getLocalReviews();
      const user = JSON.parse(localStorage.getItem('cineverse_user') || '{"username":"cinephile","id":1}');
      const newReview = {
        id: Date.now(),
        movie_id: Number(movieId),
        user_id: user.id || 1,
        username: user.username || 'cinephile',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        rating: reviewData.rating,
        title: reviewData.title,
        content: reviewData.content,
        spoilers: reviewData.spoilers ? 1 : 0,
        likes_count: 0,
        created_at: new Date().toISOString()
      };
      reviews.unshift(newReview);
      saveLocalReviews(reviews);
      return { data: { success: true, data: newReview } };
    }
  },
  update: async (reviewId, reviewData) => {
    try {
      return await api.put(`/reviews/${reviewId}`, reviewData);
    } catch (err) {
      return { data: { success: true } };
    }
  },
  delete: async (reviewId) => {
    try {
      return await api.delete(`/reviews/${reviewId}`);
    } catch (err) {
      const reviews = getLocalReviews().filter(r => String(r.id) !== String(reviewId));
      saveLocalReviews(reviews);
      return { data: { success: true } };
    }
  },
  toggleLike: async (reviewId) => {
    try {
      return await api.post(`/reviews/${reviewId}/like`);
    } catch (err) {
      const reviews = getLocalReviews();
      const r = reviews.find(item => String(item.id) === String(reviewId));
      if (r) {
        r.likes_count = (r.likes_count || 0) + 1;
        saveLocalReviews(reviews);
      }
      return { data: { success: true, data: { likes_count: r ? r.likes_count : 1 } } };
    }
  },
  getUserReviews: async (userId) => {
    try {
      return await api.get(userId ? `/reviews/user/${userId}` : '/reviews/user/me');
    } catch (err) {
      const reviews = getLocalReviews();
      return { data: { success: true, data: reviews } };
    }
  }
};

// Watchlist endpoints
export const watchlistAPI = {
  getAll: async () => {
    try {
      return await api.get('/watchlist');
    } catch (err) {
      const watchlistIds = getLocalWatchlist();
      const movies = getLocalMovies().filter(m => watchlistIds.includes(m.id));
      return { data: { success: true, data: movies } };
    }
  },
  toggle: async (movieId) => {
    try {
      return await api.post(`/watchlist/toggle/${movieId}`);
    } catch (err) {
      let list = getLocalWatchlist();
      const numId = Number(movieId);
      let inWatchlist = false;
      if (list.includes(numId)) {
        list = list.filter(id => id !== numId);
      } else {
        list.push(numId);
        inWatchlist = true;
      }
      saveLocalWatchlist(list);
      return { data: { success: true, in_watchlist: inWatchlist } };
    }
  }
};

// Platform stats
export const statsAPI = {
  getStats: async () => {
    try {
      return await api.get('/stats');
    } catch (err) {
      const movies = getLocalMovies();
      return {
        data: {
          success: true,
          data: {
            totalMovies: movies.length,
            totalReviews: 24,
            averageRating: 4.8,
            totalUsers: 140
          }
        }
      };
    }
  }
};

export default api;
