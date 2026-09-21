import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, AlertTriangle, Eye, EyeOff, Trash2, Edit3, MessageSquare, Star } from 'lucide-react';
import StarRating from './StarRating';
import { useAuth } from '../context/AuthContext';
import { reviewsAPI } from '../services/api';

export default function ReviewList({ reviews = [], onReviewDeleted, onReviewEdit }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [revealedSpoilers, setRevealedSpoilers] = useState({});
  const [localReviews, setLocalReviews] = useState(reviews);
  const [deletingId, setDeletingId] = useState(null);

  // Sync state if reviews prop updates
  React.useEffect(() => {
    setLocalReviews(reviews);
  }, [reviews]);

  const toggleSpoiler = (reviewId) => {
    setRevealedSpoilers(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const handleToggleLike = async (reviewId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const res = await reviewsAPI.toggleLike(reviewId);
      if (res.data.success) {
        setLocalReviews(prev =>
          prev.map(r =>
            r.id === reviewId
              ? { ...r, likes_count: res.data.likes_count, has_liked: res.data.has_liked }
              : r
          )
        );
      }
    } catch (err) {
      console.error('Failed to toggle like on review:', err);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    setDeletingId(reviewId);
    try {
      const res = await reviewsAPI.delete(reviewId);
      if (res.data.success) {
        setLocalReviews(prev => prev.filter(r => r.id !== reviewId));
        onReviewDeleted && onReviewDeleted(reviewId, res.data.movieStats);
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert('Failed to delete review.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (localReviews.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
        <MessageSquare className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <h4 className="text-lg font-semibold text-slate-300">No reviews yet</h4>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
          Be the first person to share your rating and review for this film!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {localReviews.map((review) => {
        const isSpoilerHidden = review.contains_spoilers && !revealedSpoilers[review.id];
        const canManage = user && (user.id === review.user_id || user.role === 'admin');

        return (
          <div
            key={review.id}
            className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-white/5 hover:border-white/10 transition shadow-lg"
          >
            {/* Header: User Avatar, Name, Rating & Date */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={review.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${review.username}`}
                  alt={review.username}
                  className="w-10 h-10 rounded-full object-cover border border-amber-500/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {review.username}
                    </span>
                    {review.is_own_review && (
                      <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatDate(review.created_at)}
                  </span>
                </div>
              </div>

              {/* Rating score badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{review.rating} / 5</span>
              </div>
            </div>

            {/* Headline */}
            <h4 className="text-base sm:text-lg font-bold text-white mb-2">
              {review.title}
            </h4>

            {/* Content or Spoiler Warning */}
            {isSpoilerHidden ? (
              <div className="my-3 p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 text-amber-400 text-sm font-medium">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>This review contains major plot spoilers.</span>
                </div>
                <button
                  onClick={() => toggleSpoiler(review.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-black hover:bg-amber-400 transition"
                >
                  <Eye className="w-3.5 h-3.5" /> Reveal
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {review.content}
                </p>

                {review.contains_spoilers && (
                  <button
                    onClick={() => toggleSpoiler(review.id)}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 mt-2 transition"
                  >
                    <EyeOff className="w-3.5 h-3.5" /> Hide spoiler
                  </button>
                )}
              </div>
            )}

            {/* Footer / Actions: Helpful Upvote & Edit/Delete */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              {/* Helpful vote */}
              <button
                onClick={() => handleToggleLike(review.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition border ${
                  review.has_liked
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-white/[0.03] text-slate-400 border-white/5 hover:text-white hover:bg-white/[0.06]'
                }`}
                title="Mark this review as helpful"
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${review.has_liked ? 'fill-amber-400' : ''}`} />
                <span>Helpful ({review.likes_count})</span>
              </button>

              {/* Author Actions */}
              {canManage && (
                <div className="flex items-center gap-2">
                  {onReviewEdit && (
                    <button
                      onClick={() => onReviewEdit(review)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/5 transition"
                      title="Edit Review"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
