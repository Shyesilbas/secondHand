import { useTranslation } from "react-i18next";
import { memo } from 'react';
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
 <div className="pointer-events-auto rounded-md border border-border-light bg-background-primary overflow-hidden">
 <div className="px-4 py-2.5 bg-background-tertiary border-b border-border-light">
 <div className="flex items-center justify-between gap-3">
 <div className="flex items-center gap-2 min-w-0">
 <div className="p-1.5 bg-primary rounded shrink-0">
 <Scale className="w-4 h-4 text-white" />
 </div>
 <div className="min-w-0">
 <span className="text-sm font-semibold text-text-primary truncate block">{t("compare")}{getListingTypeLabel(category)}
 </span>
 <span className="text-xs text-text-tertiary">{itemCount}{t("of")}{maxItems}{t("selected")}</span>
 </div>
 </div>
 <button type="button" onClick={clearComparison} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-status-error-text hover:bg-background-secondary rounded transition-colors shrink-0">
 <Trash2 className="w-3.5 h-3.5" />{t("clear_all")}</button>
 </div>
 </div>

 <div className="p-3 sm:p-4">
 <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
 <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
 {items.map(item => <div key={item.id} className="relative group flex-shrink-0 w-20 rounded border border-border-light bg-background-secondary/90 overflow-hidden hover:border-primary transition-all">
 <div className="aspect-square relative bg-background-primary">
 {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-background-tertiary">
 <ImageIcon className="w-5 h-5 text-secondary-300" />
 </div>}
 <button type="button" onClick={() => removeFromComparison(item.id)} className="absolute -top-1 -right-1 w-5 h-5 bg-status-error text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-status-error" aria-label={t("remove")}>
 <X className="w-3 h-3" />
 </button>
 </div>
 <div className="px-1.5 py-1.5 border-t border-border-light bg-background-primary">
 <p className="text-xs font-medium text-text-primary truncate leading-tight" title={item.title}>
 {item.title}
 </p>
 <p className="text-xs font-semibold text-primary tabular-nums mt-0.5">
 {formatCurrencyCompact(item.campaignPrice || item.price, item.currency)}
 </p>
 </div>
 </div>)}

 {Array.from({
 length: maxItems - itemCount
 }).map((_, index) => <div key={`empty-${index}`} className="flex-shrink-0 w-20 aspect-3/4 rounded border-2 border-dashed border-border-light bg-background-secondary/40 flex items-center justify-center text-secondary-300">
 <span className="text-xl font-normal leading-none">+</span>
 </div>)}
 </div>

 <div className="flex sm:flex-col flex-shrink-0 justify-center sm:justify-between gap-2 sm:border-l sm:border-border-light sm:pl-4 sm:min-w-32">
 <button type="button" onClick={openModal} disabled={!canCompare} className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-semibold transition-all duration-200
 ${canCompare ? 'bg-primary text-white hover:bg-primary' : 'bg-background-tertiary text-text-muted cursor-not-allowed'}
 `}>
 <Scale className="w-4 h-4 shrink-0" />{t("compare")}</button>
 {!canCompare && <p className="text-center text-xs text-text-muted sm:text-left">{t("add_at_least_2_items")}</p>}
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>;
});
CompareFloatingBar.displayName = 'CompareFloatingBar';
export default CompareFloatingBar;