/**
 * The backend pricing preview (`POST /v1/coupons/preview`) is the only price source for cart and checkout.
 * These helpers only look values up; they never compute a price.
 */
export const indexPricedLines = (pricing) => {
  const map = new Map();
  (pricing?.items || []).forEach((line) => {
    if (line?.listingId) map.set(line.listingId, line);
  });
  return map;
};

// Payable total from the preview, or null while it is loading or failed: callers must not pay without it.
export const getPricedTotal = (pricing) => {
  if (pricing?.total == null) return null;
  const total = Number(pricing.total);
  return Number.isFinite(total) ? total : null;
};

export const hasCampaignOnLine = (line) => Number(line?.campaignDiscount) > 0;

// Bundle campaign value as shown to buyers: "%20" for percent campaigns, a currency amount otherwise.
export const formatBundleValue = (bundle, formatCurrency, currency) =>
  bundle?.discountKind === 'PERCENT' ? `%${bundle.value}` : formatCurrency(bundle?.value, currency);

export const getCheckoutCurrency = (items) => items?.[0]?.listing?.currency || 'TRY';
