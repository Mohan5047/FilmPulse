import React, { useState } from 'react';
import { X, Film, AlertTriangle, Plus, Loader2 } from 'lucide-react';
import { moviesAPI } from '../services/api';

const AVAILABLE_GENRES = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 
  'Crime', 'Drama', 'Fantasy', 'History', 'Horror', 
  'Music', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War'
];

export default function AddMovieModal({ isOpen, onClose, onMovieAdded }) {
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    release_year: new Date().getFullYear(),
    duration: 120,
    director: '',
    cast: '',
    genres: ['Action', 'Sci-Fi'],
    poster_url: '',
    backdrop_url: '',
    trailer_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleGenreToggle = (genre) => {
    setFormData(prev => {
      const exists = prev.genres.includes(genre);
      return {
        ...prev,
        genres: exists ? prev.genres.filter(g => g !== genre) : [...prev.genres, genre]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.director || !formData.poster_url) {
      setError('Please fill out all required fields (title, director, synopsis, poster image).');
      return;
    }

    if (formData.genres.length === 0) {
      setError('Please select at least one genre.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        genres: formData.genres.join(', ')
      };

      const res = await moviesAPI.create(payload);
      if (res.data.success) {
        onMovieAdded && onMovieAdded(res.data.data);
        onClose();
      }
    } catch (err) {
      console.error('Failed to create movie:', err);
      setError(err.response?.data?.message || 'Failed to add movie. Make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-dropdown rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Film className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold font-display text-white">
              Add New Movie
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Movie Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Blade Runner 2049"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 text-white border border-slate-700 focus:border-amber-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Tagline
              </label>
              <input
                type="text"
                placeholder="e.g. The key to the future is finally unearthed."
                value={formData.tagline}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 text-white border border-slate-700 focus:border-amber-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Synopsis / Plot Description *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Provide a compelling synopsis of the movie plot..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 text-white border border-slate-700 focus:border-amber-500 outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Release Year *
              </label>
              <input
                type="number"
                required
                min={1900}
                max={2035}
                value={formData.release_year}
                onChange={e => setFormData({ ...formData, release_year: parseInt(e.target.value) || 2024 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 text-white border border-slate-700 focus:border-amber-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Duration (minutes)
              </label>
              <input
                type="number"
                min={1}
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 120 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 text-white border border-slate-700 focus:border-amber-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Director *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Denis Villeneuve"
                value={formData.director}
                onChange={e => setFormData({ ...formData, director: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 text-white border border-slate-700 focus:border-amber-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Starring Cast (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Ryan Gosling, Harrison Ford, Ana de Armas"
              value={formData.cast}
              onChange={e => setFormData({ ...formData, cast: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 text-white border border-slate-700 focus:border-amber-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Genres * (Pick 1 or more)
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              {AVAILABLE_GENRES.map(genre => {
                const selected = formData.genres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleGenreToggle(genre)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                      selected
                        ? 'bg-amber-500 text-black font-semibold'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Poster Image URL *
              </label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={formData.poster_url}
                onChange={e => setFormData({ ...formData, poster_url: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 text-white border border-slate-700 focus:border-amber-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Backdrop Image URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.backdrop_url}
                onChange={e => setFormData({ ...formData, backdrop_url: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 text-white border border-slate-700 focus:border-amber-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              YouTube Trailer URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.trailer_url}
              onChange={e => setFormData({ ...formData, trailer_url: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 text-white border border-slate-700 focus:border-amber-500 outline-none text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20 transition transform active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Save Movie
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
