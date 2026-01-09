import React, { useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { X, Scale, ExternalLink, Image as ImageIcon, Award, TrendingDown, Check } from 'lucide-react';
import { useComparison } from '../hooks/useComparison.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import { formatCurrency, formatDate } from '../../common/formatters.js';
import { getFieldsForCategory, calculateHighlights, HIGHLIGHT_RULES } from '../config/comparisonFieldsConfig.js';
import { ROUTES } from '../../common/constants/routes.js';

const CompareModal = memo(() => {
    const { items, category, isModalOpen, closeModal, removeFromComparison } = useComparison();
    const { enums, getListingTypeLabel } = useEnums();

    const fields = useMemo(() => getFieldsForCategory(category), [category]);
    const highlights = useMemo(() => calculateHighlights(items, fields), [items, fields]);

    const getEnumLabel = (enumKey, value) => {
        if (!value) return null;
        const list = enums?.[enumKey] || [];
        const found = list.find((o) => o.value === value);
        return found?.label || value;
    };

    const formatValue = (field, item) => {
        const rawValue = field.getValue ? field.getValue(item) : item[field.key];

        if (rawValue === null || rawValue === undefined) {
            return <span className="text-text-muted">—</span>;
        }

        switch (field.type) {
            case 'currency':
                return formatCurrency(rawValue, item.currency);

            case 'number':
                const numVal = field.format === 'locale'
                    ? Number(rawValue).toLocaleString('tr-TR')
                    : rawValue;
                return `${numVal}${field.suffix || ''}`;

            case 'enum':
                return getEnumLabel(field.enumKey, rawValue) || rawValue;

            case 'boolean':
                const boolVal = field.invert ? !rawValue : rawValue;
                return boolVal ? (
                    <span className="inline-flex items-center gap-1 text-status-success-text">
                        <Check className="w-3.5 h-3.5" />
                        Yes
                    </span>
                ) : (
                    <span className="text-text-secondary">No</span>
                );

            case 'date':
                return formatDate(rawValue);

            default:
                return String(rawValue);
        }
    };

    const isHighlighted = (field, itemId) => {
        return highlights[field.key]?.includes(itemId);
    };

    const getHighlightIcon = (field) => {
        if (field.highlight === HIGHLIGHT_RULES.LOWEST) {
            return <TrendingDown className="w-3 h-3" />;
        }
        if (field.highlight === HIGHLIGHT_RULES.HIGHEST || field.highlight === HIGHLIGHT_RULES.BOOLEAN_TRUE) {
            return <Award className="w-3 h-3" />;
        }
        return null;
    };

    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeModal}
            />

            <div className="absolute inset-4 md:inset-8 lg:inset-12 flex items-center justify-center">
                <div className="relative w-full h-full max-w-7xl bg-background-primary rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border-light">
                    <div className="flex-shrink-0 px-6 py-4 border-b border-border-light bg-gradient-to-r from-accent-indigo-600/5 to-transparent">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent-indigo-600 rounded-xl">
                                    <Scale className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-text-primary">
                                        Compare {getListingTypeLabel(category)}
                                    </h2>
                                    <p className="text-sm text-text-secondary">
                                        {items.length} items selected
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-10 bg-background-primary shadow-sm">
                                <tr>
                                    <th className="w-48 p-4 text-left bg-secondary-50 border-b border-r border-border-light">
                                        <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                                            Specification
                                        </span>
                                    </th>
                                    {items.map((item) => (
                                        <th 
                                            key={item.id}
                                            className="min-w-[200px] p-4 border-b border-r border-border-light last:border-r-0 bg-background-primary"
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="relative group mb-3">
                                                    <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-border-light group-hover:border-accent-indigo-300 transition-colors">
                                                        {item.imageUrl ? (
                                                            <img
                                                                src={item.imageUrl}
                                                                alt={item.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-secondary-50">
                                                                <ImageIcon className="w-8 h-8 text-text-muted" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromComparison(item.id)}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-status-error-DEFAULT text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-status-error-hover"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <h3 className="text-sm font-semibold text-text-primary text-center line-clamp-2 mb-1" title={item.title}>
                                                    {item.title}
                                                </h3>
                                                <Link
                                                    to={ROUTES.LISTING_DETAIL(item.id)}
                                                    onClick={closeModal}
                                                    className="inline-flex items-center gap-1 text-xs text-accent-indigo-600 hover:text-accent-indigo-700 font-medium"
                                                >
                                                    View Details
                                                    <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((field, fieldIndex) => (
                                    <tr 
                                        key={field.key}
                                        className={fieldIndex % 2 === 0 ? 'bg-background-primary' : 'bg-secondary-50/50'}
                                    >
                                        <td className="p-4 border-r border-border-light">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-text-secondary">
                                                    {field.label}
                                                </span>
                                                {field.highlight !== HIGHLIGHT_RULES.NONE && (
                                                    <span className="text-accent-emerald-DEFAULT opacity-60">
                                                        {getHighlightIcon(field)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        {items.map((item) => {
                                            const highlighted = isHighlighted(field, item.id);
                                            return (
                                                <td 
                                                    key={item.id}
                                                    className={`
                                                        p-4 text-center border-r border-border-light last:border-r-0 transition-colors
                                                        ${highlighted ? 'bg-accent-emerald-DEFAULT/10' : ''}
                                                    `}
                                                >
                                                    <div className={`
                                                        text-sm
                                                        ${highlighted 
                                                            ? 'font-bold text-accent-emerald-DEFAULT' 
                                                            : 'text-text-primary'
                                                        }
                                                        ${field.key === 'price' ? 'text-base font-bold' : ''}
                                                    `}>
                                                        {highlighted && field.highlight !== HIGHLIGHT_RULES.BOOLEAN_TRUE && (
                                                            <span className="inline-flex items-center gap-1">
                                                                <Award className="w-3.5 h-3.5" />
                                                                {formatValue(field, item)}
                                                            </span>
                                                        )}
                                                        {!highlighted && formatValue(field, item)}
                                                        {highlighted && field.highlight === HIGHLIGHT_RULES.BOOLEAN_TRUE && formatValue(field, item)}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex-shrink-0 px-6 py-4 border-t border-border-light bg-secondary-50/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-text-secondary">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded bg-accent-emerald-DEFAULT/20 border border-accent-emerald-DEFAULT/30" />
                                    <span>Best value highlighted</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Award className="w-3.5 h-3.5 text-accent-emerald-DEFAULT" />
                                    <span>Highest/Best</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <TrendingDown className="w-3.5 h-3.5 text-accent-emerald-DEFAULT" />
                                    <span>Lowest (better)</span>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

CompareModal.displayName = 'CompareModal';

export default CompareModal;

