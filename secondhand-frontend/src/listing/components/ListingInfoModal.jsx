import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import usePriceHistory from '../hooks/usePriceHistory.js';
import { formatCurrency } from '../../common/formatters.js';
import { ROUTES } from '../../common/constants/routes.js';
import { LISTING_STATUS } from '../types/index.js';
import ExchangeRatesTab from './ExchangeRatesTab.jsx';
import ViewStatisticsCard from './ViewStatisticsCard.jsx';
import ListingReviewStats from '../../reviews/components/ListingReviewStats.jsx';
import PriceHistoryTab from './PriceHistoryTab.jsx';
import {
  X,
  MapPin,
  Package,
  Hash,
  ExternalLink,
  TrendingUp,
  RefreshCw,
  Eye,
  Image as ImageIcon,
  Zap,
  TrendingDown,
} from 'lucide-react';

const INSIGHT_TABS = [
  { id: 'history', label: 'Price trend', icon: TrendingUp },
  { id: 'exchange', label: 'Convert', icon: RefreshCw },
  { id: 'views', label: 'Views', icon: Eye, ownerOnly: true },
];

function statusBadge(status) {
  switch (status) {
    case LISTING_STATUS.ACTIVE:
      return { cls: 'bg-emerald-500/15 text-emerald-800 ring-emerald-500/20', label: 'Active' };
    case LISTING_STATUS.SOLD:
      return { cls: 'bg-rose-500/15 text-rose-800 ring-rose-500/20', label: 'Sold' };
    case LISTING_STATUS.INACTIVE:
      return { cls: 'bg-slate-400/20 text-slate-700 ring-slate-400/25', label: 'Inactive' };
    default:
      return { cls: 'bg-slate-400/20 text-slate-700 ring-slate-400/25', label: status || '—' };
  }
}

const ListingInfoModal = ({
  isOpen,
  onClose,
  listing,
  displayPrice,
  isOwner,
  viewStats: viewStatsProp,
  isInShowcase = false,
}) => {
  const [activeInsight, setActiveInsight] = useState('history');
  const [imageBroken, setImageBroken] = useState(false);

  const listingId = listing?.id;
  const { priceHistory, loading: historyLoading, error: historyError, fetchPriceHistory } = usePriceHistory(listingId);

  const viewStats = viewStatsProp ?? listing?.viewStats ?? null;
  const currency = listing?.currency ?? 'TRY';
  const rawPrice = displayPrice != null ? displayPrice : listing?.price;
  const priceNum = typeof rawPrice === 'string' ? parseFloat(rawPrice) : Number(rawPrice);
  const price = Number.isFinite(priceNum) ? priceNum : 0;

  const title = listing?.title ?? 'Listing';
  const hasCampaign =
    listing?.campaignId &&
    listing?.campaignPrice != null &&
    listing?.price != null &&
    parseFloat(listing.campaignPrice) < parseFloat(listing.price);
  const discountPct = useMemo(() => {
    if (!hasCampaign || !listing) return 0;
    return Math.round((1 - parseFloat(listing.campaignPrice) / parseFloat(listing.price)) * 100);
  }, [hasCampaign, listing]);

  const visibleTabs = useMemo(
    () => INSIGHT_TABS.filter((t) => !t.ownerOnly || isOwner),
    [isOwner]
  );

  useEffect(() => {
    if (!isOpen || !listingId) return;
    setImageBroken(false);
    fetchPriceHistory();
  }, [isOpen, listingId, fetchPriceHistory]);

  useEffect(() => {
    if (!isOpen) return;
    const allowed = visibleTabs.map((t) => t.id);
    setActiveInsight((cur) => (allowed.includes(cur) ? cur : allowed[0] || 'history'));
  }, [isOpen, visibleTabs]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const onInsightChange = useCallback((id) => setActiveInsight(id), []);

  if (!isOpen || !listing) return null;

  const st = statusBadge(listing.status);
  const hasReviews = listing.reviewStats && listing.reviewStats.totalReviews > 0;
  const stock =
    listing.quantity != null && Number.isFinite(Number(listing.quantity))
      ? Number(listing.quantity)
      : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/70"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-view-title"
        className="relative flex max-h-[100dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl ring-1 ring-slate-200/80 sm:max-h-[min(88dvh,820px)] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">Quick view</p>
            <h2 id="quick-view-title" className="truncate text-base font-bold text-slate-900">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </header>

        {/* Tek kaydırma alanı: flex zincirinde min-h-0 şart */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <div className="grid gap-0 sm:grid-cols-2 sm:gap-0">
            <div className="relative border-b border-slate-100 bg-slate-100 sm:border-b-0 sm:border-r">
              <div className="aspect-[4/3] w-full sm:aspect-auto sm:min-h-[220px] sm:max-h-[320px]">
                {listing.imageUrl && !imageBroken ? (
                  <img
                    src={listing.imageUrl}
                    alt=""
                    className="h-full w-full object-cover sm:max-h-[320px]"
                    onError={() => setImageBroken(true)}
                  />
                ) : (
                  <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 text-slate-400">
                    <ImageIcon className="h-10 w-10 opacity-40" />
                    <span className="text-sm font-medium">No photo</span>
                  </div>
                )}
              </div>
              {isInShowcase && (
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow">
                  <Zap className="h-3 w-3 fill-current" />
                  Featured
                </span>
              )}
            </div>

            <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
              <div>
                <p className="text-xs text-slate-500">Price</p>
                <div className="mt-0.5 flex flex-wrap items-end gap-2">
                  <span className="text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">
                    {formatCurrency(price, currency)}
                  </span>
                  {hasCampaign && (
                    <>
                      <span className="text-base font-semibold text-slate-400 line-through tabular-nums">
                        {formatCurrency(listing.price, currency)}
                      </span>
                      {discountPct > 0 && (
                        <span className="mb-0.5 inline-flex items-center gap-0.5 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          <TrendingDown className="h-3 w-3" />
                          -{discountPct}%
                        </span>
                      )}
                    </>
                  )}
                </div>
                {listing.campaignName && hasCampaign && (
                  <p className="mt-1 text-xs font-semibold text-rose-600">{listing.campaignName}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${st.cls}`}>
                  {st.label}
                </span>
                {listing.listingNo && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                    <Hash className="h-3 w-3 opacity-60" />
                    {listing.listingNo}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm text-slate-600">
                {listing.type && (
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Package className="h-4 w-4 shrink-0 text-slate-400" />
                    {listing.type}
                  </span>
                )}
                {listing.city && (
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                    {[listing.city, listing.district].filter(Boolean).join(' · ')}
                  </span>
                )}
                {stock !== null && (
                  <span className="font-medium tabular-nums text-slate-600">
                    <span className="text-slate-400">Stock</span> {stock}
                  </span>
                )}
              </div>

              {(listing.sellerName || listing.sellerSurname) && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {(listing.sellerName || '?')[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase text-slate-500">Seller</p>
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {[listing.sellerName, listing.sellerSurname].filter(Boolean).join(' ')}
                    </p>
                  </div>
                </div>
              )}

              {hasReviews && (
                <div className="flex items-center gap-2">
                  <ListingReviewStats listing={listing} listingId={listing.id} size="md" showIcon showText />
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-4 sm:px-5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Market insights</p>
            <div className="flex flex-wrap gap-2">
              {visibleTabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onInsightChange(id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeInsight === id
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-3 min-h-[200px] rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
              {activeInsight === 'history' && (
                <PriceHistoryTab
                  priceHistory={priceHistory}
                  loading={historyLoading}
                  error={historyError}
                  currency={currency}
                />
              )}
              {activeInsight === 'exchange' && (
                <ExchangeRatesTab
                  key={`${listingId}-${currency}-${price}`}
                  price={price}
                  currency={currency}
                  listingId={listingId}
                />
              )}
              {activeInsight === 'views' && isOwner && (
                <div>
                  {viewStats ? (
                    <ViewStatisticsCard viewStats={viewStats} periodDays={viewStats?.periodDays || 7} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Eye className="mb-2 h-8 w-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-800">No view data</p>
                      <p className="mt-1 max-w-xs text-xs text-slate-500">Open the full listing to collect views.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 flex-col gap-2 border-t border-slate-100 bg-white p-3 sm:flex-row sm:justify-end sm:gap-2 sm:p-4">
          <button
            type="button"
            onClick={onClose}
            className="order-2 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:order-1 sm:w-auto sm:px-4"
          >
            Close
          </button>
          <Link
            to={ROUTES.LISTING_DETAIL(listing.id)}
            onClick={onClose}
            className="order-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 sm:order-2 sm:w-auto sm:px-5"
          >
            Open full page
            <ExternalLink className="h-4 w-4" />
          </Link>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default ListingInfoModal;
