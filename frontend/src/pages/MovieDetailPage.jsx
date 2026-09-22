import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, Clock, Calendar, User, Film, Play, Bookmark, 
  ArrowLeft, Edit3, MessageSquare, Loader2, Sparkles 
} from 'lucide-react';
import { moviesAPI, reviewsAPI, watchlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import TrailerModal from '../components/TrailerModal';

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  // Review form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    async function loadMovieAndReviews() {
      setLoading(true);
      try {
        const [movieRes, reviewsRes] = await Promise.all([
          moviesAPI.getById(id),
          reviewsAPI.getByMovieId(id)
        ]);

        if (movieRes.data.success) {
          setMovie(movieRes.data.data);
          setInWatchlist(Boolean(movieRes.data.data.is_in_watchlist));
        }
        if (reviewsRes.data.success) {
          setReviews(reviewsRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load movie details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMovieAndReviews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleWatchlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setWatchlistLoading(true);
    try {
      const res = await watchlistAPI.toggle(movie.id);
      if (res.data.success) {
        setInWatchlist(res.data.is_in_watchlist);
      }
    } catch (err) {
      console.error('Watchlist toggle error:', err);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleReviewSuccess = (savedReview, movieStats) => {
    setIsFormOpen(false);
    setEditingReview(null);

    // Update reviews list
    setReviews(prev => {
      const exists = prev.some(r => r.id === savedReview.id);
      if (exists) {
        return prev.map(r => r.id === savedReview.id ? savedReview : r);
      }
      return [savedReview, ...prev];
    });

    // Update movie stats
    if (movieStats) {
      setMovie(prev => ({
        ...prev,
        avg_rating: movieStats.avg_rating,
        total_reviews: movieStats.total_reviews,
        userReview: savedReview
      }));
    }
  };

  const handleReviewDeleted = (reviewId, movieStats) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    if (movieStats) {
      setMovie(prev => ({
        ...prev,
        avg_rating: movieStats.avg_rating,
        total_reviews: movieStats.total_reviews,
        userReview: null
      }));
    }
  };

  const handleEditClick = (review) => {
    setEditingReview(review);
    setIsFormOpen(true);
    // Scroll to review form
    const formElem = document.getElementById('review-section');
    if (formElem) {
      formElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Movie Not Found</h2>
        <p className="text-slate-400 mb-6">The film you are looking for does not exist or has been removed.</p>
        <Link to="/" className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-semibold">
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Calculate rating percentage distribution
  const totalReviewCount = movie.total_reviews || 0;
  const dist = movie.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div className="pb-20">
      {/* Back to Catalog Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Movies
        </Link>
      </div>

      {/* Cinematic Header / Backdrop Banner */}
      <div className="relative w-full overflow-hidden min-h-[420px] bg-slate-950 border-y border-white/5">
        <img
          src={movie.backdrop_url || movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover object-center absolute inset-0 opacity-25 filter blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-transparent to-[#07090e]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Movie Poster */}
            <div className="w-56 sm:w-64 shrink-0 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-2xl shadow-black border border-white/10 relative group">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover"
              />
              {movie.trailer_url && (
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs"
                >
                  <div className="p-3 rounded-full bg-red-600 text-white shadow-lg">
                    <Play className="w-6 h-6 fill-white" />
                  </div>
                </button>
              )}
            </div>

            {/* Movie Information Header */}
            <div className="flex-1 text-center md:text-left space-y-4">
              {/* Genres */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {movie.genres.map(genre => (
                  <span
                    key={genre}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Title & Tagline */}
              <div>
                <h1 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight leading-tight">
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="text-sm sm:text-base text-slate-400 italic font-medium mt-1">
                    "{movie.tagline}"
                  </p>
                )}
              </div>

              {/* Metadata row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <Calendar className="w-4 h-4 text-amber-400" /> {movie.release_year}
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" /> {movie.duration} minutes
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">
                  <span className="text-slate-500">Director:</span> {movie.director}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                {movie.trailer_url && (
                  <button
                    onClick={() => setTrailerOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition transform active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-white" /> Watch Trailer
                  </button>
                )}

                <button
                  onClick={handleWatchlistToggle}
                  disabled={watchlistLoading}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition border ${
                    inWatchlist
                      ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-900/90 text-slate-200 border-white/10 hover:border-white/30 hover:bg-slate-800'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-black' : ''}`} />
                  <span>{inWatchlist ? 'In Your Watchlist' : 'Add to Watchlist'}</span>
                </button>

                <button
                  onClick={() => {
                    if (!user) {
                      navigate('/login');
                      return;
                    }
                    setIsFormOpen(true);
                    setEditingReview(movie.userReview || null);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white/5 hover:bg-white/10 text-white border border-white/10 transition"
                >
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>{movie.userReview ? 'Edit Your Review' : 'Write a Review'}</span>
                </button>
              </div>

              {/* Starring Cast */}
              <div className="pt-2 text-xs sm:text-sm text-slate-400">
                <span className="font-semibold text-slate-200">Starring: </span>
                {movie.cast.join(', ')}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left Column: Synopsis & Reviews (2 Cols) */}
          <div className="lg:col-span-2 space-y-10">
            {/* Synopsis */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold font-display text-white border-b border-white/10 pb-2">
                Storyline & Synopsis
              </h2>
              <p className="text-slate-300 leading-relaxed text-base font-normal whitespace-pre-line">
                {movie.description}
              </p>
            </section>

            {/* Review Section */}
            <section id="review-section" className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-bold font-display text-white">
                    Audience Reviews ({reviews.length})
                  </h2>
                </div>

                {!isFormOpen && (
                  <button
                    onClick={() => {
                      if (!user) {
                        navigate('/login');
                        return;
                      }
                      setIsFormOpen(true);
                      setEditingReview(movie.userReview || null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {movie.userReview ? 'Edit Your Review' : 'Rate & Review'}
                  </button>
                )}
              </div>

              {/* Review Form Drawer / Modal */}
              {isFormOpen && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <ReviewForm
                    movieId={movie.id}
                    existingReview={editingReview}
                    onSuccess={handleReviewSuccess}
                    onCancel={() => {
                      setIsFormOpen(false);
                      setEditingReview(null);
                    }}
                  />
                </div>
              )}

              {/* Reviews List */}
              <ReviewList
                reviews={reviews}
                onReviewDeleted={handleReviewDeleted}
                onReviewEdit={handleEditClick}
              />
            </section>
          </div>

          {/* Right Column: Rating Breakdown Card (1 Col) */}
          <div className="space-y-6">
            {/* Rating Breakdown Card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl space-y-6 sticky top-24">
              <h3 className="text-base font-bold font-display text-white uppercase tracking-wider">
                Rating Breakdown
              </h3>

              {/* Big Score Display */}
              <div className="flex items-center gap-4">
                <div className="text-5xl font-black font-display text-amber-400">
                  {movie.avg_rating > 0 ? Number(movie.avg_rating).toFixed(1) : '—'}
                </div>
                <div>
                  <StarRating rating={movie.avg_rating} readOnly={true} size="md" />
                  <p className="text-xs text-slate-400 mt-1">
                    Based on {movie.total_reviews} community {movie.total_reviews === 1 ? 'rating' : 'ratings'}
                  </p>
                </div>
              </div>

              {/* 5-Star Distribution Bars */}
              <div className="space-y-2.5 pt-4 border-t border-white/10">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = dist[stars] || 0;
                  const pct = totalReviewCount > 0 ? Math.round((count / totalReviewCount) * 100) : 0;

                  return (
                    <div key={stars} className="flex items-center gap-3 text-xs">
                      <span className="w-7 font-bold text-slate-400 flex items-center gap-1">
                        {stars} <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      </span>

                      <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <span className="w-10 text-right text-slate-500 font-mono">
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* User Review Callout if not reviewed yet */}
              {!movie.userReview && (
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center">
                  <Sparkles className="w-6 h-6 mx-auto text-amber-400 mb-1.5" />
                  <p className="text-sm font-semibold text-white">Have you seen this film?</p>
                  <p className="text-xs text-slate-400 mt-0.5 mb-3">
                    Your critique helps the FilmPulse community discover great cinema.
                  </p>
                  <button
                    onClick={() => {
                      if (!user) {
                        navigate('/login');
                        return;
                      }
                      setIsFormOpen(true);
                    }}
                    className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition"
                  >
                    Rate It Now
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailerUrl={movie.trailer_url}
        movieTitle={movie.title}
      />
    </div>
  );
}
