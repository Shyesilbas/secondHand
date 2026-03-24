const REVIEW_LOCALE = 'tr-TR';

export const formatReviewDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString(REVIEW_LOCALE, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
