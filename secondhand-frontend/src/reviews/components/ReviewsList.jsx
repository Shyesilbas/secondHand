import { useTranslation } from "react-i18next";
import { memo } from 'react';
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
 }).map((_, index) => <SkeletonList key={'review-skeleton-' + index} />)}
 </div>;
 }
 if (error) {
 return <div className="bg-background-primary rounded-md border border-border-light p-8 text-center max-w-lg mx-auto mt-4">
 <AlertCircle className="mx-auto mb-4 block h-5 w-5 shrink-0 text-status-error-text" strokeWidth={1.5} aria-hidden />
 <h3 className="text-lg font-semibold tracking-tight text-text-primary mb-2">{REVIEW_MESSAGES.ERROR_OCCURRED_TITLE}</h3>
 <p className="text-text-secondary mb-6">{error}</p>
 <button type="button" onClick={() => (onRetry ?? onLoadMore)?.()} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4">
 {REVIEW_MESSAGES.TRY_AGAIN}
 </button>
 </div>;
 }
 if (reviews.length === 0) {
 return <div className="bg-background-primary rounded-md border border-border-light p-12 text-center mt-4">
 <MessageSquare className="mx-auto mb-6 block h-5 w-5 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
 <h3 className="text-xl font-semibold tracking-tight text-text-primary mb-3">{REVIEW_MESSAGES.NO_REVIEWS_YET}</h3>
 <p className="text-text-secondary max-w-sm mx-auto">{t("no_reviews_have_been_made_to_this_user")}</p>
 </div>;
 }
 return <div className="space-y-4">
 {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
 
 {hasMore && showLoadMore && <div className="text-center py-8">
 <button onClick={onLoadMore} disabled={loading} className="bg-background-secondary border border-border-light text-text-primary px-8 py-3 rounded hover:bg-secondary-light font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all">
 {loading ? REVIEW_MESSAGES.LOADING : REVIEW_MESSAGES.LOAD_MORE}
 </button>
 </div>}
 </div>;
});
ReviewsList.displayName = 'ReviewsList';
export default ReviewsList;