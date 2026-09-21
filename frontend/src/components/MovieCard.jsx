import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Bookmark, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { watchlistAPI } from '../services/api';

export default function MovieCard({ movie, onWatchlistChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inWatchlist, setInWatchlist] = useState(Boolean(movie.is_in_watchlist));
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);

  const handleWatchlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    setLoadingWatchlist(true);
    try {
      const res = await watchlistAPI.toggle(movie.id);
      if (res.data.success) {
        setInWatchlist(res.data.is_in_watchlist);
        if (onWatchlistChange) {
          onWatchlistChange(movie.id, res.data.is_in_watchlist);
        }
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    } finally {
      setLoadingWatchlist(false);
    }
  };

  // Convert minutes to e.g. "2h 28m"
  const formatDuration = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden bg-slate-900/60 border border-white/5 hover:border-amber-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1.5">
      <Link to={`/movie/${movie.id}`} className="relative block aspect-[2/3] w-full overflow-hidden bg-slate-800">
        {/* Poster Image */}
        <img
          src={movie.poster_url}
          alt={movie.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          {/* Rating Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-amber-400 font-bold text-xs shadow-lg">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.avg_rating > 0 ? Number(movie.avg_rating).toFixed(1) : 'NR'}</span>
          </div>

          {/* Watchlist Bookmark Button */}
          <button
            type="button"
            onClick={handleWatchlistToggle}
            disabled={loadingWatchlist}
            className={`pointer-events-auto p-2 rounded-full backdrop-blur-md transition-all duration-200 border ${
              inWatchlist
                ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/30 scale-105'
                : 'bg-black/60 text-slate-300 border-white/10 hover:text-amber-400 hover:bg-black/90 hover:scale-110'
            }`}
            title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-black' : ''}`} />
          </button>
        </div>

        {/* Bottom meta badge on image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
          <span className="font-semibold text-white/90 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
            {movie.release_year}
          </span>
          {movie.duration && (
            <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm text-slate-300">
              <Clock className="w-3 h-3 text-slate-400" />
              {formatDuration(movie.duration)}
            </span>
          )}
        </div>
      </Link>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-4">
        <Link to={`/movie/${movie.id}`} className="group-hover:text-amber-400 transition-colors">
          <h3 className="font-bold text-base text-white line-clamp-1 leading-snug">
            {movie.title}
          </h3>
        </Link>
        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
          Dir: {movie.director}
        </p>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {Array.isArray(movie.genres) && movie.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/5"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Reviews count */}
        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            {movie.total_reviews} {movie.total_reviews === 1 ? 'review' : 'reviews'}
          </span>
          <Link
            to={`/movie/${movie.id}`}
            className="text-amber-400/90 hover:text-amber-300 font-semibold flex items-center gap-0.5"
          >
            Review &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
