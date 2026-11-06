const toTime = (value) => (value ? new Date(value).getTime() : null);

/**
 * Where a campaign stands right now. `active` is the seller's switch (and is turned off by the
 * scheduler once `endsAt` passes); the dates decide between scheduled, running and ended.
 */
export const getCampaignStatus = (campaign, now = Date.now()) => {
  const endsAt = toTime(campaign.endsAt);
  const startsAt = toTime(campaign.startsAt);
  if (endsAt && endsAt <= now) return { key: 'ENDED', label: 'Sona erdi', dot: 'bg-text-muted' };
  if (!campaign.active) return { key: 'PAUSED', label: 'Durduruldu', dot: 'bg-status-warning' };
  if (startsAt && startsAt > now) return { key: 'SCHEDULED', label: 'Planlandı', dot: 'bg-primary' };
  return { key: 'RUNNING', label: 'Yayında', dot: 'bg-status-success' };
};

/** LISTING when specific listings are picked, TYPE when categories are, otherwise ALL. */
export const getCampaignScope = (campaign) => {
  if (campaign.eligibleListingIds?.length > 0) return { kind: 'LISTING' };
  if (campaign.eligibleTypes?.length > 0) return { kind: 'TYPE' };
  return { kind: 'ALL' };
};
