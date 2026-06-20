import { useTranslation } from "react-i18next";
import React, { useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { X, Scale, ExternalLink, Image as ImageIcon, Award, TrendingDown, Check } from 'lucide-react';
import { useComparison } from '../hooks/useComparison.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import { formatCurrency, formatDate, parsePrice } from '../../common/formatters.js';
import { getFieldsForCategory, calculateHighlights, HIGHLIGHT_RULES } from '../config/comparisonFieldsConfig.js';
import { ROUTES } from '../../common/constants/routes.js';
const emptyCell = <span className="text-slate-400">—</span>;

/** Safe display for text fields and nested label-like API objects. */
const toDisplayString = value => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map(v => toDisplayString(v)).filter(Boolean).join(', ');
  }
  if (typeof value === 'object') {
    const s = value.label ?? value.name ?? value.title ?? value.modelName ?? value.displayName;
    if (s != null && s !== '') return String(s);
    if (value.value != null && (typeof value.value === 'string' || typeof value.value === 'number')) {
      return String(value.value);
    }
    return '';
  }
  return String(value);
};
const CompareModal = memo(() => {
  const { t } = useTranslation();
  const {
    items,
    category,
    isModalOpen,
    closeModal,
    removeFromComparison
  } = useComparison();
  const {
    enums,
    getListingTypeLabel
  } = useEnums();
  const fields = useMemo(() => getFieldsForCategory(category), [category]);
  const highlights = useMemo(() => calculateHighlights(items, fields), [items, fields]);
  const getEnumLabel = (enumKey, value) => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'object') {
      return value.label || value.name || value.value || value.id || null;
    }
    const list = enums?.[enumKey] || [];
    const found = list.find(o => (o.id || o.value) === value);
    return found?.label || found?.name || value;
  };
  const formatValue = (field, item) => {
    const rawValue = field.getValue ? field.getValue(item) : item[field.key];
    if (rawValue === null || rawValue === undefined || rawValue === '') {
      return emptyCell;
    }
    switch (field.type) {
      case 'currency':
        return formatCurrency(rawValue, item.currency);
      case 'number':
        {
          let num = typeof rawValue === 'number' && Number.isFinite(rawValue) ? rawValue : NaN;
          if (!Number.isFinite(num) && typeof rawValue === 'string') {
            num = parsePrice(rawValue) ?? NaN;
          }
          if (!Number.isFinite(num) && typeof rawValue === 'object' && rawValue !== null) {
            num = Number(rawValue.value ?? rawValue.amount);
          }
          if (!Number.isFinite(num)) {
            const fb = toDisplayString(rawValue);
            return fb ? <span>{fb}</span> : emptyCell;
          }
          const numVal = field.format === 'locale' ? num.toLocaleString('tr-TR') : String(num);
          return `${numVal}${field.suffix || ''}`;
        }
      case 'enum':
        {
          const label = getEnumLabel(field.enumKey, rawValue);
          if (label != null && label !== '') {
            return typeof label === 'string' ? label : toDisplayString(label) || emptyCell;
          }
          const fb = toDisplayString(rawValue);
          return fb ? <span>{fb}</span> : emptyCell;
        }
      case 'boolean':
        {
          const boolVal = field.invert ? !rawValue : rawValue;
          return boolVal ? <span className="inline-flex items-center gap-1 text-emerald-700">
                        <Check className="w-3.5 h-3.5" />{t("yes")}</span> : <span className="text-slate-500">{t("no")}</span>;
        }
      case 'date':
        return formatDate(rawValue);
      case 'text':
        {
          const s = toDisplayString(rawValue);
          return s ? <span>{s}</span> : emptyCell;
        }
      default:
        {
          const s = toDisplayString(rawValue);
          return s ? <span>{s}</span> : emptyCell;
        }
    }
  };
  const isHighlighted = (field, itemId) => {
    return highlights[field.key]?.includes(itemId);
  };
  const getHighlightIcon = field => {
    if (field.highlight === HIGHLIGHT_RULES.LOWEST) {
      return <TrendingDown className="w-3 h-3 text-status-success" />;
    }
    if (field.highlight === HIGHLIGHT_RULES.HIGHEST || field.highlight === HIGHLIGHT_RULES.BOOLEAN_TRUE) {
      return <Award className="w-3 h-3 text-status-success" />;
    }
    return null;
  };
  if (!isModalOpen) return null;
  return <div className="fixed inset-0 z-[100] overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm" onClick={closeModal} aria-hidden />

            <div className="absolute inset-3 sm:inset-6 lg:inset-10 flex items-center justify-center p-2">
                <div role="dialog" aria-modal="true" className="relative w-full max-w-7xl max-h-[min(92vh,900px)] bg-background-primary rounded-2xl shadow-2xl shadow-slate-900/20 flex flex-col overflow-hidden border border-border-light/90 ring-1 ring-slate-900/5">
                    <div className="flex-shrink-0 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-white to-white">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2.5 bg-primary rounded-xl shadow-md shadow-indigo-600/25 shrink-0">
                                    <Scale className="w-5 h-5 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-lg font-semibold text-text-primary truncate">{t("compare")}{getListingTypeLabel(category)}
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        {items.length}{t("items_selected")}</p>
                                </div>
                            </div>
                            <button type="button" onClick={closeModal} className="p-2 text-slate-500 hover:text-text-primary hover:bg-slate-100 rounded-xl transition-colors shrink-0" aria-label={t("close")}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto min-h-0">
                        <table className="w-full border-collapse text-sm">
                            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-border-light">
                                <tr>
                                    <th className="w-44 lg:w-52 p-3 sm:p-4 text-left align-bottom">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t("specification")}</span>
                                    </th>
                                    {items.map(item => <th key={item.id} className="min-w-[180px] p-3 sm:p-4 border-l border-slate-100 align-bottom">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="relative group w-full max-w-[7.5rem]">
                                                    <div className="aspect-square rounded-xl overflow-hidden border border-border-light bg-slate-100 shadow-sm group-hover:border-primary transition-colors">
                                                        {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">
                                                                <ImageIcon className="w-8 h-8 text-slate-300" />
                                                            </div>}
                                                    </div>
                                                    <button type="button" onClick={() => removeFromComparison(item.id)} className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-rose-700" aria-label={t("remove_from_comparison")}>
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <h3 className="text-sm font-medium text-text-primary line-clamp-2 w-full" title={item.title}>
                                                    {item.title}
                                                </h3>
                                                <Link to={ROUTES.LISTING_DETAIL(item.id)} onClick={closeModal} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary">{t("view_details")}<ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </th>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {fields.map(field => <tr key={field.key} className="bg-background-primary even:bg-slate-50/40">
                                        <td className="p-3 sm:p-4 align-middle">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-600">{field.label}</span>
                                                {field.highlight !== HIGHLIGHT_RULES.NONE && <span className="opacity-70">{getHighlightIcon(field)}</span>}
                                            </div>
                                        </td>
                                        {items.map(item => {
                  const highlighted = isHighlighted(field, item.id);
                  const content = formatValue(field, item);
                  const showAward = highlighted && field.highlight !== HIGHLIGHT_RULES.BOOLEAN_TRUE;
                  return <td key={item.id} className={`
                                                        p-3 sm:p-4 text-center align-middle border-l border-slate-100
                                                        ${highlighted ? 'bg-status-success-bg/80' : ''}
                                                    `}>
                                                    <div className={`
                                                            ${highlighted ? 'font-semibold text-emerald-800' : 'text-slate-800'}
                                                            ${field.key === 'price' ? 'text-base font-bold text-text-primary' : ''}
                                                        `}>
                                                        {showAward ? <span className="inline-flex items-center justify-center gap-1.5 flex-wrap">
                                                                <Award className="w-3.5 h-3.5 shrink-0 text-status-success" />
                                                                <span className="min-w-0">{content}</span>
                                                            </span> : content}
                                                    </div>
                                                </td>;
                })}
                                    </tr>)}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex-shrink-0 px-5 py-3 border-t border-slate-100 bg-slate-50/80">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded bg-status-success-bg border border-emerald-200/80" />
                                    <span>{t("best_value_highlighted")}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Award className="w-3.5 h-3.5 text-status-success" />
                                    <span>{t("highest_best")}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <TrendingDown className="w-3.5 h-3.5 text-status-success" />
                                    <span>{t("lowest_better")}</span>
                                </div>
                            </div>
                            <button type="button" onClick={closeModal} className="self-end sm:self-auto px-4 py-2 text-sm font-medium text-slate-700 hover:text-text-primary bg-background-primary border border-border-light hover:bg-slate-50 rounded-xl transition-colors">{t("close")}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
});
CompareModal.displayName = 'CompareModal';
export default CompareModal;