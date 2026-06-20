import { useTranslation } from "react-i18next";
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
import { useUserReviewStats } from '../../reviews/hooks/useReviews.js';
import { listingTypeRegistry } from '../config/listingConfig.js';
import { optimizeCloudinaryUrl } from '../../common/utils/imageOptimizer.js';
import { X, MapPin, Package, Hash, ExternalLink, TrendingUp, RefreshCw, Eye, Image as ImageIcon, Zap, TrendingDown, ShieldCheck, Star } from 'lucide-react';
const INSIGHT_TABS = [{
  id: 'history',
  label: 'Price history',
  icon: TrendingUp
}, {
  id: 'exchange',
  label: 'Currency',
  icon: RefreshCw
}, {
  id: 'views',
  label: 'Audience',
  icon: Eye,
  ownerOnly: true
}];
function statusBadge(status) {
  switch (status) {
    case LISTING_STATUS.ACTIVE:
      return {
        cls: 'bg-status-success-bg/15 text-emerald-800 ring-emerald-500/20',
        label: 'Active'
      };
    case LISTING_STATUS.SOLD:
      return {
        cls: 'bg-rose-500/15 text-rose-800 ring-rose-500/20',
        label: 'Sold'
      };
    case LISTING_STATUS.INACTIVE:
      return {
        cls: 'bg-text-muted/20 text-text-primary ring-text-muted/25',
        label: 'Inactive'
      };
    default:
      return {
        cls: 'bg-text-muted/20 text-text-primary ring-text-muted/25',
        label: status || '—'
      };
  }
}
const ListingInfoModal = ({
  isOpen,
  onClose,
  listing,
  displayPrice,
  isOwner,
  viewStats: viewStatsProp,
  isInShowcase = false
}) => {
  const {
    t
  } = useTranslation();
  const [activeInsight, setActiveInsight] = useState('history');
  const [imageBroken, setImageBroken] = useState(false);
  const listingId = listing?.id;
  const {
    priceHistory,
    loading: historyLoading,
    error: historyError,
    fetchPriceHistory
  } = usePriceHistory(listingId);
  const sellerId = listing?.sellerId;
  const {
    stats: sellerStats
  } = useUserReviewStats(sellerId, {
    enabled: !!sellerId && isOpen
  });
  const viewStats = viewStatsProp ?? listing?.viewStats ?? null;
  const currency = listing?.currency ?? 'TRY';
  const rawPrice = displayPrice != null ? displayPrice : listing?.price;
  const priceNum = typeof rawPrice === 'string' ? parseFloat(rawPrice) : Number(rawPrice);
  const price = Number.isFinite(priceNum) ? priceNum : 0;
  const title = listing?.title ?? 'Listing';
  const hasCampaign = listing?.campaignId && listing?.campaignPrice != null && listing?.price != null && parseFloat(listing.campaignPrice) < parseFloat(listing.price);
  const discountPct = useMemo(() => {
    if (!hasCampaign || !listing) return 0;
    return Math.round((1 - parseFloat(listing.campaignPrice) / parseFloat(listing.price)) * 100);
  }, [hasCampaign, listing]);
  const visibleTabs = useMemo(() => INSIGHT_TABS.filter(t => !t.ownerOnly || isOwner), [isOwner]);
  useEffect(() => {
    if (!isOpen || !listingId) return;
    setImageBroken(false);
    fetchPriceHistory();
  }, [isOpen, listingId, fetchPriceHistory]);
  useEffect(() => {
    if (!isOpen) return;
    const allowed = visibleTabs.map(t => t.id);
    setActiveInsight(cur => allowed.includes(cur) ? cur : allowed[0] || 'history');
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
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);
  const onInsightChange = useCallback(id => setActiveInsight(id), []);
  if (!isOpen || !listing) return null;
  const st = statusBadge(listing.status);
  const hasReviews = listing.reviewStats && listing.reviewStats.totalReviews > 0;
  const stock = listing.quantity != null && Number.isFinite(Number(listing.quantity)) ? Number(listing.quantity) : null;
  return createPortal(<div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-text-primary/40 transition-opacity duration-300" aria-label={t("close_dialog")} onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="quick-view-title" className="relative flex max-h-[100dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[28px] bg-background-secondary shadow-2xl ring-1 ring-border-light/80 sm:max-h-[min(88dvh,860px)] sm:rounded-2xl transition-all duration-300" onClick={e => e.stopPropagation()}>
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border-light bg-background-primary px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-indigo-50 px-2.5 py-1 text-caption font-bold uppercase tracking-wider text-primary">
              <TrendingUp className="h-3 w-3" />{t("listing_insights")}</span>
            <h2 id="quick-view-title" className="text-lg font-semibold text-text-primary mt-2 truncate">
              {title}
            </h2>
            <p className="mt-0.5 truncate text-xs font-semibold text-text-muted">{t("price_movement_exchange_conversion_and_p")}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background-secondary border border-border-light text-text-muted hover:text-text-primary hover:bg-secondary-light transition-all shadow-sm">
            <X className="h-4.5 w-4.5" strokeWidth={2.5} />
          </button>
        </header>

        {/* Tek kaydırma alanı: flex zincirinde min-h-0 şart */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <div className="grid gap-0 lg:grid-cols-[310px_minmax(0,1fr)]">
            <div className="relative border-b border-border-light bg-background-primary lg:border-b-0 lg:border-r">
              <div className="aspect-[4/3] w-full sm:aspect-auto sm:h-full sm:min-h-[260px] sm:max-h-[360px] overflow-hidden">
                {listing.imageUrl && !imageBroken ? <img src={optimizeCloudinaryUrl(listing.imageUrl, {
                width: 600,
                height: 450
              })} alt={title} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" onError={() => setImageBroken(true)} /> : <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 text-slate-400">
                    <ImageIcon className="h-10 w-10 opacity-40" />
                    <span className="text-sm font-medium">{t("no_photo")}</span>
                  </div>}
              </div>
              {isInShowcase && <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-status-warning-bg px-2.5 py-1 text-caption font-bold uppercase text-white shadow-sm border border-amber-300/40">
                  <Zap className="h-3 w-3 fill-current" />{t("featured")}</span>}
            </div>

            <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6 bg-background-secondary">
              <div className="rounded-2xl border border-border-light bg-background-primary p-4 shadow-sm">
                <p className="text-caption font-bold uppercase tracking-wider text-text-muted">{t("price")}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2.5">
                  <span className="text-2xl font-bold tabular-nums text-text-primary tracking-tight">
                    {formatCurrency(price, currency)}
                  </span>
                  {hasCampaign && <>
                      <span className="text-sm font-semibold text-text-muted line-through tabular-nums">
                        {formatCurrency(listing.price, currency)}
                      </span>
                      {discountPct > 0 && <span className="bg-status-success-bg text-status-success border border-status-success-border inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-caption font-bold shadow-sm">
                          <TrendingDown className="h-3 w-3" />
                          -{discountPct}%
                        </span>}
                    </>}
                </div>
                {listing.campaignName && hasCampaign && <p className="mt-1 text-caption font-bold text-rose-500">{listing.campaignName}</p>}
              </div>

              {/* Safe Meetup Visual Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-status-success-bg border border-emerald-100 text-emerald-700 text-caption font-bold shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t("escrow_safe_meetup_protected")}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-caption font-bold ring-1 uppercase tracking-wider ${st.cls}`}>
                  {st.label}
                </span>
                {listing.listingNo && <span className="inline-flex items-center gap-1 rounded-full bg-secondary-light px-2.5 py-0.5 text-caption font-bold text-text-muted uppercase tracking-wider">
                    <Hash className="h-3 w-3 opacity-60" />
                    {listing.listingNo}
                  </span>}
              </div>

              {/* Dynamic Category Highlight Badges */}
              {(() => {
              const badges = listingTypeRegistry[listing.type]?.compactBadges?.(listing) || [];
              if (badges.length === 0) return null;
              return <div className="border-t border-border-light pt-4">
                    <p className="text-caption font-bold uppercase tracking-wider text-text-muted mb-2">{t("highlights")}</p>
                    <div className="flex flex-wrap gap-2">
                      {badges.map((badge, idx) => <div key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background-secondary border border-border-light text-caption font-bold text-text-primary shadow-sm">
                          <span className="text-sm shrink-0">{badge.icon}</span>
                          <span>{badge.label}</span>
                        </div>)}
                    </div>
                  </div>;
            })()}

              <div className="flex flex-wrap gap-x-3 gap-y-2 text-body text-text-muted border-t border-border-light pt-4">
                {listing.type && <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-text-muted">
                    <Package className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                    {listing.type}
                  </span>}
                {listing.city && <span className="inline-flex items-center gap-1.5 font-semibold text-text-secondary">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                    {[listing.city, listing.district].filter(Boolean).join(' · ')}
                  </span>}
                {stock !== null && <span className="font-semibold tabular-nums text-text-secondary">
                    <span className="text-text-muted">{t("stock")}</span> {stock}
                  </span>}
              </div>

              {(listing.sellerName || listing.sellerSurname) && <div className="flex items-center justify-between gap-3 rounded-2xl border border-border-light bg-background-secondary p-3.5 shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-text-primary text-xs font-bold text-white shadow-sm">
                      {(listing.sellerName || '?')[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase text-text-muted">{t("seller")}</p>
                      <p className="truncate text-sm font-bold text-text-primary leading-snug">
                        {[listing.sellerName, listing.sellerSurname].filter(Boolean).join(' ')}
                      </p>
                      
                      {/* Real ratings stats in the quick view modal! */}
                      {sellerStats && <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                          <span className="text-caption font-bold text-text-primary">{(sellerStats.averageRating ?? 5.0).toFixed(1)}</span>
                          <span className="text-caption text-text-muted font-medium">({sellerStats.reviewCount ?? 0}{t("reviews")}</span>
                        </div>}
                    </div>
                  </div>
                </div>}

              {hasReviews && <div className="flex items-center gap-2 border-t border-border-light pt-4">
                  <ListingReviewStats listing={listing} listingId={listing.id} size="md" showIcon showText />
                </div>}

              {/* Market Insights nested inside the right column */}
              <div className="rounded-2xl border border-border-light bg-background-primary p-3 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3 px-1">
                  <div>
                    <p className="text-sm font-bold text-text-primary">{t("analytics")}</p>
                    <p className="mt-0.5 text-caption font-semibold text-text-muted">{t("choose_a_signal_to_inspect")}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1 rounded-2xl bg-secondary-light p-1 sm:flex">
                  {visibleTabs.map(tab => {
                  const TabIcon = tab.icon;
                  return <button key={tab.id} type="button" onClick={() => onInsightChange(tab.id)} className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${activeInsight === tab.id ? 'bg-background-primary text-text-primary shadow-sm ring-1 ring-border-light' : 'text-text-muted hover:text-text-primary'}`}>
                      <TabIcon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>;
                })}
                </div>

                <div className="mt-4 min-h-[220px] rounded-2xl border border-border-light bg-background-secondary p-3 sm:p-4">
                  {activeInsight === 'history' && <PriceHistoryTab priceHistory={priceHistory} loading={historyLoading} error={historyError} currency={currency} />}
                  {activeInsight === 'exchange' && <ExchangeRatesTab key={`${listingId}-${currency}-${price}`} price={price} currency={currency} listingId={listingId} />}
                  {activeInsight === 'views' && isOwner && <div>
                      {viewStats ? <ViewStatisticsCard viewStats={viewStats} periodDays={viewStats?.periodDays || 7} /> : <div className="flex flex-col items-center justify-center py-6 text-center">
                          <Eye className="mb-1.5 h-6 w-6 text-slate-300" />
                          <p className="text-xs font-bold text-text-primary">{t("no_view_data")}</p>
                          <p className="mt-0.5 max-w-xs text-caption text-text-muted">{t("open_the_full_listing_to_collect_views")}</p>
                        </div>}
                    </div>}
                </div>
            </div>
          </div>
        </div>
      </div>

        <footer className="flex shrink-0 flex-col gap-2 border-t border-border-light bg-background-primary p-3 sm:flex-row sm:justify-end sm:gap-2 sm:p-4">
          <button type="button" onClick={onClose} className="order-2 w-full rounded-lg border border-border-light py-2.5 text-sm font-semibold text-text-primary hover:bg-background-secondary sm:order-1 sm:w-auto sm:px-4">{t("close")}</button>
          <Link to={ROUTES.LISTING_DETAIL(listing.id)} onClick={onClose} className="order-1 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-text-primary py-2.5 text-sm font-semibold text-white hover:bg-text-primary/90 sm:order-2 sm:w-auto sm:px-5">{t("open_full_page")}<ExternalLink className="h-4 w-4" />
          </Link>
        </footer>
      </div>
    </div>, document.body);
};
export default ListingInfoModal;