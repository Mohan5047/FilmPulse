import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AddMovieModal from './components/AddMovieModal';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import PreviousMoviesPage from './pages/PreviousMoviesPage';
import MovieDetailPage from './pages/MovieDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WatchlistPage from './pages/WatchlistPage';
import ProfilePage from './pages/ProfilePage';
import { useAuth } from './context/AuthContext';

export default function App() {
  const [isAddMovieModalOpen, setIsAddMovieModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleOpenAddMovie = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsAddMovieModalOpen(true);
  };

  const handleMovieAdded = (newMovie) => {
    navigate(`/movie/${newMovie.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 selection:bg-amber-500 selection:text-black">
      <Navbar onOpenAddMovie={handleOpenAddMovie} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage onOpenAddMovie={handleOpenAddMovie} />} />
          <Route path="/previous-movies" element={<PreviousMoviesPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <WatchlistPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<HomePage onOpenAddMovie={handleOpenAddMovie} />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Add Movie Modal */}
      <AddMovieModal
        isOpen={isAddMovieModalOpen}
        onClose={() => setIsAddMovieModalOpen(false)}
        onMovieAdded={handleMovieAdded}
      />
    </div>
  );
}
