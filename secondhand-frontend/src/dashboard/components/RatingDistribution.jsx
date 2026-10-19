import { useTranslation } from "react-i18next";
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const RatingDistribution = ({
  ratingDistribution = {},
  averageRating = 0,
  totalReviews = 0
}) => {
  const { t } = useTranslation();
  const maxCount = Math.max(...Object.values(ratingDistribution).map(Number), 1);

  return (
    <div>
      <div className="flex items-center gap-6 mb-2">
        <div className="text-center min-w-20">
          <div className="text-3xl font-semibold text-text-primary tracking-tight tabular-nums">
            {averageRating > 0 ? averageRating.toFixed(1) : '—'}
          </div>
          <div className="flex items-center gap-0.5 justify-center mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${
                  star <= Math.round(averageRating)
                    ? 'text-status-warning fill-status-warning'
                    : 'text-border fill-border'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-text-muted font-medium mt-1 tabular-nums">
            {totalReviews} {t("reviews")}
          </p>
        </div>

        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = Number(ratingDistribution[star] || 0);
            const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-tertiary w-3 text-right tabular-nums">{star}</span>
                <Star className="w-3 h-3 text-status-warning fill-status-warning shrink-0" />
                <div className="flex-1 h-2 bg-background-tertiary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: 0.6,
                      delay: (5 - star) * 0.08,
                      ease: 'easeOut'
                    }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
                <span className="text-xs font-semibold text-text-muted w-6 text-right tabular-nums">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RatingDistribution;