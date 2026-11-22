import { useTranslation } from 'react-i18next';
import { Card, Skeleton } from '../../common/components/ui/index.js';
import RatingSummary from './RatingSummary.jsx';

/** Sidebar card on the received/given reviews pages; same summary as the listing page, stacked. */
const ReviewStats = ({ stats, loading }) => {
  const { t } = useTranslation();
  const total = Number(stats?.totalReviews ?? 0);

  return (
    <Card shadow={false}>
      <h2 className="mb-5 text-lg font-semibold text-text-primary">{t('review_summary_title', 'Özet')}</h2>
      {loading ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : total > 0 ? (
        <RatingSummary stats={stats} stacked />
      ) : (
        <p className="text-sm text-text-tertiary">{t('review_summary_empty', 'Henüz değerlendirme yok.')}</p>
      )}
    </Card>
  );
};

export default ReviewStats;
