import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '../../common/components/ui/Modal.jsx';
import Button, { buttonClasses } from '../../common/components/ui/Button.jsx';
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
import { MapPin, Hash, ExternalLink, TrendingUp, RefreshCw, Eye, Image as ImageIcon, Zap, ShieldCheck, Star } from 'lucide-react';

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
 cls: 'bg-background-secondary text-status-success-text border-border',
 label: 'Active'
 };
 case LISTING_STATUS.SOLD:
 return {
 cls: 'bg-background-secondary text-status-error-text border-border',
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
 error: historyError
 } = usePriceHistory(listingId, { enabled: isOpen });
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
 if (isOpen) setImageBroken(false);
 }, [isOpen, listingId]);

 useEffect(() => {
 if (!isOpen) return;
 const allowed = visibleTabs.map(t => t.id);
 setActiveInsight(cur => allowed.includes(cur) ? cur : allowed[0] || 'history');
 }, [isOpen, visibleTabs]);

 const onInsightChange = useCallback(id => setActiveInsight(id), []);

 if (!isOpen || !listing) return null;
 const st = statusBadge(listing.status);

 return <Modal isOpen={isOpen} onClose={onClose} title={t("listing_insights")} description={title} size="xl" footer={<>
 <Button variant="secondary" onClick={onClose}>{t("close")}</Button>
 <Link to={ROUTES.LISTING_DETAIL(listing.id)} onClick={onClose} className={buttonClasses('primary')}>
 {t("open_full_page")}
 <ExternalLink className="h-4 w-4" strokeWidth={1.5} aria-hidden />
 </Link>
 </>}>
 <div className="-mx-5 -my-4 bg-background-secondary">
 <div className="grid lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border-light">
 
 {/* Left Column: Flat Product Info */}
 <div className="lg:col-span-4 bg-background-primary p-4 sm:p-5 space-y-4">
 {/* Product Thumbnail */}
 <div className="relative aspect-16/10 w-full rounded overflow-hidden border border-border-light bg-background-secondary">
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
 <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-sm bg-status-warning px-3 py-1 text-xs font-semibold text-white shadow-md">
 <Zap className="h-3 w-3 fill-current text-white" />{t("featured")}
 </span>
 )}
 </div>

 {/* Text Meta Info */}
 <div className="space-y-3.5">
 <div>
 <div className="flex items-center gap-1.5 mb-1.5">
 <span className={`inline-flex rounded-sm px-2 py-0.5 text-xs font-semibold border ${st.cls}`}>
 {st.label}
 </span>
 {listing.listingNo && (
 <span className="inline-flex items-center gap-1 rounded-sm bg-secondary-light px-2 py-0.5 text-xs font-semibold text-text-muted border border-border-light/50">
 <Hash className="h-3 w-3 opacity-60" />
 {listing.listingNo}
 </span>
 )}
 </div>
 <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
 {title}
 </h3>
 </div>

 {/* Price Display */}
 <div className="pt-3 border-t border-border-light">
 <p className="text-xs font-semibold text-text-muted mb-1">{t("price")}</p>
 <div className="flex items-baseline gap-2 flex-wrap">
 <span className="text-xl font-semibold tabular-nums text-text-primary tracking-tight">
 {formatCurrency(price, currency)}
 </span>
 {hasCampaign && (
 <>
 <span className="text-xs font-semibold text-text-muted line-through tabular-nums">
 {formatCurrency(listing.price, currency)}
 </span>
 {discountPct > 0 && (
 <span className="bg-background-secondary text-status-success-text border border-border inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-semibold">
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
 <p className="text-xs font-semibold text-text-muted mb-2">{t("seller")}</p>
 <div className="flex items-center gap-2.5">
 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-text-primary text-xs font-semibold text-text-inverse border border-primary/5 shadow-sm">
 {(listing.sellerName || '?')[0]?.toUpperCase()}
 </div>
 <div className="min-w-0 flex-1">
 <p className="truncate text-xs font-semibold text-text-primary leading-tight">
 {[listing.sellerName, listing.sellerSurname].filter(Boolean).join(' ')}
 </p>
 {sellerStats && (
 <div className="flex items-center gap-1 mt-0.5">
 <Star className="w-3 h-3 text-status-warning fill-status-warning shrink-0" />
 <span className="text-xs font-semibold text-text-primary">{(sellerStats.averageRating ?? 5.0).toFixed(1)}</span>
 <span className="text-xs text-text-muted font-medium">({sellerStats.totalReviews ?? sellerStats.reviewCount ?? 0} {t("reviews")})</span>
 </div>
 )}
 </div>
 </div>
 </div>
 )}

 {/* Location / Escrow Tag */}
 <div className="pt-3 border-t border-border-light space-y-2 text-xs font-semibold text-text-secondary">
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
 <div className="lg:col-span-8 p-4 sm:p-5 flex flex-col min-h-96 bg-background-secondary">
 {/* Tab Switcher segment controller */}
 <div className="flex p-0.5 bg-background-primary border border-border-light rounded self-start">
 {visibleTabs.map(tab => {
 const TabIcon = tab.icon;
 return (
 <button
 key={tab.id}
 type="button"
 onClick={() => onInsightChange(tab.id)}
 className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
 activeInsight === tab.id
 ? 'bg-background-secondary text-text-primary border border-border-light/50 font-semibold'
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
 <div className="mt-4 flex-1 min-h-64 bg-background-primary rounded border border-border-light p-4 sm:p-5">
 {activeInsight === 'history' && (
 <PriceHistoryTab priceHistory={priceHistory} loading={historyLoading} error={historyError} currency={currency} />
 )}
 {activeInsight === 'exchange' && (
 <ExchangeRatesTab key={`${listingId}-${currency}-${price}`} price={price} currency={currency} />
 )}
 {activeInsight === 'views' && isOwner && (
 <div>
 {viewStats ? (
 <ViewStatisticsCard viewStats={viewStats} periodDays={viewStats?.periodDays || 7} />
 ) : (
 <div className="flex flex-col items-center justify-center py-12 text-center">
 <Eye className="mb-2 h-7 w-7 text-text-muted opacity-40" />
 <p className="text-xs font-semibold text-text-primary">{t("no_view_data")}</p>
 <p className="mt-0.5 max-w-xs text-xs text-text-muted">{t("open_the_full_listing_to_collect_views")}</p>
 </div>
 )}
 </div>
 )}
 </div>
 </div>

 </div>
 </div>

 </Modal>
};

export default ListingInfoModal;