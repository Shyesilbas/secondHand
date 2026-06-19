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
    5: 'bg-emerald-500',
    4: 'bg-green-400',
    3: 'bg-amber-400',
    2: 'bg-orange-400',
    1: 'bg-rose-400'
  };
  return <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {averageRating > 0 ? averageRating.toFixed(1) : '—'}
          </div>
          <div className="flex items-center gap-0.5 justify-center mt-1">
            {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-3 h-3 ${star <= Math.round(averageRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />)}
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">{totalReviews}{t("reviews")}</p>
        </div>

        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map(star => {
          const count = Number(ratingDistribution[star] || 0);
          const pct = maxCount > 0 ? count / maxCount * 100 : 0;
          return <div key={star} className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 w-3 text-right">{star}</span>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
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
                <span className="text-[10px] font-semibold text-slate-400 w-6 text-right">{count}</span>
              </div>;
        })}
        </div>
      </div>
    </div>;
};
export default RatingDistribution;