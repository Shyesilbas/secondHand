import { useTranslation } from "react-i18next";
import React from 'react';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';
const BulkShowcaseBanner = ({
  onBoostClick
}) => {
  const {
    t
  } = useTranslation();
  return <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="flex-1 space-y-2">
        {/* Minimalist Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.8 bg-slate-200/50 rounded-lg text-caption font-bold uppercase tracking-wider text-slate-600 border border-slate-200/40 select-none">
          <Sparkles className="w-3 h-3 text-slate-500" />{t("bulk_promotion")}</div>
        
        {/* Simple crisp title */}
        <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("boost_your_listing_visibility")}</h2>
        
        {/* Simple quiet description */}
        <p className="text-slate-500 text-xs leading-relaxed max-w-xl">{t("promote")}<strong className="text-slate-800 font-bold">{t("4_or_more_items")}</strong>{t("at_the_same_time_and_instantly_receive_a")}<strong className="text-indigo-600 font-bold">{t("10_discount")}</strong>{t("on_the_total_cost")}</p>

        {/* Quiet labels */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-caption text-slate-500 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            <span>{t("increase_views")}</span>
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full" />
          <div className="flex items-center gap-1.5 text-caption text-slate-500 font-medium">
            <Zap className="w-3.5 h-3.5 text-slate-400" />
            <span>{t("accelerate_checkout")}</span>
          </div>
        </div>
      </div>

      {/* Elegant, clean minimalist button */}
      <button onClick={onBoostClick} className="w-full md:w-auto shrink-0 px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-bold text-xs tracking-wide uppercase transition-colors duration-200 active:scale-98 flex items-center justify-center gap-2 border border-transparent shadow-sm">
        <Zap className="w-3.5 h-3.5 shrink-0" />
        <span>{t("boost_listings")}</span>
      </button>
    </div>;
};
export default BulkShowcaseBanner;