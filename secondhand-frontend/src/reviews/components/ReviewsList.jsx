import { useTranslation } from "react-i18next";
import React, { memo } from 'react';
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
    return <div className="bg-background-primary rounded-lg shadow-md border p-6 text-center">
                <div className="text-status-error mb-2">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-sm font-medium text-text-primary mb-2">{REVIEW_MESSAGES.ERROR_OCCURRED_TITLE}</h3>
                <p className="text-text-secondary mb-4">{error}</p>
                <button type="button" onClick={() => (onRetry ?? onLoadMore)?.()} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary transition-colors">
                    {REVIEW_MESSAGES.TRY_AGAIN}
                </button>
            </div>;
  }
  if (reviews.length === 0) {
    return <div className="bg-background-primary rounded-lg shadow-md border p-6 text-center">
                <div className="text-text-muted mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                </div>
                <h3 className="text-sm font-medium text-text-primary mb-2">{REVIEW_MESSAGES.NO_REVIEWS_YET}</h3>
                <p className="text-text-secondary">{t("no_reviews_have_been_made_to_this_user")}</p>
            </div>;
  }
  return <div className="space-y-4">
            {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
            
            {hasMore && showLoadMore && <div className="text-center py-4">
                    <button onClick={onLoadMore} disabled={loading} className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {loading ? REVIEW_MESSAGES.LOADING : REVIEW_MESSAGES.LOAD_MORE}
                    </button>
                </div>}
        </div>;
});
ReviewsList.displayName = 'ReviewsList';
export default ReviewsList;