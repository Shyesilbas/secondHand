import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Star } from 'lucide-react';
import { Card, EmptyState } from '../../common/components/ui/index.js';
import ReviewCard from './ReviewCard.jsx';
import RatingSummary from './RatingSummary.jsx';

// Reviews shown before "show all"; the list grows in the page instead of scrolling inside the card.
const INITIAL_VISIBLE_REVIEWS = 4;

const ListingReviewsSection = ({ listing }) => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const stats = listing?.reviewStats || null;
  const reviews = listing?.reviews ?? [];
  const hasStats = Boolean(stats) && Number(stats.totalReviews ?? 0) > 0;

  const visibleReviews = showAll ? reviews : reviews.slice(0, INITIAL_VISIBLE_REVIEWS);

  return (
    <Card as="section" shadow={false} aria-labelledby="listing-reviews-title">
      <h2 id="listing-reviews-title" className="mb-5 text-lg font-semibold text-text-primary">
        {t('product_reviews', 'Değerlendirmeler')}
      </h2>

      {hasStats && <RatingSummary stats={stats} />}

      {reviews.length > 0 ? (
        <>
          <div className={`divide-y divide-border-light ${hasStats ? 'mt-6 border-t border-border-light' : ''}`}>
            {visibleReviews.map((review) => (
              <ReviewCard key={review.id} review={review} variant="inline" />
            ))}
          </div>
          {reviews.length > INITIAL_VISIBLE_REVIEWS && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
              className="mt-4 rounded text-sm font-medium text-text-link transition-colors duration-150 hover:text-text-linkHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              {showAll
                ? t('show_less', 'Daha az göster')
                : t('show_all_reviews', { defaultValue: 'Tüm değerlendirmeleri göster ({{count}})', count: reviews.length })}
            </button>
          )}
        </>
      ) : (
        <EmptyState
          icon={Star}
          title={t('no_reviews_for_this_product_yet', 'Bu ilan için henüz değerlendirme yapılmamış.')}
          className="border-0"
        />
      )}
    </Card>
  );
};

export default ListingReviewsSection;
