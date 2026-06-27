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
  const {
    t
  } = useTranslation();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const openInfo = useCallback(() => setIsInfoOpen(true), []);
  const closeInfo = useCallback(() => setIsInfoOpen(false), []);
  if (!listing) return null;
  const price = displayPrice != null ? displayPrice : listing?.price;
  return <div className="mt-5">
      <button type="button" onClick={openInfo} className="group w-full rounded-xl border border-border-light bg-background-primary p-4 sm:p-5 text-left transition-all hover:border-primary/80 hover:shadow-sm">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary group-hover:bg-primary/10 transition-colors">
              <BarChart3 className="h-[18px] w-[18px]" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{t("market_insights")}</p>
              <p className="text-caption font-medium text-text-muted mt-0.5">{t("trends_rates_performance")}</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>

        {/* Metric chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-background-secondary px-2.5 py-1.5 text-caption font-bold text-text-secondary border border-border-light">
            <TrendingUp className="h-3 w-3 text-emerald-500" />{t("price_trend")}</span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-background-secondary px-2.5 py-1.5 text-caption font-bold text-text-secondary border border-border-light">
            <RefreshCw className="h-3 w-3 text-primary" />{t("currency_rates")}</span>
          {isOwner && <span className="inline-flex items-center gap-1.5 rounded-lg bg-background-secondary px-2.5 py-1.5 text-caption font-bold text-text-secondary border border-border-light">
              <Eye className="h-3 w-3 text-amber-500" />
              {listing.viewCount || 0}{t("views")}</span>}
          {price != null && <span className="ml-auto inline-flex items-center rounded-lg bg-primary-light px-2.5 py-1 text-caption font-bold text-primary border border-primary/20">
              {formatCurrency(price, listing.currency)}
            </span>}
        </div>
      </button>

      <ListingInfoModal isOpen={isInfoOpen} onClose={closeInfo} listing={listing} displayPrice={displayPrice} isOwner={isOwner} />
    </div>;
};
export default ListingAnalyticsPanel;