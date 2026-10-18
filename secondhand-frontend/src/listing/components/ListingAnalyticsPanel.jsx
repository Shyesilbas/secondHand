import { useTranslation } from "react-i18next";
import { useCallback, useState } from 'react';
import { BarChart3, ChevronRight, Eye, RefreshCw, TrendingUp } from 'lucide-react';
import ListingInfoModal from './ListingInfoModal.jsx';
import { formatCurrency } from '../../common/formatters.js';

const ListingAnalyticsPanel = ({
 listing,
 isOwner,
 displayPrice
}) => {
 const { t } = useTranslation();
 const [isInfoOpen, setIsInfoOpen] = useState(false);
 const openInfo = useCallback(() => setIsInfoOpen(true), []);
 const closeInfo = useCallback(() => setIsInfoOpen(false), []);

 if (!listing) return null;
 const price = displayPrice != null ? displayPrice : listing?.price;

 return (
 <div className="mt-4">
 <button
 type="button"
 onClick={openInfo}
 className="group w-full rounded-md border border-border/80 bg-white p-5 text-left transition-all hover:border-card-border-hover cursor-pointer"
 >
 {/* Header row */}
 <div className="flex items-center justify-between mb-3.5">
 <div className="flex items-center gap-3">
 <BarChart3 className="shrink-0 h-5 w-5 text-text-primary" strokeWidth={1.5} aria-hidden />
 <div>
 <p className="text-xs font-semibold text-text-primary">{t("market_insights", "Piyasa Analizi")}</p>
 <p className="text-xs font-medium text-text-muted mt-0.5">{t("trends_rates_performance", "Fiyat trendi ve döviz kurları")}</p>
 </div>
 </div>
 <ChevronRight className="h-4 w-4 shrink-0 text-text-muted transition-all group-hover:text-text-primary" />
 </div>

 {/* Metric chips */}
 <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border-light">
 <span className="inline-flex items-center gap-1.5 rounded bg-background-secondary px-2.5 py-1 text-xs font-semibold text-text-secondary border border-border/60">
 <TrendingUp className="h-3 w-3 text-text-primary" />
 {t("price_trend", "Fiyat Trendi")}
 </span>
 <span className="inline-flex items-center gap-1.5 rounded bg-background-secondary px-2.5 py-1 text-xs font-semibold text-text-secondary border border-border/60">
 <RefreshCw className="h-3 w-3 text-text-primary" />
 {t("currency_rates", "Döviz Kurları")}
 </span>
 {isOwner && (
 <span className="inline-flex items-center gap-1.5 rounded bg-background-secondary px-2.5 py-1 text-xs font-semibold text-text-secondary border border-border/60">
 <Eye className="h-3 w-3 text-status-warning" />
 {listing.viewCount || 0} {t("views", "Görüntülenme")}
 </span>
 )}
 {price != null && (
 <span className="ml-auto inline-flex items-center rounded bg-background-tertiary px-2.5 py-1 text-xs font-semibold text-text-primary border border-card-border-hover">
 {formatCurrency(price, listing.currency)}
 </span>
 )}
 </div>
 </button>

 <ListingInfoModal isOpen={isInfoOpen} onClose={closeInfo} listing={listing} displayPrice={displayPrice} isOwner={isOwner} />
 </div>
 );
};

export default ListingAnalyticsPanel;