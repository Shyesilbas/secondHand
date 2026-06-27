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
import PriceHistoryTab from './PriceHistoryTab.jsx';
import { useUserReviewStats } from '../../reviews/hooks/useReviews.js';
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
        cls: 'bg-status-success-bg text-status-success-text border-status-success-border',
        label: 'Active'
      };
    case LISTING_STATUS.SOLD:
      return {
        cls: 'bg-status-error-bg text-status-error-text border-status-error-border',
        label: 'Sold'
      };
    case LISTING_STATUS.INACTIVE:
      return {
        cls: 'bg-secondary-light text-text-muted border-border-light',
        label: 'Inactive'
      };
    default:
      return {
        cls: 'bg-secondary-light text-text-muted border-border-light',
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

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" role="presentation">
      {/* Background Overlay */}
      <button type="button" className="absolute inset-0 bg-text-primary/45 transition-opacity duration-300" aria-label={t("close_dialog")} onClick={onClose} />
      
      {/* Modal Dialog */}
      <div role="dialog" aria-modal="true" aria-labelledby="quick-view-title" className="relative flex max-h-[100dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-background-primary shadow-2xl border border-border-light sm:max-h-[min(88dvh,800px)] sm:rounded-xl transition-all duration-300" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border-light bg-background-primary px-5 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <h2 id="quick-view-title" className="text-base font-bold text-text-primary truncate">
              {t("listing_insights")}
            </h2>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-text-muted">{title}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background-secondary border border-border-light text-text-muted hover:text-text-primary hover:bg-secondary-light transition-all">
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </header>

        {/* Modal Scrollable Container */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-background-secondary">
          <div className="grid lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border-light">
            
            {/* Left Column: Flat Product Info */}
            <div className="lg:col-span-4 bg-background-primary p-4 sm:p-5 space-y-4">
              {/* Product Thumbnail */}
              <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden border border-border-light bg-background-secondary">
                {listing.imageUrl && !imageBroken ? (
                  <img src={optimizeCloudinaryUrl(listing.imageUrl, {
                    width: 480,
                    height: 300
                  })} alt={title} className="h-full w-full object-cover" onError={() => setImageBroken(true)} />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-1.5 text-text-muted">
                    <ImageIcon className="h-8 w-8 opacity-45" />
                    <span className="text-xs font-semibold">{t("no_photo")}</span>
                  </div>
                )}
                {isInShowcase && (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-status-warning-bg px-2.5 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm border border-amber-300/40">
                    <Zap className="h-3 w-3 fill-current" />{t("featured")}
                  </span>
                )}
              </div>

              {/* Text Meta Info */}
              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${st.cls}`}>
                      {st.label}
                    </span>
                    {listing.listingNo && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary-light px-2 py-0.5 text-[10px] font-bold text-text-muted uppercase tracking-wider border border-border-light/50">
                        <Hash className="h-3 w-3 opacity-60" />
                        {listing.listingNo}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-text-primary leading-snug line-clamp-2">
                    {title}
                  </h3>
                </div>

                {/* Price Display */}
                <div className="pt-3 border-t border-border-light">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">{t("price")}</p>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xl font-extrabold tabular-nums text-text-primary tracking-tight">
                      {formatCurrency(price, currency)}
                    </span>
                    {hasCampaign && (
                      <>
                        <span className="text-xs font-semibold text-text-muted line-through tabular-nums">
                          {formatCurrency(listing.price, currency)}
                        </span>
                        {discountPct > 0 && (
                          <span className="bg-status-success-bg text-status-success-text border border-status-success-border inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold">
                            -{discountPct}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Seller Section */}
                {(listing.sellerName || listing.sellerSurname) && (
                  <div className="pt-3 border-t border-border-light">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">{t("seller")}</p>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-text-primary text-xs font-bold text-text-inverse border border-slate-900/5 shadow-sm">
                        {(listing.sellerName || '?')[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-text-primary leading-tight">
                          {[listing.sellerName, listing.sellerSurname].filter(Boolean).join(' ')}
                        </p>
                        {sellerStats && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                            <span className="text-[11px] font-bold text-text-primary">{(sellerStats.averageRating ?? 5.0).toFixed(1)}</span>
                            <span className="text-[11px] text-text-muted font-medium">({sellerStats.reviewCount ?? 0} {t("reviews")})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Location / Escrow Tag */}
                <div className="pt-3 border-t border-border-light space-y-2 text-[11px] font-semibold text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-text-muted" />
                    <span>{[listing.city, listing.district].filter(Boolean).join(' · ')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-status-success-icon" />
                    <span>{t("escrow_safe_meetup_protected")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Insights & Graphs */}
            <div className="lg:col-span-8 p-4 sm:p-5 flex flex-col min-h-[360px] bg-background-secondary">
              {/* Tab Switcher segment controller */}
              <div className="flex p-0.5 bg-background-primary border border-border-light rounded-lg self-start">
                {visibleTabs.map(tab => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => onInsightChange(tab.id)}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                        activeInsight === tab.id
                          ? 'bg-background-secondary text-text-primary shadow-sm border border-border-light/50 font-extrabold'
                          : 'text-text-muted hover:text-text-primary border border-transparent'
                      }`}
                    >
                      <TabIcon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Chart Content Area (Borderless) */}
              <div className="mt-4 flex-1 min-h-[260px] bg-background-primary rounded-xl border border-border-light p-4 sm:p-5 shadow-sm">
                {activeInsight === 'history' && (
                  <PriceHistoryTab priceHistory={priceHistory} loading={historyLoading} error={historyError} currency={currency} />
                )}
                {activeInsight === 'exchange' && (
                  <ExchangeRatesTab key={`${listingId}-${currency}-${price}`} price={price} currency={currency} listingId={listingId} />
                )}
                {activeInsight === 'views' && isOwner && (
                  <div>
                    {viewStats ? (
                      <ViewStatisticsCard viewStats={viewStats} periodDays={viewStats?.periodDays || 7} />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Eye className="mb-2 h-7 w-7 text-text-muted opacity-40" />
                        <p className="text-xs font-bold text-text-primary">{t("no_view_data")}</p>
                        <p className="mt-0.5 max-w-xs text-caption text-text-muted">{t("open_the_full_listing_to_collect_views")}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-border-light bg-background-primary px-5 py-3 sm:px-6">
          <button type="button" onClick={onClose} className="rounded-lg border border-border-light px-4 py-2 text-xs font-bold text-text-primary hover:bg-background-secondary">{t("close")}</button>
          <Link to={ROUTES.LISTING_DETAIL(listing.id)} onClick={onClose} className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-[0.98]">
            {t("open_full_page")}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default ListingInfoModal;