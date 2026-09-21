import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Star, Bookmark, Info, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { watchlistAPI } from '../services/api';
import TrailerModal from './TrailerModal';

export default function HeroBanner({ movie }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(Boolean(movie?.is_in_watchlist));
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);

  if (!movie) return null;

  const handleWatchlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoadingWatchlist(true);
    try {
      const res = await watchlistAPI.toggle(movie.id);
      if (res.data.success) {
        setInWatchlist(res.data.is_in_watchlist);
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    } finally {
      setLoadingWatchlist(false);
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-black/80 border border-white/10 group">
      {/* Backdrop Image */}
      <div className="relative h-[440px] sm:h-[500px] w-full overflow-hidden bg-slate-950">
        <img
          src={movie.backdrop_url || movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-102 transition-transform duration-700"
        />

        {/* Cinematic Vignette & Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/70 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 max-w-3xl">
        {/* Spotlight Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 w-fit">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Featured Premiere
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight leading-tight">
          {movie.title}
        </h1>

        {/* Tagline */}
        {movie.tagline && (
          <p className="text-sm sm:text-base text-amber-400/90 font-medium italic mt-1">
            "{movie.tagline}"
          </p>
        )}

        {/* Meta info row */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs sm:text-sm text-slate-300 my-4">
          <div className="flex items-center gap-1 text-amber-400 font-bold bg-black/50 px-2.5 py-1 rounded-lg border border-white/10">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>{Number(movie.avg_rating).toFixed(1)} / 5</span>
            <span className="text-slate-400 font-normal">({movie.total_reviews} reviews)</span>
          </div>

          <span className="font-semibold">{movie.release_year}</span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> {movie.duration} min
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Dir: {movie.director}</span>
        </div>

        {/* Synopsis teaser */}
        <p className="text-sm text-slate-300 line-clamp-2 max-w-2xl hidden sm:block mb-6">
          {movie.description}
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {movie.trailer_url && (
            <button
              onClick={() => setTrailerOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-600/30 transition transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" /> Watch Trailer
            </button>
          )}

          <Link
            to={`/movie/${movie.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-800/90 hover:bg-slate-700 text-white border border-white/10 hover:border-white/20 transition transform active:scale-95"
          >
            <Info className="w-4 h-4" /> Full Details & Reviews
          </Link>

          <button
            onClick={handleWatchlistToggle}
            disabled={loadingWatchlist}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition border ${
              inWatchlist
                ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/30'
                : 'bg-black/50 text-slate-300 border-white/10 hover:text-white hover:bg-black/80'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-black' : ''}`} />
            <span>{inWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
          </button>
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
