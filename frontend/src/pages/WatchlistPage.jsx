import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Film, Loader2, Trash2, Star, Clock } from 'lucide-react';
import { watchlistAPI } from '../services/api';
import MovieCard from '../components/MovieCard';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const res = await watchlistAPI.getAll();
      if (res.data.success) {
        setWatchlist(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleWatchlistChange = (movieId, isIn) => {
    if (!isIn) {
      setWatchlist(prev => prev.filter(m => m.id !== movieId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Bookmark className="w-5 h-5 fill-amber-400" />
            </div>
            <h1 className="text-3xl font-black font-display text-white">
              My Watchlist
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Movies you've saved to watch and review later.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {watchlist.length} {watchlist.length === 1 ? 'Movie' : 'Movies'} Saved
        </span>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : watchlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {watchlist.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onWatchlistChange={handleWatchlistChange}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 rounded-3xl bg-slate-900/30 border border-dashed border-slate-800">
          <Bookmark className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-xl font-bold text-white">Your watchlist is empty</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto mb-6">
            Click the bookmark icon on any movie card to save it for your next movie night.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition transform active:scale-95"
          >
            <Film className="w-4 h-4" /> Explore Movies
          </Link>
        </div>
      )}
    </div>
  );
}
