import React, { useState } from 'react';
import { Star, AlertTriangle, Send, Loader2 } from 'lucide-react';
import StarRating from './StarRating';
import { reviewsAPI } from '../services/api';

export default function ReviewForm({ movieId, existingReview, onSuccess, onCancel }) {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [content, setContent] = useState(existingReview?.content || '');
  const [spoilers, setSpoilers] = useState(Boolean(existingReview?.contains_spoilers));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please provide both a headline and review text.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let res;
      if (existingReview) {
        res = await reviewsAPI.update(existingReview.id, {
          rating,
          title,
          content,
          contains_spoilers: spoilers
        });
      } else {
        res = await reviewsAPI.create(movieId, {
          rating,
          title,
          content,
          contains_spoilers: spoilers
        });
      }

      if (res.data.success) {
        onSuccess && onSuccess(res.data.data, res.data.movieStats);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      setError(err.response?.data?.message || 'Failed to submit your review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl">
      <h3 className="text-xl font-bold font-display text-white mb-2">
        {existingReview ? 'Update Your Review' : 'Write Your Review'}
      </h3>
      <p className="text-sm text-slate-400 mb-6">
        Share your rating, thoughts, and critique with the CineVerse movie community.
      </p>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Star Rating Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Your Rating
          </label>
          <div className="flex items-center gap-4 bg-slate-900/60 p-3 rounded-xl border border-white/5 w-fit">
            <StarRating
              rating={rating}
              size="lg"
              onRatingChange={(newRating) => setRating(newRating)}
              showScore={true}
            />
            <span className="text-sm font-semibold text-slate-300">
              {rating === 5 && '🌟 Masterpiece'}
              {rating === 4 && '👍 Great Watch'}
              {rating === 3 && '😐 Average'}
              {rating === 2 && '👎 Disappointing'}
              {rating === 1 && '🚫 Terrible'}
            </span>
          </div>
        </div>

        {/* Review Headline */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Review Headline
          </label>
          <input
            type="text"
            placeholder="e.g., A cinematic powerhouse with breathtaking visuals"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="w-full px-4 py-3 rounded-xl bg-slate-900/80 text-white placeholder-slate-500 border border-slate-700/60 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition text-sm font-medium"
            required
          />
        </div>

        {/* Review Body */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Your Critique & Thoughts
          </label>
          <textarea
            rows={5}
            placeholder="What stood out to you? Discuss the direction, acting performances, pacing, cinematography, and score..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900/80 text-white placeholder-slate-500 border border-slate-700/60 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition text-sm leading-relaxed"
            required
          />
        </div>

        {/* Spoiler Toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={spoilers}
            onChange={(e) => setSpoilers(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/20 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-sm text-slate-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            This review reveals plot spoilers (it will be blurred by default)
          </span>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20 transition transform active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> {existingReview ? 'Update Review' : 'Publish Review'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
