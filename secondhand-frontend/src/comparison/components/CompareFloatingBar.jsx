import { useTranslation } from "react-i18next";
import React, { memo } from 'react';
import { Scale, X, Trash2, Image as ImageIcon } from 'lucide-react';
import { useComparison } from '../hooks/useComparison.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import { formatCurrencyCompact } from '../../common/formatters.js';
const CompareFloatingBar = memo(() => {
  const { t } = useTranslation();
  const {
    items,
    category,
    itemCount,
    maxItems,
    removeFromComparison,
    clearComparison,
    openModal
  } = useComparison();
  const {
    getListingTypeLabel
  } = useEnums();
  if (itemCount === 0) return null;
  const canCompare = itemCount >= 2;
  return <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
            <div className="max-w-4xl mx-auto px-4 pb-4 pt-2">
                <div className="pointer-events-auto rounded-2xl border border-border-light bg-background-primary/95 backdrop-blur-md shadow-[0_-4px_24px_-4px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/5 overflow-hidden">
                    <div className="px-4 py-2.5 bg-gradient-to-r from-indigo-600/08 to-indigo-500/03 border-b border-slate-100">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="p-1.5 bg-primary rounded-lg shadow-sm shadow-indigo-600/20 shrink-0">
                                    <Scale className="w-4 h-4 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-sm font-semibold text-text-primary truncate block">{t("compare")}{getListingTypeLabel(category)}
                                    </span>
                                    <span className="text-xs text-slate-500">{itemCount}{t("of")}{maxItems}{t("selected")}</span>
                                </div>
                            </div>
                            <button type="button" onClick={clearComparison} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors shrink-0">
                                <Trash2 className="w-3.5 h-3.5" />{t("clear_all")}</button>
                        </div>
                    </div>

                    <div className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
                            <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
                                {items.map(item => <div key={item.id} className="relative group flex-shrink-0 w-[4.75rem] rounded-xl border border-border-light bg-slate-50/90 overflow-hidden hover:border-primary hover:shadow-sm transition-all">
                                        <div className="aspect-square relative bg-background-primary">
                                            {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                                    <ImageIcon className="w-5 h-5 text-slate-300" />
                                                </div>}
                                            <button type="button" onClick={() => removeFromComparison(item.id)} className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-rose-700" aria-label={t("remove")}>
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="px-1.5 py-1.5 border-t border-slate-100 bg-background-primary">
                                            <p className="text-caption font-medium text-slate-800 truncate leading-tight" title={item.title}>
                                                {item.title}
                                            </p>
                                            <p className="text-caption font-bold text-primary tabular-nums mt-0.5">
                                                {formatCurrencyCompact(item.campaignPrice || item.price, item.currency)}
                                            </p>
                                        </div>
                                    </div>)}

                                {Array.from({
                length: maxItems - itemCount
              }).map((_, index) => <div key={`empty-${index}`} className="flex-shrink-0 w-[4.75rem] aspect-[3/4] rounded-xl border-2 border-dashed border-border-light bg-slate-50/40 flex items-center justify-center text-slate-300">
                                        <span className="text-xl font-light leading-none">+</span>
                                    </div>)}
                            </div>

                            <div className="flex sm:flex-col flex-shrink-0 justify-center sm:justify-between gap-2 sm:border-l sm:border-slate-100 sm:pl-4 sm:min-w-[8.5rem]">
                                <button type="button" onClick={openModal} disabled={!canCompare} className={`
                                        w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                                        ${canCompare ? 'bg-primary text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/25' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                                    `}>
                                    <Scale className="w-4 h-4 shrink-0" />{t("compare")}</button>
                                {!canCompare && <p className="text-center text-caption text-slate-400 sm:text-left">{t("add_at_least_2_items")}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
});
CompareFloatingBar.displayName = 'CompareFloatingBar';
export default CompareFloatingBar;