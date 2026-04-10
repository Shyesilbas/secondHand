import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { REVIEW_DEFAULTS, REVIEW_LIMITS, REVIEW_MESSAGES } from '../reviewConstants.js';
import { useReviewSubmission } from '../hooks/useReviewSubmission.js';
import { InteractiveStarRating } from './InteractiveStarRating.jsx';

const ReviewModal = ({ isOpen, onClose, orderItem, onReviewCreated }) => {
  const [rating, setRating] = useState(REVIEW_DEFAULTS.INITIAL_RATING);
  const [comment, setComment] = useState('');
  const { submitReview, loading, error, clearError } = useReviewSubmission();

  useEffect(() => {
    if (isOpen) {
      setRating(REVIEW_DEFAULTS.INITIAL_RATING);
      setComment('');
      clearError();
    }
  }, [isOpen, clearError]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitReview({
      orderItemId: orderItem.id,
      rating,
      comment,
      onSuccess: () => {
        onReviewCreated?.();
        onClose();
      },
    });
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Product Review
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-1">
              {orderItem?.listing?.title || orderItem?.listing?.listingNo || 'Product'}
            </h3>
            <p className="text-sm text-gray-600">
              Order No: #{orderItem?.orderId}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your rate
              </label>
              <div className="flex items-center justify-center mb-2">
                <InteractiveStarRating
                  value={rating}
                  onChange={setRating}
                  variant="modal"
                  allowDeselect
                  className="justify-center gap-2"
                />
              </div>
              <p className="text-center text-sm text-gray-600">
                {rating === REVIEW_DEFAULTS.INITIAL_RATING
                  ? 'Click the stars for rating'
                  : `${rating}/${REVIEW_LIMITS.MAX_RATING} stars`}
              </p>
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={REVIEW_LIMITS.MAX_COMMENT_LENGTH}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Share your thoughts about this product..."
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {comment.length}/{REVIEW_LIMITS.MAX_COMMENT_LENGTH} Characters
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || rating < REVIEW_LIMITS.MIN_RATING}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? REVIEW_MESSAGES.SENDING : REVIEW_MESSAGES.SEND_REVIEW}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ReviewModal;
