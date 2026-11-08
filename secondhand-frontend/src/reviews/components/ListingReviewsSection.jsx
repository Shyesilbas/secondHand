import { useTranslation } from "react-i18next";
import { useMemo } from 'react';
import ReviewCard from './ReviewCard.jsx';
import { Star } from 'lucide-react';
const STAR_LABELS = ['', 'one', 'two', 'three', 'four', 'five'];
const ListingReviewsSection = ({
 listing
}) => {
 const {
 t
 } = useTranslation();
 const stats = listing?.reviewStats || null;
 const reviews = listing?.reviews ?? [];
 const hasReviews = reviews.length > 0;
 const ratingBreakdown = useMemo(() => {
 if (!stats || (stats.totalReviews ?? 0) === 0) return [];
 const total = Number(stats.totalReviews) || 1;
 return [5, 4, 3, 2, 1].map(rating => {
 const key = `${STAR_LABELS[rating]}StarReviews`;
 const count = Number(stats[key] ?? 0) || 0;
 return {
 rating,
 count,
 percentage: total > 0 ? count / total * 100 : 0
 };
 });
 }, [stats]);
 return <section className="rounded border border-border bg-background-primary p-5" aria-labelledby="listing-reviews-title">
 <h2 id="listing-reviews-title" className="text-lg font-semibold text-text-primary mb-4">{t("product_reviews", "Değerlendirmeler")}</h2>

 {stats && (stats.totalReviews ?? 0) > 0 && <div className="mb-5 p-4 bg-background-secondary rounded border border-border-light">
 <div className="flex flex-wrap items-center gap-3 mb-4">
 <div className="flex items-center gap-2">
 <span className="text-2xl font-semibold tabular-nums text-text-primary">
 {Number(stats.averageRating ?? 0).toFixed(1)}
 </span>
 <div className="flex gap-0.5" aria-hidden>
 {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-4 h-4 ${star <= Math.round(stats.averageRating ?? 0) ? 'fill-status-warning text-status-warning' : 'fill-transparent text-text-muted/40'}`} strokeWidth={1.5} />)}
 </div>
 </div>
 <span className="text-text-tertiary text-sm tabular-nums">
 ({stats.totalReviews} {t("reviews", "değerlendirme")})
 </span>
 </div>

 {ratingBreakdown.length > 0 && <div className="space-y-2 pt-3 border-t border-border-light">
 {ratingBreakdown.map(({
 rating,
 count,
 percentage
 }) => <div key={rating} className="flex items-center gap-2.5 text-xs tabular-nums">
 <span className="w-3 text-text-secondary font-medium text-right">{rating}</span>
 <Star className="w-3.5 h-3.5 text-status-warning fill-status-warning shrink-0" strokeWidth={1.5} aria-hidden />
 <div className="flex-1 min-w-0 h-1.5 bg-background-tertiary rounded-full overflow-hidden">
 <div className="h-full bg-status-warning rounded-full transition-all duration-300" style={{
 width: `${Math.min(percentage, 100)}%`
 }} />
 </div>
 <span className="w-7 text-text-tertiary text-right shrink-0">{count}</span>
 </div>)}
 </div>}
 </div>}

 {hasReviews ? <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
 {reviews.map(review => <ReviewCard key={review.id} review={review} compact />)}
 </div> : <div className="rounded border border-border-light bg-background-secondary py-8 px-4 text-center">
 <Star className="w-5 h-5 mx-auto text-text-muted mb-2" strokeWidth={1.5} aria-hidden />
 <p className="text-text-secondary text-sm">{t("no_reviews_for_this_product_yet", "Bu ilan için henüz değerlendirme yapılmamış.")}</p>
 </div>}
 </section>;
};
export default ListingReviewsSection;