import { useTranslation } from 'react-i18next';
import { RatingStarsDisplay } from './RatingStarsDisplay.jsx';
import { StarIcon } from './StarIcon.jsx';
import { ratingBreakdown } from '../utils/ratingBreakdown.js';

/**
 * Average, stars and per-star bars. Side by side from `sm` up; `stacked` keeps them in one column
 * for narrow containers such as a sidebar card.
 */
const RatingSummary = ({ stats, stacked = false }) => {
  const { t } = useTranslation();
  const average = Number(stats?.averageRating ?? 0);
  const total = Number(stats?.totalReviews ?? 0);

  return (
    <div className={`flex flex-col gap-5 ${stacked ? '' : 'sm:flex-row sm:items-center sm:gap-10'}`}>
      <div className="shrink-0">
        <p className="text-3xl font-semibold tabular-nums text-text-primary">{average.toFixed(1)}</p>
        <div className="mt-1.5 flex gap-0.5" aria-hidden>
          <RatingStarsDisplay value={average} iconClassName="h-4 w-4" />
        </div>
        <p className="mt-1.5 text-sm tabular-nums text-text-tertiary">
          {t('listing_review_total', { defaultValue: '{{count}} değerlendirme', count: total })}
        </p>
        <span className="sr-only">{t('listing_rating_aria', { rating: average.toFixed(1), count: total })}</span>
      </div>

      <ul className={`min-w-0 flex-1 space-y-1.5 ${stacked ? '' : 'sm:max-w-sm'}`} aria-label={t('rating_distribution', 'Puan dağılımı')}>
        {ratingBreakdown(stats).map(({ rating, count, percentage }) => (
          <li key={rating} className="flex items-center gap-2 text-sm tabular-nums">
            <span className="w-3 text-right text-text-secondary">{rating}</span>
            <StarIcon className="h-3.5 w-3.5 shrink-0 text-status-warning-text" />
            <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-background-tertiary">
              <span className="block h-full rounded-full bg-status-warning" style={{ width: `${Math.min(percentage, 100)}%` }} />
            </span>
            <span className="w-6 shrink-0 text-right text-text-tertiary">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RatingSummary;
