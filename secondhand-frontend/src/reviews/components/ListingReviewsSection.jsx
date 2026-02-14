import { useMemo } from 'react';
import ReviewCard from './ReviewCard.jsx';
import { Star } from 'lucide-react';

const STAR_LABELS = ['', 'one', 'two', 'three', 'four', 'five'];

const ListingReviewsSection = ({ listing }) => {
  const stats = listing?.reviewStats || null;
  const reviews = listing?.reviews ?? [];
  const hasReviews = reviews.length > 0;

  const ratingBreakdown = useMemo(() => {
    if (!stats || (stats.totalReviews ?? 0) === 0) return [];
    const total = Number(stats.totalReviews) || 1;
    return [5, 4, 3, 2, 1].map((rating) => {
      const key = `${STAR_LABELS[rating]}StarReviews`;
      const count = Number(stats[key] ?? 0) || 0;
      return {
        rating,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      };
    });
  }, [stats]);


  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">Ürün Yorumları</h3>

      {stats && (stats.totalReviews ?? 0) > 0 && (
        <div className="mb-6 p-5 bg-slate-50/80 rounded-xl border border-slate-200/40">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {Number(stats.averageRating ?? 0).toFixed(1)}
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(stats.averageRating ?? 0)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-transparent text-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-slate-500 text-sm">
              {stats.totalReviews} yorum
            </span>
          </div>

          {ratingBreakdown.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-slate-200/60">
              {ratingBreakdown.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3 text-sm">
                  <span className="w-6 text-slate-500 font-medium">{rating}</span>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                  <div className="flex-1 min-w-0 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <span className="w-8 text-slate-500 text-right shrink-0">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {hasReviews ? (
        <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-1">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} compact />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Star className="w-12 h-12 mx-auto text-slate-300 mb-3" strokeWidth={1} />
          <p className="text-slate-500 text-sm">Bu ürün için henüz yorum yok</p>
        </div>
      )}
    </div>
  );
};

export default ListingReviewsSection;
