import { useState, useCallback } from 'react';
import { reviewService } from '../services/reviewService.js';
import { REVIEW_LIMITS, REVIEW_MESSAGES } from '../reviewConstants.js';
import { getReviewErrorMessage } from '../utils/reviewError.js';

/** createReview çağrısı + ortak doğrulama/hata metni (form + modal). */
export function useReviewSubmission() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const submitReview = useCallback(async ({ orderItemId, rating, comment, orderId, onSuccess }) => {
    if (rating < REVIEW_LIMITS.MIN_RATING) {
      setError(REVIEW_MESSAGES.RATING_REQUIRED);
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await reviewService.createReview({
        orderItemId,
        rating,
        comment: comment?.trim() || null,
      });
      onSuccess?.({
        orderItemId,
        rating,
        comment: comment?.trim() || null,
        orderId,
      });
      return true;
    } catch (err) {
      setError(getReviewErrorMessage(err, REVIEW_MESSAGES.UNKNOWN_ERROR));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submitReview, loading, error, setError, clearError };
}
