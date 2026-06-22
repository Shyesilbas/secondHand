import { useTranslation } from "react-i18next";
import React from 'react';
import { ArrowUpRight, CheckCircle2, Clock, ImageOff, ShoppingCart, XCircle } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { OFFER_DEFAULTS, OFFER_STATUSES, OFFER_TABS } from '../offerConstants.js';

const statusPresentation = {
  [OFFER_STATUSES.PENDING]: {
    label: 'Pending',
    badge: 'bg-status-warning-bg text-status-warning-text border-status-warning-border',
    icon: Clock
  },
  [OFFER_STATUSES.ACCEPTED]: {
    label: 'Accepted',
    badge: 'bg-status-success-bg text-status-success border-status-success-border',
    icon: CheckCircle2
  },
  [OFFER_STATUSES.REJECTED]: {
    label: 'Rejected',
    badge: 'bg-status-error-bg text-status-error-text border-status-error-border',
    icon: XCircle
  },
  [OFFER_STATUSES.EXPIRED]: {
    label: 'Expired',
    badge: 'bg-background-tertiary text-text-secondary border-border-light',
    icon: Clock
  },
  [OFFER_STATUSES.COMPLETED]: {
    label: 'Completed',
    badge: 'bg-primary-light text-primary border-primary/20',
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
  const isExpired = o.status === OFFER_STATUSES.EXPIRED;
  const canActAsSeller = !isExpired && activeTab === OFFER_TABS.RECEIVED && o.status === OFFER_STATUSES.PENDING;
  const canCheckout = !isExpired && activeTab === OFFER_TABS.MADE && o.status === OFFER_STATUSES.ACCEPTED;
  const needsAttention = !isExpired && activeTab === OFFER_TABS.RECEIVED && o.status === OFFER_STATUSES.PENDING || !isExpired && activeTab === OFFER_TABS.MADE && o.status === OFFER_STATUSES.ACCEPTED;
  const personName = activeTab === OFFER_TABS.MADE ? `${o.sellerName || ''} ${o.sellerSurname || ''}`.trim() || '—' : `${o.buyerName || ''} ${o.buyerSurname || ''}`.trim() || '—';
  const roleLabel = activeTab === OFFER_TABS.MADE ? 'Seller' : 'Buyer';
  const pres = statusPresentation[o.status] || statusPresentation[OFFER_STATUSES.PENDING];
  const StatusIcon = pres.icon;
  const timeLeft = !isExpired && o.expiresAt ? formatTimeLeft(o.expiresAt) : null;

  return <article className={`group flex items-center gap-4 rounded-xl border bg-card-bg p-4 shadow-sm hover:shadow-md transition-all ${isExpired ? 'opacity-60' : ''} ${needsAttention ? 'border-status-warning-border' : 'border-border-light'}`}>
      <button
        type="button"
        onClick={() => o.listingId && onOpenListing?.(o.listingId)}
        disabled={!o.listingId}
        className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-background-secondary disabled:cursor-default"
        title={o.listingId ? 'View listing' : undefined}
      >
        {o.listingImageUrl ? (
          <img src={o.listingImageUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
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

        <p className="text-xs text-text-muted mt-0.5">
          <span className="font-medium text-text-secondary">{roleLabel}:</span> {personName}
        </p>

        <div className="mt-2 text-xl font-bold text-primary">
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
        <span className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${pres.badge}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {pres.label}
        </span>

        {isExpired ? (
          <span className="text-xs font-medium text-text-muted">{t("offer_expired")}</span>
        ) : canCheckout ? (
          <button
            type="button"
            onClick={() => onCheckout(o.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover transition"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {t("checkout")}
          </button>
        ) : canActAsSeller ? (
          <>
            <button
              type="button"
              onClick={() => onAccept(o.id)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover transition"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("accept")}
            </button>
            <button
              type="button"
              onClick={() => onCounter(o)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-light bg-card-bg px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-background-secondary transition"
            >
              {t("counter")}
            </button>
            <button
              type="button"
              onClick={() => onReject(o.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-status-error-border hover:text-status-error-text transition"
            >
              <XCircle className="h-3.5 w-3.5" />
              {t("reject")}
            </button>
          </>
        ) : (
          <p className="text-right text-caption leading-relaxed text-text-muted">
            {activeTab === OFFER_TABS.MADE && o.status === OFFER_STATUSES.PENDING
              ? 'Waiting for the seller to respond.'
              : 'No action required.'}
          </p>
        )}
      </div>
    </article>;
};

export default OfferTrackingCard;