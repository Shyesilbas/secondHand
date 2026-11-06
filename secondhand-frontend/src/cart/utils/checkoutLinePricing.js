const toNumber = (value) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Unit price and line total shown for one checkout line.
 * Offer lines carry the agreed total; other lines use the campaign price when it is lower than the list price.
 */
export const getCheckoutLinePricing = (item) => {
  const listing = item?.listing || {};
  const quantity = Number(item?.quantity) || 0;
  if (item?.isOffer) {
    const lineTotal = toNumber(item.offerTotalPrice);
    return { unitPrice: quantity > 0 ? lineTotal / quantity : toNumber(listing.price), lineTotal, quantity };
  }
  const hasCampaign = listing.campaignId && listing.campaignPrice != null && toNumber(listing.campaignPrice) < toNumber(listing.price);
  const unitPrice = toNumber(hasCampaign ? listing.campaignPrice : listing.price);
  return { unitPrice, lineTotal: unitPrice * quantity, quantity };
};

export const getCheckoutCurrency = (items) => items?.[0]?.listing?.currency || 'TRY';
