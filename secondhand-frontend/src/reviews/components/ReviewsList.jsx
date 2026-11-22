import { useTranslation } from 'react-i18next';
import { memo } from 'react';
import { MessageSquare } from 'lucide-react';
import ReviewCard from './ReviewCard.jsx';
import { Button, Card, EmptyState, Skeleton } from '../../common/components/ui/index.js';
import ErrorState from '../../common/components/ui/ErrorState.jsx';
import { REVIEW_LIMITS } from '../reviewConstants.js';

const RowSkeleton = () => (
  <div className="flex items-start gap-3 py-4" aria-hidden>
    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

/** One card, reviews as divided rows; `perspective` is 'received' or 'given'. */
const ReviewsList = memo(({
  reviews,
  loading,
  error,
  hasMore,
  onLoadMore,
  onRetry,
  title,
  perspective = 'received',
  showLoadMore = true
}) => {
  const { t } = useTranslation();
  const isGiven = perspective === 'given';

  if (error) {
    return <ErrorState title={t('reviews_load_failed', 'Değerlendirmeler yüklenemedi')} description={error} onRetry={onRetry ?? onLoadMore} />;
  }

  if (!loading && reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title={isGiven ? t('no_reviews_given_yet', 'Henüz değerlendirme yapmadın') : t('no_reviews_received_yet', 'Henüz değerlendirme alınmadı')}
        description={isGiven
          ? t('no_reviews_given_desc', 'Tamamlanan siparişlerini değerlendirdiğinde burada görünür.')
          : t('no_reviews_received_desc', 'Alıcılar siparişlerini değerlendirdiğinde burada görünür.')}
      />
    );
  }

  return (
    <Card shadow={false}>
      {title && <h2 className="mb-1 text-lg font-semibold text-text-primary">{title}</h2>}
      <div className="divide-y divide-border-light">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} variant="inline" perspective={perspective} showListing />
        ))}
        {loading && Array.from({ length: REVIEW_LIMITS.SKELETON_ROWS }).map((_, i) => <RowSkeleton key={i} />)}
      </div>
      {hasMore && showLoadMore && (
        <div className="mt-2 border-t border-border-light pt-4 text-center">
          <Button variant="secondary" onClick={onLoadMore} disabled={loading}>
            {loading ? t('loading', 'Yükleniyor...') : t('load_more', 'Daha fazla yükle')}
          </Button>
        </div>
      )}
    </Card>
  );
});

ReviewsList.displayName = 'ReviewsList';
export default ReviewsList;
