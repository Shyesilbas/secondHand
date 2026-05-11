/** İlan bazlı filtreyi ve gruplanmayı stabilize eden anahtar. */
export function reviewListingGroupKey(review) {
  const no = review?.listingNo != null ? String(review.listingNo).trim() : '';
  if (no) return `no:${no}`;
  const title = review?.listingTitle != null ? String(review.listingTitle).trim() : '';
  if (title) return `t:${title.slice(0, 120)}`;
  const oid = review?.orderItemId;
  return oid != null ? `order:${oid}` : `id:${review?.id}`;
}
