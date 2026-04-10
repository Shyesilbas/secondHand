import React, { useState } from 'react';
import { REVIEW_DEFAULTS, REVIEW_LIMITS, REVIEW_MESSAGES } from '../reviewConstants.js';
import { useReviewSubmission } from '../hooks/useReviewSubmission.js';
import { InteractiveStarRating } from './InteractiveStarRating.jsx';

const ReviewForm = ({ orderItemId, listingTitle, onReviewCreated, onCancel }) => {
  const [rating, setRating] = useState(REVIEW_DEFAULTS.INITIAL_RATING);
  const [comment, setComment] = useState('');
  const { submitReview, loading, error } = useReviewSubmission();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitReview({
      orderItemId,
      rating,
      comment,
      onSuccess: () => onReviewCreated?.(),
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Make A Review
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        Product: <span className="font-medium">{listingTitle}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rate (0-5 stars)
          </label>
          <div className="flex items-center space-x-1">
            <InteractiveStarRating value={rating} onChange={setRating} variant="form" />
            <span className="ml-3 text-sm text-gray-600">
              {rating === REVIEW_DEFAULTS.INITIAL_RATING
                ? 'Rate'
                : `${rating}/${REVIEW_LIMITS.MAX_RATING}`}
            </span>
          </div>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ürün hakkında görüşlerinizi paylaşın..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/{REVIEW_LIMITS.MAX_COMMENT_LENGTH} Characters
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || rating === REVIEW_DEFAULTS.INITIAL_RATING}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? REVIEW_MESSAGES.SENDING : REVIEW_MESSAGES.SEND_REVIEW}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
