import { useTranslation } from "react-i18next";
import { useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { X, ExternalLink, Image as ImageIcon, Award, TrendingDown, Check } from 'lucide-react';
import { Button, Modal } from '../../common/components/ui/index.js';
import { useComparison } from '../hooks/useComparison.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import { formatCurrency, formatDate, parsePrice } from '../../common/formatters.js';
import { getFieldsForCategory, calculateHighlights, HIGHLIGHT_RULES } from '../config/comparisonFieldsConfig.js';
import { ROUTES } from '../../common/constants/routes.js';
const emptyCell = <span className="text-text-muted">—</span>;

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
 return boolVal ? <span className="inline-flex items-center gap-1 text-text-primary">
 <Check className="w-3.5 h-3.5" />{t("yes")}</span> : <span className="text-text-tertiary">{t("no")}</span>;
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
 return <Modal isOpen={isModalOpen} onClose={closeModal} title={`${t("compare")} (${getListingTypeLabel(category)}) · ${items.length} ${t("items_selected")}`} size="2xl" footer={<>
 <p className="mr-auto flex flex-wrap items-center gap-x-4 gap-y-1 self-center text-xs text-text-tertiary">
 <span className="inline-flex items-center gap-1"><Award className="h-4 w-4 text-status-success" strokeWidth={1.5} aria-hidden />{t("highest_best")}</span>
 <span className="inline-flex items-center gap-1"><TrendingDown className="h-4 w-4 text-status-success" strokeWidth={1.5} aria-hidden />{t("lowest_better")}</span>
 </p>
 <Button variant="secondary" onClick={closeModal}>{t("close")}</Button>
 </>}>
 <div className="-mx-5 -my-4">
 <table className="w-full border-collapse text-sm">
 <thead className="sticky top-0 z-10 bg-background-secondary border-b border-border-light">
 <tr>
 <th className="w-44 lg:w-52 p-3 sm:p-4 text-left align-bottom">
 <span className="text-xs font-semibold text-text-tertiary">{t("specification")}</span>
 </th>
 {items.map(item => <th key={item.id} className="min-w-44 p-3 sm:p-4 border-l border-border-light align-bottom">
 <div className="flex flex-col items-center gap-2">
 <div className="relative group w-full max-w-28">
 <div className="aspect-square overflow-hidden rounded border border-border-light bg-background-tertiary">
 {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">
 <ImageIcon className="h-5 w-5 text-text-muted" strokeWidth={1.5} />
 </div>}
 </div>
 <button type="button" onClick={() => removeFromComparison(item.id)} className="absolute right-1 top-1 rounded border border-border bg-background-primary p-1 text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus" aria-label={t("remove_from_comparison")}>
 <X className="h-4 w-4" strokeWidth={1.5} />
 </button>
 </div>
 <h3 className="text-sm font-medium text-text-primary line-clamp-2 w-full" title={item.title}>
 {item.title}
 </h3>
 <Link to={ROUTES.LISTING_DETAIL(item.id)} onClick={closeModal} className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-text-primary">{t("view_details")}<ExternalLink className="h-4 w-4" strokeWidth={1.5} />
 </Link>
 </div>
 </th>)}
 </tr>
 </thead>
 <tbody className="divide-y divide-border-light">
 {fields.map(field => <tr key={field.key}>
 <td className="p-3 sm:p-4 align-middle">
 <div className="flex items-center gap-2">
 <span className="font-medium text-text-secondary">{field.label}</span>
 {field.highlight !== HIGHLIGHT_RULES.NONE && <span className="opacity-70">{getHighlightIcon(field)}</span>}
 </div>
 </td>
 {items.map(item => {
 const highlighted = isHighlighted(field, item.id);
 const content = formatValue(field, item);
 const showAward = highlighted && field.highlight !== HIGHLIGHT_RULES.BOOLEAN_TRUE;
 return <td key={item.id} className="p-3 sm:p-4 text-center align-middle border-l border-border-light">
 <div className={`${highlighted ? 'font-semibold text-text-primary' : 'text-text-primary'}
 ${field.key === 'price' ? 'text-base font-semibold text-text-primary' : ''}
 `}>
 {showAward ? <span className="inline-flex items-center justify-center gap-1.5 flex-wrap">
 <Award className="h-4 w-4 shrink-0 text-status-success" strokeWidth={1.5} aria-label={t("highest_best")} />
 <span className="min-w-0">{content}</span>
 </span> : content}
 </div>
 </td>;
 })}
 </tr>)}
 </tbody>
 </table>
 </div>
 </Modal>;
});
CompareModal.displayName = 'CompareModal';
export default CompareModal;
