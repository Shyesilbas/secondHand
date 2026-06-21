import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { reviewService } from '../services/reviewService.js';
import ReviewModal from './ReviewModal.jsx';
import logger from '../../common/utils/logger.js';
import { ORDER_STATUSES } from '../../order/constants/orderUiConstants.js';
import { REVIEW_MESSAGES } from '../reviewConstants.js';
const ReviewButton = ({
  orderItem,
  onReviewCreated,
  existingReview = null,
  orderStatus,
  shippingStatus,
  reviewsLoading = false,
  skipIndividualFetch = false
}) => {
  const {
    t
  } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [review, setReview] = useState(existingReview);
  const [loading, setLoading] = useState(false);
  React.useEffect(() => {
    setReview(existingReview);
  }, [existingReview]);

  // Hydrate review by order item if skipIndividualFetch is false and no existingReview is provided.
  React.useEffect(() => {
    if (skipIndividualFetch || reviewsLoading) return;
    const oid = orderItem?.id ?? orderItem?.orderItemId;
    if (oid === undefined || oid === null || oid === '') return;
    if (existingReview !== null && existingReview !== undefined) return;

    let cancelled = false;
    const checkExistingReview = async () => {
      try {
        const reviewData = await reviewService.getReviewByOrderItem(oid);
        if (cancelled) return;
        setReview(reviewData);
      } catch (error) {
        if (cancelled) return;
        if (error?.response?.status !== 404) {
          logger.error('Error checking review:', error);
        }
        setReview(null);
      }
    };
    checkExistingReview();
    return () => {
      cancelled = true;
    };
  }, [skipIndividualFetch, reviewsLoading, orderItem?.id, orderItem?.orderItemId, existingReview]);
  const canReview = orderStatus === ORDER_STATUSES.COMPLETED || orderStatus === ORDER_STATUSES.DELIVERED || shippingStatus === ORDER_STATUSES.DELIVERED || orderItem?.shippingStatus === ORDER_STATUSES.DELIVERED;
  if (!canReview) {
    return null;
  }
  if (review) {
    return <div className="text-sm">
                <div className="flex items-center space-x-1 text-status-success">
                    <span className="text-lg">⭐</span>
                    <span>{t("reviewed")}{review.rating}/5)</span>
                </div>
                {review.comment && <div className="mt-1 text-xs text-text-secondary bg-secondary-light p-2 rounded-lg max-w-xs">
                        <p className="overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: '1.4em',
          maxHeight: '2.8em'
        }}>
                            {review.comment}
                        </p>
                    </div>}
            </div>;
  }
  const handleReviewCreated = payload => {
    onReviewCreated?.(payload);
    setLoading(true);
    reviewService.getReviewByOrderItem(orderItem.id).then(setReview).catch(error => {
      // 404 is expected if review creation failed
      if (error?.response?.status !== 404) {
        logger.error('Error fetching review after creation:', error);
      }
    }).finally(() => setLoading(false));
  };
  return <>
            <button onClick={e => {
      e.stopPropagation();
      setShowModal(true);
    }} disabled={loading} className="text-sm bg-primary text-white px-3 py-1 rounded-md hover:bg-primary disabled:opacity-50 transition-colors">
                {loading ? REVIEW_MESSAGES.CHECKING : REVIEW_MESSAGES.REVIEW}
            </button>
            
            <ReviewModal isOpen={showModal} onClose={() => setShowModal(false)} orderItem={orderItem} onReviewCreated={handleReviewCreated} />
        </>;
};
export default ReviewButton;