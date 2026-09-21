import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

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
    if (error.response && error.response.status === 401) {
      // If unauthorized and not on login page, remove stale token
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        // localStorage.removeItem('cineverse_token');
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me')
};

// Movies endpoints
export const moviesAPI = {
  getAll: (params) => api.get('/movies', { params }),
  getById: (id) => api.get(`/movies/${id}`),
  getFeatured: () => api.get('/movies/featured'),
  getGenres: () => api.get('/movies/genres'),
  create: (movieData) => api.post('/movies', movieData)
};

// Reviews endpoints
export const reviewsAPI = {
  getByMovieId: (movieId) => api.get(`/movies/${movieId}/reviews`),
  create: (movieId, reviewData) => api.post(`/movies/${movieId}/reviews`, reviewData),
  update: (reviewId, reviewData) => api.put(`/reviews/${reviewId}`, reviewData),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
  toggleLike: (reviewId) => api.post(`/reviews/${reviewId}/like`),
  getUserReviews: (userId) => api.get(userId ? `/reviews/user/${userId}` : '/reviews/user/me')
};

// Watchlist endpoints
export const watchlistAPI = {
  getAll: () => api.get('/watchlist'),
  toggle: (movieId) => api.post(`/watchlist/toggle/${movieId}`)
};

// Platform stats
export const statsAPI = {
  getStats: () => api.get('/stats')
};

export default api;
