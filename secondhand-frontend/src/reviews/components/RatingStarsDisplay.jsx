import { REVIEW_LIMITS } from '../reviewConstants.js';
import { StarIcon } from './StarIcon.jsx';

/** Salt okunur tam yıldız satırı (kart, istatistik özeti). */
export function RatingStarsDisplay({ value, iconClassName = 'w-4 h-4', mode = 'round' }) {
  const n = Number(value) || 0;
  let raw;
  if (mode === 'floor') raw = Math.floor(n);
  else if (mode === 'ceil') raw = Math.ceil(n);
  else raw = Math.round(n);
  const filled = Math.min(REVIEW_LIMITS.MAX_RATING, Math.max(0, raw));

  return (
    <>
      {Array.from({ length: REVIEW_LIMITS.MAX_RATING }, (_, i) => (
        <StarIcon
          key={i}
          className={`${iconClassName} ${i < filled ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </>
  );
}
