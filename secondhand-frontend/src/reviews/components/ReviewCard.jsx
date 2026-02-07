
const ReviewCard = ({ review }) => {
    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <svg
                key={index}
                className={`w-4 h-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
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
                        <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-sm font-medium text-gray-700">
                        {review.rating}/5
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
};

export default ReviewCard;
