const STAR_LABELS = ['', 'one', 'two', 'three', 'four', 'five'];

/** Per-star counts from a review stats DTO (`fiveStarReviews` ... `oneStarReviews`), 5 to 1. */
export const ratingBreakdown = (stats) => {
  const total = Number(stats?.totalReviews ?? 0);
  return [5, 4, 3, 2, 1].map((rating) => {
    const count = Number(stats?.[`${STAR_LABELS[rating]}StarReviews`] ?? 0) || 0;
    return { rating, count, percentage: total > 0 ? (count / total) * 100 : 0 };
  });
};
