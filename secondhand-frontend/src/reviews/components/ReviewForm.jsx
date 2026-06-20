import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { REVIEW_DEFAULTS, REVIEW_LIMITS, REVIEW_MESSAGES } from '../reviewConstants.js';
import { useReviewSubmission } from '../hooks/useReviewSubmission.js';
import { InteractiveStarRating } from './InteractiveStarRating.jsx';
const ReviewForm = ({
  orderItemId,
  listingTitle,
  onReviewCreated,
  onCancel
}) => {
  const {
    t
  } = useTranslation();
  const [rating, setRating] = useState(REVIEW_DEFAULTS.INITIAL_RATING);
  const [comment, setComment] = useState('');
  const {
    submitReview,
    loading,
    error
  } = useReviewSubmission();
  const handleSubmit = async e => {
    e.preventDefault();
    await submitReview({
      orderItemId,
      rating,
      comment,
      onSuccess: payload => onReviewCreated?.(payload)
    });
  };
  return <div className="bg-background-primary rounded-lg shadow-md border p-6">
      <h3 className="text-sm font-medium text-text-primary mb-4">{t("make_a_review")}</h3>

      <p className="text-sm text-text-secondary mb-4">{t("product")}<span className="font-medium">{listingTitle}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">{t("rate_0_5_stars")}</label>
          <div className="flex items-center space-x-1">
            <InteractiveStarRating value={rating} onChange={setRating} variant="form" />
            <span className="ml-3 text-sm text-text-secondary">
              {rating === REVIEW_DEFAULTS.INITIAL_RATING ? 'Rate' : `${rating}/${REVIEW_LIMITS.MAX_RATING}`}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-text-secondary mb-2">{t("comment")}</label>
          <textarea id="comment" value={comment} onChange={e => setComment(e.target.value)} rows={4} maxLength={REVIEW_LIMITS.MAX_COMMENT_LENGTH} className="w-full px-3 py-2 border border-border-DEFAULT rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder={t("share_your_thoughts_about_the_product")} />
          <p className="text-xs text-text-muted mt-1">
            {comment.length}/{REVIEW_LIMITS.MAX_COMMENT_LENGTH}{t("characters")}</p>
        </div>

        {error && <div className="bg-status-error-bg border border-status-error-border rounded-md p-3">
            <p className="text-sm text-status-error">{error}</p>
          </div>}

        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-text-secondary bg-tertiary rounded-md hover:bg-tertiary transition-colors">{t("cancel")}</button>
          <button type="submit" disabled={loading || rating === REVIEW_DEFAULTS.INITIAL_RATING} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? REVIEW_MESSAGES.SENDING : REVIEW_MESSAGES.SEND_REVIEW}
          </button>
        </div>
      </form>
    </div>;
};
export default ReviewForm;