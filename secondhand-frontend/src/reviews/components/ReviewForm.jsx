import React, { useState } from 'react';
import { reviewService } from '../services/reviewService.js';

const ReviewForm = ({ orderItemId, listingTitle, onReviewCreated, onCancel }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (rating === 0) {
            setError('Please rate the product before submitting a review');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await reviewService.createReview({
                orderItemId,
                rating,
                comment: comment.trim() || null
            });

            onReviewCreated?.();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (currentRating, onStarClick) => {
        return Array.from({ length: 5 }, (_, index) => (
            <button
                key={index}
                type="button"
                onClick={() => onStarClick(index + 1)}
                className={`w-8 h-8 transition-colors ${
                    index < currentRating ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400`}
            >
                <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            </button>
        ));
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
                        {renderStars(rating, setRating)}
                        <span className="ml-3 text-sm text-gray-600">
                            {rating === 0 ? 'Rate' : `${rating}/5`}
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
                        maxLength={1000}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ürün hakkında görüşlerinizi paylaşın..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {comment.length}/1000 Characters
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
                        disabled={loading || rating === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Sending...' : 'Send Review'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
