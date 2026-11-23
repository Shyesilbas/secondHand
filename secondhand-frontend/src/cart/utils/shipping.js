// Cargo shipping estimate shared by the cart summary and checkout. A seller order whose goods total
// (after coupon, from the pricing preview) reaches the free-shipping threshold ships free: the seller pays.
export const countShippingOrders = (pricing, threshold, fallbackSellerCount = 0) => {
  const limit = Number(threshold) || 0;
  const totals = new Map();
  (pricing?.items || []).forEach((line) => {
    if (line?.sellerId == null) return;
    totals.set(line.sellerId, (totals.get(line.sellerId) || 0) + (Number(line.netLineTotal) || 0));
  });
  if (totals.size === 0) {
    return { paid: fallbackSellerCount, free: 0 };
  }
  const free = limit > 0 ? [...totals.values()].filter((total) => total >= limit).length : 0;
  return { paid: totals.size - free, free };
};
