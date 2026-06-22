import { useTranslation } from "react-i18next";
import React, { memo } from 'react';
import { AlertCircle, MessageSquare } from 'lucide-react';
import ReviewCard from './ReviewCard.jsx';
import { SkeletonList } from '../../common/components/ui/index.js';
import { REVIEW_LIMITS, REVIEW_MESSAGES } from '../reviewConstants.js';
const ReviewsList = memo(({
  reviews,
  loading,
  error,
  hasMore,
  onLoadMore,
  onRetry,
  showLoadMore = true
}) => {
  const { t } = useTranslation();
  if (loading && reviews.length === 0) {
    return <div className="space-y-4">
                {Array.from({
        length: REVIEW_LIMITS.SKELETON_ROWS
      }).map((_, index) => <SkeletonList key={'skeleton-' + index} />)}
            </div>;
  }
  if (error) {
    return <div className="bg-background-primary rounded-2xl shadow-sm border border-border-light p-8 text-center max-w-lg mx-auto mt-4">
                <div className="text-status-error w-16 h-16 mx-auto mb-4 bg-status-error-bg rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-text-primary mb-2">{REVIEW_MESSAGES.ERROR_OCCURRED_TITLE}</h3>
                <p className="text-text-secondary mb-6">{error}</p>
                <button type="button" onClick={() => (onRetry ?? onLoadMore)?.()} className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-hover font-semibold transition-all active:scale-95 shadow-sm">
                    {REVIEW_MESSAGES.TRY_AGAIN}
                </button>
            </div>;
  }
  if (reviews.length === 0) {
    return <div className="bg-background-primary rounded-2xl shadow-sm border border-border-light p-12 text-center mt-4">
                <div className="text-text-muted w-20 h-20 mx-auto mb-6 bg-background-secondary rounded-3xl flex items-center justify-center border border-border-light shadow-inner">
                    <MessageSquare className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-text-primary mb-3">{REVIEW_MESSAGES.NO_REVIEWS_YET}</h3>
                <p className="text-text-secondary max-w-sm mx-auto">{t("no_reviews_have_been_made_to_this_user")}</p>
            </div>;
  }
  return <div className="space-y-4">
            {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
            
            {hasMore && showLoadMore && <div className="text-center py-8">
                    <button onClick={onLoadMore} disabled={loading} className="bg-background-secondary border border-border-light text-text-primary px-8 py-3 rounded-xl hover:bg-secondary-light font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm">
                        {loading ? REVIEW_MESSAGES.LOADING : REVIEW_MESSAGES.LOAD_MORE}
                    </button>
                </div>}
        </div>;
});
ReviewsList.displayName = 'ReviewsList';
export default ReviewsList;