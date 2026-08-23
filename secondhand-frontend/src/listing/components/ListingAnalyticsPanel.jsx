import { useTranslation } from "react-i18next";
import React, { useCallback, useState } from 'react';
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
 className="group w-full rounded-3xl border border-slate-200/80 bg-white p-5 text-left transition-all hover:border-slate-300 hover:shadow-xs cursor-pointer shadow-xs"
 >
 {/* Header row */}
 <div className="flex items-center justify-between mb-3.5">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 border border-slate-200 group-hover:scale-105 transition-transform">
 <BarChart3 className="h-5 w-5" />
 </div>
 <div>
 <p className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">{t("market_insights", "Piyasa Analizi")}</p>
 <p className="text-[11px] font-medium text-slate-400 mt-0.5">{t("trends_rates_performance", "Fiyat trendi ve döviz kurları")}</p>
 </div>
 </div>
 <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-slate-900" />
 </div>

 {/* Metric chips */}
 <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
 <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-2.5 py-1 text-[11px] font-extrabold text-slate-700 border border-slate-200/60">
 <TrendingUp className="h-3 w-3 text-slate-900" />
 {t("price_trend", "Fiyat Trendi")}
 </span>
 <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-2.5 py-1 text-[11px] font-extrabold text-slate-700 border border-slate-200/60">
 <RefreshCw className="h-3 w-3 text-slate-900" />
 {t("currency_rates", "Döviz Kurları")}
 </span>
 {isOwner && (
 <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-2.5 py-1 text-[11px] font-extrabold text-slate-700 border border-slate-200/60">
 <Eye className="h-3 w-3 text-amber-500" />
 {listing.viewCount || 0} {t("views", "Görüntülenme")}
 </span>
 )}
 {price != null && (
 <span className="ml-auto inline-flex items-center rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-900 border border-slate-300">
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