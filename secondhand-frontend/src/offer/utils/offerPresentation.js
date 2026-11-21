import { OFFER_STATUSES, OFFER_TABS } from '../offerConstants.js';

// Status matrix: waiting is warning, agreed is success, refused is error, closed states are neutral.
export const OFFER_STATUS_PRESENTATION = {
  [OFFER_STATUSES.PENDING]: { variant: 'warning', labelKey: 'offer_status_pending' },
  [OFFER_STATUSES.ACCEPTED]: { variant: 'success', labelKey: 'offer_status_accepted' },
  [OFFER_STATUSES.REJECTED]: { variant: 'error', labelKey: 'offer_status_rejected' },
  [OFFER_STATUSES.EXPIRED]: { variant: 'muted', labelKey: 'offer_status_expired' },
  [OFFER_STATUSES.COMPLETED]: { variant: 'neutral', labelKey: 'offer_status_completed' },
};

export const offerCounterpart = (offer, activeTab) => (activeTab === OFFER_TABS.MADE
  ? `${offer.sellerName || ''} ${offer.sellerSurname || ''}`
  : `${offer.buyerName || ''} ${offer.buyerSurname || ''}`).trim();
