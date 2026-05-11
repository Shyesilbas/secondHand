/**
 * Must match backend: GreatSellerPolicy.java (single source there).
 * Update together when policy changes.
 */
export const GREAT_SELLER_POLICY = {
  rollingWindowDays: 60,
  minQualifyingSales: 6,
  minUnitPriceTry: 1500,
  minDistinctReviewers: 3,
  minAverageRating: 4.7,
};
