import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (score: number) => void;
  userRating?: number | null;
}

export default function StarRating({
  rating,
  count,
  size = 'sm',
  interactive = false,
  onRate,
  userRating,
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);

  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const displayRating = hover ?? (interactive ? (userRating ?? 0) : rating);
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(null)}
            onClick={() => interactive && onRate?.(star)}
            className={interactive ? 'cursor-pointer transition-transform hover:scale-125 disabled:cursor-pointer' : 'cursor-default'}
            aria-label={`${star} estrellas`}
          >
            <Star
              className={`${sizes[size]} ${
                star <= displayRating
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-base-700 text-base-600'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
      {!interactive && (
        <span className="text-xs text-slate-400 tabular-nums">
          {rating > 0 ? rating.toFixed(1) : '—'}
          {count !== undefined && count > 0 && ` (${count})`}
        </span>
      )}
    </div>
  );
}
