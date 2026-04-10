import React from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ImageOff,
  ShoppingCart,
  XCircle,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { OFFER_DEFAULTS, OFFER_STATUSES, OFFER_TABS } from '../offerConstants.js';

const statusPresentation = {
  [OFFER_STATUSES.PENDING]: {
    label: 'Pending',
    badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
    icon: Clock,
  },
  [OFFER_STATUSES.ACCEPTED]: {
    label: 'Accepted',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    icon: CheckCircle2,
  },
  [OFFER_STATUSES.REJECTED]: {
    label: 'Rejected',
    badge: 'bg-red-50 text-red-800 border-red-200/80',
    icon: XCircle,
  },
  [OFFER_STATUSES.EXPIRED]: {
    label: 'Expired',
    badge: 'bg-slate-100 text-slate-600 border-slate-200/80',
    icon: Clock,
  },
  [OFFER_STATUSES.COMPLETED]: {
    label: 'Completed',
    badge: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
    icon: CheckCircle2,
  },
};

const formatTimeLeft = (iso) => {
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
  onOpenListing,
}) => {
  const isExpired = o.status === OFFER_STATUSES.EXPIRED;
  const canActAsSeller =
    !isExpired && activeTab === OFFER_TABS.RECEIVED && o.status === OFFER_STATUSES.PENDING;
  const canCheckout =
    !isExpired && activeTab === OFFER_TABS.MADE && o.status === OFFER_STATUSES.ACCEPTED;

  const needsAttention =
    (!isExpired && activeTab === OFFER_TABS.RECEIVED && o.status === OFFER_STATUSES.PENDING) ||
    (!isExpired && activeTab === OFFER_TABS.MADE && o.status === OFFER_STATUSES.ACCEPTED);

  const personName =
    activeTab === OFFER_TABS.MADE
      ? `${o.sellerName || ''} ${o.sellerSurname || ''}`.trim() || '—'
      : `${o.buyerName || ''} ${o.buyerSurname || ''}`.trim() || '—';

  const roleLabel = activeTab === OFFER_TABS.MADE ? 'Seller' : 'Buyer';
  const pres = statusPresentation[o.status] || statusPresentation[OFFER_STATUSES.PENDING];
  const StatusIcon = pres.icon;
  const timeLeft = !isExpired && o.expiresAt ? formatTimeLeft(o.expiresAt) : null;

  const isPending = o.status === OFFER_STATUSES.PENDING;
  const hasOutcome = [
    OFFER_STATUSES.ACCEPTED,
    OFFER_STATUSES.REJECTED,
    OFFER_STATUSES.COMPLETED,
    OFFER_STATUSES.EXPIRED,
  ].includes(o.status);

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${
        needsAttention
          ? 'border-amber-300/90 ring-1 ring-amber-200/50'
          : 'border-slate-200/80'
      } ${isExpired ? 'opacity-75 grayscale-[0.35]' : ''}`}
    >
      {needsAttention ? (
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-amber-400 to-orange-500" />
      ) : null}

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-5 sm:p-5">
        <button
          type="button"
          onClick={() => o.listingId && onOpenListing?.(o.listingId)}
          disabled={!o.listingId}
          className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-32 sm:w-32 disabled:cursor-default disabled:opacity-90"
          title={o.listingId ? 'View listing' : undefined}
        >
          {o.listingImageUrl ? (
            <img
              src={o.listingImageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <ImageOff className="h-10 w-10" />
            </div>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              {o.listingId ? (
                <button
                  type="button"
                  onClick={() => onOpenListing(o.listingId)}
                  className="text-left text-base font-semibold leading-snug text-slate-900 transition hover:text-indigo-600"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span className="line-clamp-2">{o.listingTitle || OFFER_DEFAULTS.FALLBACK_LISTING_TITLE}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 opacity-0 transition group-hover:opacity-100" />
                  </span>
                </button>
              ) : (
                <p className="text-base font-semibold text-slate-900 line-clamp-2">
                  {o.listingTitle || OFFER_DEFAULTS.FALLBACK_LISTING_TITLE}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                <span className="font-medium text-slate-600">{roleLabel}:</span> {personName}
              </p>
            </div>

            <span
              className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${pres.badge}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {pres.label}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">
                1
              </span>
              <span>Created</span>
              <span className="text-slate-300">→</span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                  isPending ? 'bg-amber-500 text-white' : 'bg-slate-900 text-white'
                }`}
              >
                2
              </span>
              <span>In review</span>
              <span className="text-slate-300">→</span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                  hasOutcome ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                3
              </span>
              <span>Outcome</span>
            </div>
            {timeLeft ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                {timeLeft}
              </span>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50/90 px-3 py-2.5 ring-1 ring-slate-100">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total</div>
              <div className="mt-0.5 font-mono text-xl font-bold tracking-tight text-indigo-600">
                {formatCurrency(o.totalPrice, currency)}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50/90 px-3 py-2.5 ring-1 ring-slate-100">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Qty × unit</div>
              <div className="mt-0.5 text-sm text-slate-700">
                {o.quantity} × {formatCurrency(o.listingUnitPrice, currency)}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50/90 px-3 py-2.5 ring-1 ring-slate-100">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Timeline</div>
              <div className="mt-0.5 text-xs leading-relaxed text-slate-600">
                <div>{o.createdAt ? formatDateTime(o.createdAt) : '—'}</div>
                <div className="text-slate-400">↓ expires</div>
                <div className={isExpired ? 'font-medium text-red-600' : ''}>
                  {o.expiresAt ? formatDateTime(o.expiresAt) : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-row flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4 sm:w-44 sm:flex-col sm:border-t-0 sm:pt-0">
          {isExpired ? (
            <span className="text-xs font-medium text-slate-500">Offer expired</span>
          ) : canCheckout ? (
            <button
              type="button"
              onClick={() => onCheckout(o.id)}
              className="inline-flex w-full min-w-[8.5rem] items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <ShoppingCart className="mr-1.5 h-4 w-4" />
              Checkout
            </button>
          ) : canActAsSeller ? (
            <>
              <button
                type="button"
                onClick={() => onAccept(o.id)}
                className="inline-flex w-full min-w-[8.5rem] items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                Accept
              </button>
              <button
                type="button"
                onClick={() => onCounter(o)}
                className="inline-flex w-full min-w-[8.5rem] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Counter
              </button>
              <button
                type="button"
                onClick={() => onReject(o.id)}
                className="inline-flex w-full min-w-[8.5rem] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <XCircle className="mr-1.5 h-4 w-4" />
                Reject
              </button>
            </>
          ) : (
            <p className="text-center text-[11px] leading-relaxed text-slate-500">
              {activeTab === OFFER_TABS.MADE && o.status === OFFER_STATUSES.PENDING
                ? 'Waiting for the seller to respond.'
                : 'No action required.'}
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

export default OfferTrackingCard;
