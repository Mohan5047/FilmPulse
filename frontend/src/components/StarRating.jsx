import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({
  rating = 0,
  maxRating = 5,
  onRatingChange,
  readOnly = false,
  size = 'md',
  showScore = false
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9'
  };

  const currentVal = hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-1">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = currentVal >= starValue;
          const isHalf = !isFilled && currentVal >= starValue - 0.5;

          return (
            <button
              key={index}
              type="button"
              disabled={readOnly}
              onClick={() => onRatingChange && onRatingChange(starValue)}
              onMouseEnter={() => !readOnly && setHoverRating(starValue)}
              onMouseLeave={() => !readOnly && setHoverRating(0)}
              className={`transition-all duration-150 relative ${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-115 active:scale-95'
              }`}
              title={readOnly ? `${rating} / 5` : `Rate ${starValue} / 5`}
            >
              <Star
                className={`${sizeClasses[size] || sizeClasses.md} transition-colors ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : isHalf
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'text-slate-600 fill-slate-800/60'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="font-semibold text-amber-400 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
}
