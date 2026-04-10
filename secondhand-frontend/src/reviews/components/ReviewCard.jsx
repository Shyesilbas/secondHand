import { REVIEW_LIMITS } from '../reviewConstants.js';
import { formatReviewDate } from '../utils/reviewDateFormat.js';
import { RatingStarsDisplay } from './RatingStarsDisplay.jsx';

const ReviewCard = ({ review }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-gray-600">
            {review.reviewerName?.[0]?.toUpperCase() || '?'}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {review.reviewerName} {review.reviewerSurname}
          </p>
          <p className="text-sm text-gray-500">{formatReviewDate(review.createdAt)}</p>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <RatingStarsDisplay value={review.rating} iconClassName="w-4 h-4" mode="ceil" />
        <span className="ml-2 text-sm font-medium text-gray-700">
          {review.rating}/{REVIEW_LIMITS.MAX_RATING}
        </span>
      </div>
    </div>

    {review.comment && (
      <p className="text-gray-700 text-sm leading-relaxed mb-3">
        {review.comment}
      </p>
    )}

    <div className="border-t pt-3">
      <p className="text-xs text-gray-500">
        Product: <span className="font-medium">{review.listingTitle}</span>
        <span className="ml-2">({review.listingNo})</span>
      </p>
    </div>
  </div>
);

export default ReviewCard;
