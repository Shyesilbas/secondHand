import { useTranslation } from "react-i18next";
import { useRestrictionFlags } from '../../complaint/hooks/useComplaints.js';
import { CheckCircle2, Clock, ImageOff, ShoppingCart, XCircle } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { OFFER_DEFAULTS, OFFER_STATUSES, OFFER_TABS } from '../offerConstants.js';
import Badge from '../../common/components/ui/Badge.jsx';

const statusPresentation = {
 [OFFER_STATUSES.PENDING]: {
 label: 'Pending',
 variant: 'warning',
 icon: Clock
 },
 [OFFER_STATUSES.ACCEPTED]: {
 label: 'Accepted',
 variant: 'success',
 icon: CheckCircle2
 },
 [OFFER_STATUSES.REJECTED]: {
 label: 'Rejected',
 variant: 'error',
 icon: XCircle
 },
 [OFFER_STATUSES.EXPIRED]: {
 label: 'Expired',
 variant: 'muted',
 icon: Clock
 },
 [OFFER_STATUSES.COMPLETED]: {
 label: 'Completed',
 variant: 'primary',
 icon: CheckCircle2
 }
};

const formatTimeLeft = iso => {
 if (!iso) return null;
 const end = new Date(iso).getTime();
 const diff = end - Date.now();
 if (diff <= 0) return null;
 const h = Math.floor(diff / 3600000);
 if (h < 48) return `${Math.max(1, h)}h left`;
 const d = Math.ceil(diff / 86400000);
 return `${d}d left`;
};

/** Tek teklif satırı: görsel, durum bandı, net aksiyonlar */
const OfferTrackingCard = ({
 offer: o,
 activeTab,
 currency,
 onAccept,
 onReject,
 onCounter,
 onCheckout,
 onOpenListing
}) => {
 const {
 t
 } = useTranslation();
 const { canMakeOffers, canCheckout: canCheckoutNow } = useRestrictionFlags();
 const isExpired = o.status === OFFER_STATUSES.EXPIRED;
 const canActAsSeller = !isExpired && activeTab === OFFER_TABS.RECEIVED && o.status === OFFER_STATUSES.PENDING;
 const canCheckout = !isExpired && activeTab === OFFER_TABS.MADE && o.status === OFFER_STATUSES.ACCEPTED;
 const needsAttention = !isExpired && activeTab === OFFER_TABS.RECEIVED && o.status === OFFER_STATUSES.PENDING || !isExpired && activeTab === OFFER_TABS.MADE && o.status === OFFER_STATUSES.ACCEPTED;
 const personName = activeTab === OFFER_TABS.MADE ? `${o.sellerName || ''} ${o.sellerSurname || ''}`.trim() || '—' : `${o.buyerName || ''} ${o.buyerSurname || ''}`.trim() || '—';
 const roleLabel = activeTab === OFFER_TABS.MADE ? 'Seller' : 'Buyer';
 const pres = statusPresentation[o.status] || statusPresentation[OFFER_STATUSES.PENDING];
 const StatusIcon = pres.icon;
 const timeLeft = !isExpired && o.expiresAt ? formatTimeLeft(o.expiresAt) : null;

 return <article className={`group flex items-center gap-4 rounded border bg-card-bg p-4 shadow-sm transition-all ${isExpired ? 'opacity-60' : ''} ${needsAttention ? 'border-status-warning-border' : 'border-border-light'}`}>
 <button
 type="button"
 onClick={() => o.listingId && onOpenListing?.(o.listingId)}
 disabled={!o.listingId}
 className="h-20 w-20 shrink-0 overflow-hidden rounded bg-background-secondary disabled:cursor-default"
 title={o.listingId ? 'View listing' : undefined}
 >
 {o.listingImageUrl ? (
 <img src={o.listingImageUrl} alt="" className="h-full w-full object-cover transition-transform duration-300" />
 ) : (
 <div className="flex h-full w-full items-center justify-center text-text-muted">
 <ImageOff className="h-6 w-6" />
 </div>
 )}
 </button>

 <div className="flex-1 min-w-0">
 {o.listingId ? (
 <button
 type="button"
 onClick={() => onOpenListing(o.listingId)}
 className="text-left text-sm font-semibold text-text-primary line-clamp-1 hover:text-primary transition"
 >
 {o.listingTitle || OFFER_DEFAULTS.FALLBACK_LISTING_TITLE}
 </button>
 ) : (
 <p className="text-sm font-semibold text-text-primary line-clamp-1">
 {o.listingTitle || OFFER_DEFAULTS.FALLBACK_LISTING_TITLE}
 </p>
 )}

 <p className="text-sm text-text-muted mt-0.5">
 <span className="font-medium text-text-secondary">{roleLabel}:</span> {personName}
 </p>

 <div className="mt-2 text-xl font-semibold text-primary">
 {formatCurrency(o.totalPrice, currency)}
 </div>

 <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
 <span>{o.quantity} × {formatCurrency(o.listingUnitPrice, currency)}</span>
 <span>·</span>
 <span>{o.createdAt ? formatDateTime(o.createdAt) : '—'}</span>
 {timeLeft && (
 <>
 <span>·</span>
 <span className="font-medium text-status-warning-text">{timeLeft}</span>
 </>
 )}
 </div>
 </div>

 <div className="flex flex-col items-end gap-2 shrink-0">
 <Badge variant={pres.variant} icon={StatusIcon} className="w-fit shrink-0">
 {pres.label}
 </Badge>

 {isExpired ? (
 <span className="text-xs font-medium text-text-muted">{t("offer_expired")}</span>
 ) : canCheckout ? (
 <button
 type="button"
 onClick={() => onCheckout(o.id)}
 disabled={!canCheckoutNow}
 className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-9 px-3"
 >
 <ShoppingCart className="h-3.5 w-3.5" />
 {t("checkout")}
 </button>
 ) : canActAsSeller ? (
 <>
 <button
 type="button"
 onClick={() => onAccept(o.id)}
 className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-9 px-3"
 >
 <CheckCircle2 className="h-3.5 w-3.5" />
 {t("accept")}
 </button>
 <button
 type="button"
 onClick={() => onCounter(o)}
 disabled={!canMakeOffers}
 className="inline-flex h-9 items-center gap-1.5 rounded border border-border-light bg-card-bg px-3 text-sm font-medium text-text-primary hover:bg-background-secondary transition disabled:cursor-not-allowed disabled:opacity-50"
 >
 {t("counter")}
 </button>
 <button
 type="button"
 onClick={() => onReject(o.id)}
 className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-9 px-3"
 >
 <XCircle className="h-3.5 w-3.5" />
 {t("reject")}
 </button>
 </>
 ) : (
 <p className="text-right text-sm leading-relaxed text-text-muted">
 {activeTab === OFFER_TABS.MADE && o.status === OFFER_STATUSES.PENDING
 ? 'Waiting for the seller to respond.'
 : 'No action required.'}
 </p>
 )}
 </div>
 </article>;
};

export default OfferTrackingCard;