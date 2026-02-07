import { ReviewsList } from '../../reviews/index.js';
import Pagination from '../../common/components/ui/Pagination.jsx';

const UserReviews = ({ 
  receivedReviews, 
  receivedReviewsLoading, 
  receivedReviewsError, 
  pagination,
  loadPage,
  handlePageSizeChange,
  reviewStats 
}) => {
  const handlePageChange = (page) => {
    loadPage(page);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        {reviewStats && (
          <div className="p-8 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tighter mb-2">Trust Score</h2>
                <p className="text-sm text-slate-500 tracking-tight">Seller reputation and reliability</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2 mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      className={`w-6 h-6 ${i < Math.round(reviewStats.averageRating || 0) ? 'text-amber-500' : 'text-slate-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div className="text-4xl font-black text-slate-900 tracking-tighter">
                  {(reviewStats.averageRating || 0).toFixed(1)}
                </div>
                <p className="text-sm text-slate-500 tracking-tight mt-1">
                  {reviewStats.totalReviews || 0} {reviewStats.totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tighter">
                Reviews Received {pagination?.totalElements > 0 && <span className="text-slate-500 font-normal">({pagination.totalElements})</span>}
              </h3>
              <p className="text-sm text-slate-500 mt-2 tracking-tight">Reviews this user has received from others</p>
            </div>
            {!receivedReviewsLoading && pagination?.totalElements > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 tracking-tight">Show:</span>
                <select 
                  value={pagination.size} 
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white tracking-tight"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
                <span className="text-sm text-slate-600 tracking-tight">per page</span>
              </div>
            )}
          </div>

          {receivedReviewsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : receivedReviewsError ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">Failed to load reviews</p>
              <p className="text-sm text-slate-500 tracking-tight">Please try again later</p>
            </div>
          ) : receivedReviews.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tighter">No reviews received yet</h3>
              <p className="text-sm text-slate-500 tracking-tight">This user hasn't received any reviews yet</p>
            </div>
          ) : (
            <>
              <ReviewsList
                reviews={receivedReviews}
                loading={false}
                error={null}
                hasMore={false}
                onLoadMore={null}
              />
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 border-t border-slate-200 pt-6">
                  <Pagination
                    page={pagination.number}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserReviews;
