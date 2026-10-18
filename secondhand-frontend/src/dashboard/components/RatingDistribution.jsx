import { useTranslation } from "react-i18next";
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
const RatingDistribution = ({
 ratingDistribution = {},
 averageRating = 0,
 totalReviews = 0
}) => {
 const {
 t
 } = useTranslation();
 const maxCount = Math.max(...Object.values(ratingDistribution).map(Number), 1);
 const starColors = {
 5: 'bg-status-success',
 4: 'bg-status-success',
 3: 'bg-status-warning',
 2: 'bg-status-warning',
 1: 'bg-status-error'
 };
 return <div>
 <div className="flex items-center gap-4 mb-6">
 <div className="text-center">
 <div className="text-3xl font-semibold text-text-primary tracking-tight">
 {averageRating > 0 ? averageRating.toFixed(1) : '—'}
 </div>
 <div className="flex items-center gap-0.5 justify-center mt-1">
 {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-3 h-3 ${star <= Math.round(averageRating) ? 'text-status-warning fill-status-warning' : 'text-secondary-200'}`} />)}
 </div>
 <p className="text-xs text-text-muted font-semibold mt-1">{totalReviews}{t("reviews")}</p>
 </div>

 <div className="flex-1 space-y-2">
 {[5, 4, 3, 2, 1].map(star => {
 const count = Number(ratingDistribution[star] || 0);
 const pct = maxCount > 0 ? count / maxCount * 100 : 0;
 return <div key={star} className="flex items-center gap-2">
 <span className="text-xs font-semibold text-text-tertiary w-3 text-right">{star}</span>
 <Star className="w-3 h-3 text-status-warning fill-status-warning flex-shrink-0" />
 <div className="flex-1 h-2 bg-background-tertiary rounded-full overflow-hidden">
 <motion.div initial={{
 width: 0
 }} animate={{
 width: `${pct}%`
 }} transition={{
 duration: 0.6,
 delay: (5 - star) * 0.08,
 ease: 'easeOut'
 }} className={`h-full rounded-full ${starColors[star]}`} />
 </div>
 <span className="text-xs font-semibold text-text-muted w-6 text-right">{count}</span>
 </div>;
 })}
 </div>
 </div>
 </div>;
};
export default RatingDistribution;