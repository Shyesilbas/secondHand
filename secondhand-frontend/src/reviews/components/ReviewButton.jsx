import { useTranslation } from "react-i18next";
import { Star } from 'lucide-react';
import { useState } from 'react';
import ReviewModal from './ReviewModal.jsx';
import Button from '../../common/components/ui/Button.jsx';
import { ORDER_STATUSES } from '../../order/constants/orderUiConstants.js';
import { REVIEW_MESSAGES } from '../reviewConstants.js';

// `existingReview` comes from the caller's review query; after creation the caller refetches it.
const ReviewButton = ({
 orderItem,
 onReviewCreated,
 existingReview = null,
 orderStatus,
 shippingStatus,
 reviewsLoading = false
}) => {
 const {
 t
 } = useTranslation();
 const [showModal, setShowModal] = useState(false);
 const canReview = orderStatus === ORDER_STATUSES.COMPLETED || orderStatus === ORDER_STATUSES.DELIVERED || shippingStatus === ORDER_STATUSES.DELIVERED || orderItem?.shippingStatus === ORDER_STATUSES.DELIVERED;
 if (!canReview) {
 return null;
 }
 if (existingReview) {
 return <div className="text-sm">
 <div className="flex items-center gap-1 text-text-secondary">
 <Star className="h-4 w-4" strokeWidth={1.5} aria-hidden />
 <span className="tabular-nums">{t("reviewed")} ({existingReview.rating}/5)</span>
 </div>
 {existingReview.comment && <p className="mt-1 line-clamp-2 max-w-xs text-xs text-text-secondary">{existingReview.comment}</p>}
 </div>;
 }
 return <>
 <Button size="sm" onClick={e => {
 e.stopPropagation();
 setShowModal(true);
 }} disabled={reviewsLoading}>
 {reviewsLoading ? REVIEW_MESSAGES.CHECKING : REVIEW_MESSAGES.REVIEW}
 </Button>

 <ReviewModal isOpen={showModal} onClose={() => setShowModal(false)} orderItem={orderItem} onReviewCreated={onReviewCreated} />
 </>;
};
export default ReviewButton;
