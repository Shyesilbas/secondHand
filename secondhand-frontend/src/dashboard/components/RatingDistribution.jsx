import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { CardEmpty } from './DashboardUi.jsx';

/** Average rating on the left, count per star on the right. */
const RatingDistribution = ({ ratingDistribution = {}, averageRating = 0, totalReviews = 0 }) => {
  const { t } = useTranslation();

  if (!totalReviews) {
    return <CardEmpty>{t('dash_no_reviews', 'Henüz değerlendirme yok.')}</CardEmpty>;
  }

  const maxCount = Math.max(...Object.values(ratingDistribution).map(Number), 1);

  return (
    <div className="flex items-center gap-6">
      <div className="min-w-20 text-center">
        <p className="text-3xl font-semibold tracking-tight tabular-nums text-text-primary">{averageRating.toFixed(1)}</p>
        <div className="mt-1 flex justify-center gap-0.5" aria-hidden>
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              className={`h-3 w-3 ${star <= Math.round(averageRating) ? 'fill-status-warning text-status-warning' : 'fill-border text-border'}`}
            />
          ))}
        </div>
        <p className="mt-1 text-xs tabular-nums text-text-tertiary">
          {t('dash_review_count', { defaultValue: '{{count}} değerlendirme', count: totalReviews })}
        </p>
      </div>

      <ul className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map(star => {
          const count = Number(ratingDistribution[star] || 0);
          return (
            <li key={star} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-right tabular-nums text-text-tertiary">{star}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background-tertiary" aria-hidden>
                <div className="h-full rounded-full bg-primary" style={{ width: `${(count / maxCount) * 100}%` }} />
              </div>
              <span className="w-6 text-right tabular-nums text-text-tertiary">{count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RatingDistribution;
