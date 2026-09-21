import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Award, Star, Bookmark, MessageSquare, Calendar, Trash2, ArrowUpRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reviewsAPI } from '../services/api';
import StarRating from '../components/StarRating';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      if (!user) return;
      setLoading(true);
      try {
        const res = await reviewsAPI.getUserReviews();
        if (res.data.success) {
          setUserReviews(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load user reviews:', err);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
    refreshUser();
  }, [user?.id]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await reviewsAPI.delete(reviewId);
      if (res.data.success) {
        setUserReviews(prev => prev.filter(r => r.id !== reviewId));
        refreshUser();
      }
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Profile Header Hero */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl mb-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
            alt={user?.username}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-500/50 shadow-lg shadow-amber-500/20"
          />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
                {user?.username}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {user?.role || 'Critic'}
              </span>
            </div>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Member since {formatDate(user?.created_at || new Date())}
            </p>
          </div>

          <Link
            to="/watchlist"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <Bookmark className="w-4 h-4 text-amber-400" /> View Watchlist
          </Link>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10 text-center">
          <div className="p-3 rounded-2xl bg-white/[0.02]">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
              {user?.stats?.reviewsCount ?? userReviews.length}
            </span>
            <p className="text-xs uppercase tracking-wider text-slate-400 mt-1">
              Reviews Written
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.02]">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
              {user?.stats?.avgRatingGiven ? `${user.stats.avgRatingGiven} ★` : '—'}
            </span>
            <p className="text-xs uppercase tracking-wider text-slate-400 mt-1">
              Avg Rating Given
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.02]">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
              {user?.stats?.watchlistCount ?? 0}
            </span>
            <p className="text-xs uppercase tracking-wider text-slate-400 mt-1">
              Watchlist Items
            </p>
          </div>
        </div>
      </div>

      {/* User Reviews Section */}
      <div>
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <h2 className="text-2xl font-bold font-display text-white">
              My Film Reviews ({userReviews.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="min-h-[30vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : userReviews.length > 0 ? (
          <div className="space-y-4">
            {userReviews.map((review) => (
              <div
                key={review.id}
                className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition shadow-lg flex flex-col sm:flex-row gap-5 items-start"
              >
                {/* Movie Thumbnail */}
                <Link
                  to={`/movie/${review.movie_id}`}
                  className="w-20 sm:w-24 aspect-[2/3] shrink-0 rounded-xl overflow-hidden bg-slate-800 border border-white/10 group relative"
                >
                  <img
                    src={review.movie_poster}
                    alt={review.movie_title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </Link>

                {/* Review Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      to={`/movie/${review.movie_id}`}
                      className="text-lg font-bold text-white hover:text-amber-400 transition flex items-center gap-1.5"
                    >
                      <span>{review.movie_title}</span>
                      <span className="text-xs text-slate-500 font-normal">({review.movie_year})</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500" />
                    </Link>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-sm">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{review.rating} / 5</span>
                    </div>
                  </div>

                  <h4 className="text-base font-semibold text-slate-200">
                    {review.title}
                  </h4>

                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                    {review.content}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-white/5 mt-3">
                    <span>Reviewed on {formatDate(review.created_at)}</span>

                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition flex items-center gap-1"
                      title="Delete review"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/30 border border-dashed border-slate-800">
            <MessageSquare className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-white">No reviews published yet</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto mb-5">
              Explore our movie collection and leave your first rating!
            </p>
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-sm"
            >
              Browse Movies
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
